import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { resumeData } = body

    // Convert resume data to a format suitable for analysis
    const resumeText = `
Resume Title: ${resumeData.title}

Personal Information:
- Name: ${resumeData.personal.fullName}
- Email: ${resumeData.personal.email}
- Phone: ${resumeData.personal.phone || 'Not provided'}
- Location: ${resumeData.personal.location || 'Not provided'}
- LinkedIn: ${resumeData.personal.linkedin || 'Not provided'}
- GitHub: ${resumeData.personal.github || 'Not provided'}

Professional Summary:
${resumeData.personal.summary || 'Not provided'}

Education:
${resumeData.education.map((edu: any) => `
- ${edu.degree} in ${edu.field}
  ${edu.school}
  ${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}
  ${edu.description || ''}`).join('\n')}

Experience:
${resumeData.experience.map((exp: any) => `
- ${exp.position} at ${exp.company}
  ${exp.location || ''}
  ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
  ${exp.description}`).join('\n')}

Skills:
${resumeData.skills.join(', ')}
`

    const prompt = `You are an expert resume reviewer with extensive experience in HR and recruitment. Please analyze the following resume and provide a detailed evaluation covering these aspects:

1. Overall Impact (20 points):
   - First impression
   - Visual organization
   - Professional presentation

2. Content Quality (30 points):
   - Clarity and relevance of experience
   - Achievement focus
   - Quantifiable results

3. Skills Alignment (20 points):
   - Market relevance
   - Technical depth
   - Skill presentation

4. Education & Certifications (15 points):
   - Relevance to career goals
   - Academic achievements
   - Professional development

5. Writing & Grammar (15 points):
   - Language clarity
   - Professional tone
   - Error-free content

For each category:
- Provide a score
- Give specific feedback
- Suggest improvements

Resume to analyze:
${resumeText}

Please format your response in this structure:
{
  "overall_score": number (0-100),
  "categories": {
    "overall_impact": { "score": number, "feedback": string, "suggestions": string[] },
    "content_quality": { "score": number, "feedback": string, "suggestions": string[] },
    "skills_alignment": { "score": number, "feedback": string, "suggestions": string[] },
    "education": { "score": number, "feedback": string, "suggestions": string[] },
    "writing": { "score": number, "feedback": string, "suggestions": string[] }
  },
  "summary": string,
  "key_strengths": string[],
  "priority_improvements": string[]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are an expert resume reviewer with extensive experience in HR and recruitment. Provide detailed, constructive feedback in JSON format as specified."
        },
        { 
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    const response = completion.choices[0].message.content
    return NextResponse.json(JSON.parse(response))
  } catch (error) {
    console.error('Error in resume analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}
