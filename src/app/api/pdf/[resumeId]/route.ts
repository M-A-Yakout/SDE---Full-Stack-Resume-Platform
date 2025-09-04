import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { renderResumeToPdf, uploadToVercelBlob } from '@/lib/pdf'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

  // `params` is async in some Next.js runtimes — await it before using its properties
  const { params } = context
  const { resumeId } = await params
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { user: true }
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    if (resume.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Generate HTML template for the PDF
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 40px;
              color: #333;
            }
            h1 {
              color: #2c3e50;
              margin-bottom: 20px;
            }
            h2 {
              color: #34495e;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 5px;
              margin-top: 25px;
            }
            .personal-info {
              margin-bottom: 30px;
            }
            .contact {
              color: #7f8c8d;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 30px;
            }
            .entry {
              margin-bottom: 20px;
            }
            .entry-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .skills {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
            }
            .skill {
              background: #ecf0f1;
              padding: 5px 10px;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <h1>${resume.title}</h1>

          <div class="personal-info">
            <h2>${resume.personal.fullName}</h2>
              <div class="contact">
                ${resume.personal.email || ''}
                ${resume.personal.phone ? ` | ${resume.personal.phone}` : ''}
                ${resume.personal.location ? ` | ${resume.personal.location}` : ''}
                ${resume.personal.linkedin ? ` | <a href="${resume.personal.linkedin}" target="_blank">LinkedIn</a>` : ''}
                ${resume.personal.github ? ` | <a href="${resume.personal.github}" target="_blank">GitHub</a>` : ''}
              </div>
            ${resume.personal.summary ? `<p>${resume.personal.summary}</p>` : ''}
          </div>

          ${resume.experience.length > 0 ? `
            <div class="section">
              <h2>Experience</h2>
              ${resume.experience.map((exp: any) => `
                <div class="entry">
                  <div class="entry-header">
                    <strong>${exp.position} at ${exp.company}</strong>
                    <span>${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}</span>
                  </div>
                  <div>${exp.location || ''}</div>
                  <p>${exp.description}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${resume.education.length > 0 ? `
            <div class="section">
              <h2>Education</h2>
              ${resume.education.map((edu: any) => `
                <div class="entry">
                  <div class="entry-header">
                    <strong>${edu.degree} in ${edu.field}</strong>
                    <span>${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ' - Present'}</span>
                  </div>
                  <div>${edu.school}</div>
                  ${edu.description ? `<p>${edu.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${resume.skills.length > 0 ? `
            <div class="section">
              <h2>Skills</h2>
              <div class="skills">
                ${resume.skills.map((skill: string) => `
                  <span class="skill">${skill}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </body>
      </html>
    `

    // Generate PDF
    const buffer = await renderResumeToPdf(html)
    const pdfUrl = await uploadToVercelBlob(
      Buffer.from(buffer),
      `${resumeId}.pdf`,
      process.env.VERCEL_TOKEN || ''
    )

    // Update resume with PDF URL
    await prisma.resume.update({
      where: { id: resumeId },
      data: { pdfUrl }
    })

    return NextResponse.json({ pdfUrl })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

// Keep GET endpoint for direct PDF downloads
export async function GET(req: Request, context: any) {
  const { params } = context
  const { resumeId } = await params
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } })
  
  if (!resume?.pdfUrl) {
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 })
  }
  
  return NextResponse.redirect(resume.pdfUrl)
}
