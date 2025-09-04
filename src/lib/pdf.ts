import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"
import { existsSync, lstatSync, readdirSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

async function findExecutableInDir(dir: string): Promise<string | undefined> {
  const candidates = [
    'chrome.exe',
    'chromium.exe',
    'Google\\Chrome\\Application\\chrome.exe',
    'Chromium\\Application\\chrome.exe'
  ]

  // Check candidates directly inside dir and one level deeper
  for (const c of candidates) {
    const p = join(dir, c)
    if (existsSync(p) && lstatSync(p).isFile()) return p
  }

  // Try scanning directory entries (one level) for exe files
  try {
    const entries = readdirSync(dir)
    for (const e of entries) {
      const p = join(dir, e)
      try {
        if (lstatSync(p).isFile() && (e.toLowerCase().endsWith('.exe') || e.toLowerCase().includes('chrome') || e.toLowerCase().includes('chromium'))) {
          return p
        }
        // check common subpaths
        const subCandidates = [
          join(p, 'chrome.exe'),
          join(p, 'Chromium', 'Application', 'chrome.exe'),
          join(p, 'Google', 'Chrome', 'Application', 'chrome.exe')
        ]
        for (const sc of subCandidates) {
          if (existsSync(sc) && lstatSync(sc).isFile()) return sc
        }
      } catch {
        // ignore unreadable entries
      }
    }
  } catch {
    // ignore
  }

  return undefined
}

async function resolveExecutablePath(): Promise<string> {
  const envPath = process.env.CHROME_EXECUTABLE_PATH
  if (envPath && existsSync(envPath)) {
    const stat = lstatSync(envPath)
    if (stat.isFile()) return envPath
    if (stat.isDirectory()) {
      const found = await findExecutableInDir(envPath)
      if (found) return found
      console.error(`CHROME_EXECUTABLE_PATH points to a directory but no chrome executable was found inside it: ${envPath}`)
    }
  }

  // Try sparticuz chromium extraction path
  try {
    const candidate = await chromium.executablePath()
    if (!candidate) throw new Error('sparticuz.chromium returned empty path')
    if (existsSync(candidate)) {
      const stat = lstatSync(candidate)
      if (stat.isFile()) return candidate
      if (stat.isDirectory()) {
        const found = await findExecutableInDir(candidate)
        if (found) return found
        throw new Error(`chromium.executablePath() returned a directory (${candidate}) and no executable was found inside it`)
      }
    }
    throw new Error(`chromium.executablePath() returned '${candidate}' which does not exist`)
  } catch (err: any) {
    const msg = `Could not resolve a Chrome/Chromium executable path. Tried CHROME_EXECUTABLE_PATH='${process.env.CHROME_EXECUTABLE_PATH}'. @sparticuz/chromium error: ${err?.message || err}`
    console.error(msg)
    throw new Error(msg)
  }
}

export async function renderResumeToPdf(html: string) {
  const executablePath = await resolveExecutablePath()
  if (!executablePath) throw new Error('No chromium executable found')

  const browser = await puppeteer.launch({
    args: [...chromium.args, '--no-sandbox'],
    executablePath,
    headless: true,
  })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const buffer = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()
  return buffer
}

export async function uploadToVercelBlob(buffer: Buffer, fileName: string, token: string) {
  // Try Vercel Blob upload if token provided
  const vercelToken = token || process.env.VERCEL_TOKEN
  if (vercelToken) {
    try {
      const res = await fetch(`https://api.vercel.com/v1/blob`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fileName, size: buffer.length }),
      })
      const json = await res.json()
      if (res.ok && json?.uploadURL && json?.url) {
        // upload via put
        const uploadRes = await fetch(json.uploadURL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/pdf' },
          body: new Uint8Array(buffer),
        })
        if (uploadRes.ok) return json.url
        console.error('Vercel upload PUT failed', await uploadRes.text())
      } else {
        console.error('Vercel create blob failed', JSON.stringify(json))
      }
      // fallthrough to local save
    } catch (err) {
      console.error('Vercel upload error:', err)
      // fallthrough to local save
    }
  } else {
    console.warn('VERCEL_TOKEN not set, falling back to saving PDF locally')
  }

  // Fallback: save PDF to public/pdfs so Next can serve it directly
  try {
    const publicDir = join(process.cwd(), 'public')
    const pdfDir = join(publicDir, 'pdfs')
    if (!existsSync(publicDir)) mkdirSync(publicDir)
    if (!existsSync(pdfDir)) mkdirSync(pdfDir)
    const outPath = join(pdfDir, fileName)
    writeFileSync(outPath, buffer)
    const baseUrl = process.env.NEXTAUTH_URL || ''
    const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}/pdfs/${fileName}` : `/pdfs/${fileName}`
    console.warn('Saved PDF locally to', outPath)
    return url
  } catch (err) {
    console.error('Failed to save PDF locally as fallback:', err)
    throw err
  }
}
