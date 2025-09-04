import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text, field } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid request: text is required' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: OPENAI_API_KEY not set' }, { status: 500 })
    }

    // Create a prompt based on the field type
    const prompt = `Improve the following ${field || 'text'} to be more professional and impactful. Keep the same meaning but make it more compelling: "${text}"`

    let res
    try {
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })
    } catch (err) {
      console.error('OpenAI fetch failed:', err)
      return NextResponse.json({ error: 'Failed to contact OpenAI API' }, { status: 502 })
    }

    let json
    try {
      json = await res.json()
    } catch (err) {
      console.error('Failed to parse OpenAI response:', err)
      return NextResponse.json({ error: 'Invalid response from OpenAI' }, { status: 502 })
    }

    if (!res.ok) {
      console.error('OpenAI API error:', res.status, json)
      const message = json?.error?.message || 'OpenAI API returned an error'
      return NextResponse.json({ error: message }, { status: res.status })
    }

    const improvedText = json.choices?.[0]?.message?.content || text
    return NextResponse.json({ improvedText })
  } catch (err: any) {
    console.error('AI suggestions handler error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}
