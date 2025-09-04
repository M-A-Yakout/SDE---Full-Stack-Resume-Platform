"use client"

import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import FormInput from './FormInput'

// Form Schemas
const educationSchema = z.object({
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().optional(),
})

const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().min(1, "Description is required"),
})

const personalSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  linkedin: z.string().url("Invalid LinkedIn URL").optional(),
  github: z.string().url("Invalid GitHub URL").optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
})

const resumeFormSchema = z.object({
  title: z.string().min(1, "Resume title is required"),
  personal: personalSchema,
  education: z.array(educationSchema).min(1, "Add at least one education entry"),
  experience: z.array(experienceSchema).min(1, "Add at least one experience entry"),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
})

type ResumeFormData = z.infer<typeof resumeFormSchema>

interface Props {
  defaultValues?: Partial<ResumeFormData>
  onSubmit: (data: ResumeFormData) => Promise<void>
}

export default function ResumeForm({ defaultValues, onSubmit }: Props) {
  const [improving, setImproving] = React.useState<string | null>(null)
  const [submitErrors, setSubmitErrors] = React.useState<string[]>([])
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: defaultValues || {
      title: '',
      personal: {
        fullName: '',
        email: '',
        summary: '',
      },
      education: [],
      experience: [],
      skills: [],
    },
  })

  const handleImproveText = React.useCallback(async (type: 'title' | 'summary' | 'education' | 'experience', index?: number) => {
    let currentText = ''
    let fieldPath = ''
    
    try {
      // Determine the field path and get current text
      // Get current text based on field type
      switch (type) {
        case 'title':
          fieldPath = 'title'
          currentText = form.getValues('title') as string || ''
          break
        case 'summary':
          fieldPath = 'personal.summary'
          currentText = form.getValues('personal.summary') as string || ''
          break
        case 'education':
          if (typeof index === 'number') {
            fieldPath = `education.${index}.description`
            const educationFields = form.getValues('education')
            currentText = educationFields[index]?.description || ''
          }
          break
        case 'experience':
          if (typeof index === 'number') {
            fieldPath = `experience.${index}.description`
            const experienceFields = form.getValues('experience')
            currentText = experienceFields[index]?.description || ''
          }
          break
      }

      if (!currentText.trim()) {
        alert('Please enter some text first')
        return
      }

      // Start improving
      setImproving(type)

      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: currentText,
          field: fieldPath 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI suggestions')
      }

      const data = await response.json()
      
      if (!data.improvedText) {
        throw new Error('No improvement suggestion received')
      }

      // Only update if we got a valid response
      switch (type) {
        case 'title':
          form.setValue('title', data.improvedText, { shouldDirty: true, shouldTouch: true })
          break
        case 'summary':
          form.setValue('personal.summary', data.improvedText, { shouldDirty: true, shouldTouch: true })
          break
        case 'education':
          if (typeof index === 'number') {
            form.setValue(`education.${index}.description`, data.improvedText, { shouldDirty: true, shouldTouch: true })
          }
          break
        case 'experience':
          if (typeof index === 'number') {
            form.setValue(`experience.${index}.description`, data.improvedText, { shouldDirty: true, shouldTouch: true })
          }
          break
      }
    } catch (error) {
      alert('Error improving text: ' + (error as Error).message)
      console.error('AI improvement error:', error)
    } finally {
      setImproving(null)
    }
  }, [form])

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education"
  })

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: "experience"
  })

  const skills = form.watch("skills") || []
  
  const addSkill = () => {
    const currentSkills = form.getValues("skills")
    form.setValue("skills", [...currentSkills, ""])
  }

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues("skills")
    form.setValue("skills", currentSkills.filter((_, i) => i !== index))
  }

  // collect human-friendly messages from RHF errors (recursive)
  function collectErrorMessages(errObj: any, prefix = ''): string[] {
    const msgs: string[] = []
    if (!errObj) return msgs
    if (errObj.message) {
      msgs.push(prefix ? `${prefix}: ${errObj.message}` : errObj.message)
    }
    if (errObj.type === 'array' && Array.isArray(errObj?.message)) {
      // already handled
    }
    // iterate children
    for (const key of Object.keys(errObj)) {
      if (['message', 'type', 'ref'].includes(key)) continue
      const child = errObj[key]
      if (child && typeof child === 'object') {
        const childPrefix = prefix ? `${prefix}.${key}` : key
        msgs.push(...collectErrorMessages(child, childPrefix))
      }
    }
    return msgs
  }

  const onValidSubmit = async (data: ResumeFormData) => {
    setSubmitErrors([])
    await onSubmit(data)
  }

  const onInvalidSubmit = (errors: any) => {
    const msgs = collectErrorMessages(errors)
    // de-duplicate and map some paths to friendly names
    const friendly = Array.from(new Set(msgs)).map(m => m.replace(/personal\./g, 'Personal '))
    setSubmitErrors(friendly)
    // scroll to top so user sees the notification
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <form onSubmit={form.handleSubmit(onValidSubmit, onInvalidSubmit)} className="space-y-8 max-w-4xl mx-auto">
      {submitErrors.length > 0 && (
        <div className="p-4 rounded bg-red-600 text-white">
          <strong>Please fix the following before downloading:</strong>
          <ul className="mt-2 list-disc list-inside">
            {submitErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
      <div className="bg-luxury-800 shadow-xl rounded-lg p-6 border border-luxury-700">
        <h2 className="text-xl font-semibold mb-4 text-luxury-gold">Resume Details</h2>
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <FormInput label="Resume Title" {...form.register('title')} />
          </div>
          <button
            type="button"
            onClick={() => handleImproveText('title')}
            disabled={improving === 'title'}
            className={`mt-7 px-3 py-1 rounded bg-luxury-700 hover:bg-luxury-600 border border-luxury-600 text-luxury-200 transition-colors ${
              improving === 'title' ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            {improving === 'title' ? 'Improving...' : 'AI Improve'}
          </button>
        </div>
      </div>

      <div className="bg-luxury-800 shadow-xl rounded-lg p-6 border border-luxury-700">
        <h2 className="text-xl font-semibold mb-4 text-luxury-gold">Personal Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormInput label="Full Name" {...form.register('personal.fullName')} />
          <FormInput label="Email" {...form.register('personal.email')} type="email" />
          <FormInput label="Phone" {...form.register('personal.phone')} type="tel" />
          <FormInput label="Location" {...form.register('personal.location')} />
          <FormInput 
            label="LinkedIn URL" 
            {...form.register('personal.linkedin')} 
            type="url"
            placeholder="https://linkedin.com/in/username"
          />
          <FormInput 
            label="GitHub URL" 
            {...form.register('personal.github')} 
            type="url"
            placeholder="https://github.com/username"
          />
        </div>
        <div className="mt-4">
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <FormInput 
                label="Professional Summary" 
                {...form.register('personal.summary')}
                multiline={true}
                placeholder="Write a brief summary of your professional background and career goals..."
              />
            </div>
            <button
              type="button"
              onClick={() => handleImproveText('summary')}
              disabled={improving === 'summary'}
              className={`mt-7 px-3 py-1 rounded bg-luxury-700 hover:bg-luxury-600 border border-luxury-600 text-luxury-200 transition-colors ${
                improving === 'summary' ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              {improving === 'summary' ? 'Improving...' : 'AI Improve'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-luxury-800 shadow-xl rounded-lg p-6 border border-luxury-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-luxury-gold">Education</h2>
          <button
            type="button"
            onClick={() => appendEducation({
              school: '',
              degree: '',
              field: '',
              startDate: '',
              endDate: '',
              current: false,
              description: ''
            })}
            className="bg-luxury-gold text-luxury-900 px-3 py-1 rounded text-sm hover:bg-luxury-bronze transition-colors"
          >
            Add Education
          </button>
        </div>
        {educationFields.map((field, index) => (
          <div key={field.id} className="border-b pb-4 mb-4 last:border-0">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="School" {...form.register(`education.${index}.school`)} />
              <FormInput label="Degree" {...form.register(`education.${index}.degree`)} />
              <FormInput label="Field of Study" {...form.register(`education.${index}.field`)} />
              <FormInput 
                label="Start Date" 
                type="month" 
                {...form.register(`education.${index}.startDate`)}
              />
              {!form.watch(`education.${index}.current`) && (
                <FormInput 
                  label="End Date" 
                  type="month" 
                  {...form.register(`education.${index}.endDate`)}
                />
              )}
            </div>
            <div className="mt-4">
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <FormInput 
                    label="Description" 
                    {...form.register(`education.${index}.description`)}
                    multiline={true}
                    placeholder="Describe your academic achievements and relevant coursework..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleImproveText('education', index)}
                  disabled={improving === `education.${index}`}
                  className={`mt-7 px-3 py-1 rounded bg-luxury-700 hover:bg-luxury-600 border border-luxury-600 text-luxury-200 transition-colors ${
                    improving === `education.${index}` ? 'opacity-50 cursor-wait' : ''
                  }`}
                >
                  {improving === `education.${index}` ? 'Improving...' : 'AI Improve'}
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  {...form.register(`education.${index}.current`)}
                  className="rounded border-gray-300"
                />
                <span>Current</span>
              </label>
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-red-600 text-sm hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-luxury-800 shadow-xl rounded-lg p-6 border border-luxury-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-luxury-gold">Experience</h2>
          <button
            type="button"
            onClick={() => appendExperience({
              company: '',
              position: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              description: ''
            })}
            className="bg-luxury-gold text-luxury-900 px-3 py-1 rounded text-sm hover:bg-luxury-bronze transition-colors"
          >
            Add Experience
          </button>
        </div>
        {experienceFields.map((field, index) => (
          <div key={field.id} className="border-b pb-4 mb-4 last:border-0">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormInput label="Company" {...form.register(`experience.${index}.company`)} />
              <FormInput label="Position" {...form.register(`experience.${index}.position`)} />
              <FormInput label="Location" {...form.register(`experience.${index}.location`)} />
              <FormInput 
                label="Start Date" 
                type="month" 
                {...form.register(`experience.${index}.startDate`)}
              />
              {!form.watch(`experience.${index}.current`) && (
                <FormInput 
                  label="End Date" 
                  type="month" 
                  {...form.register(`experience.${index}.endDate`)}
                />
              )}
            </div>
            <div className="mt-4">
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <FormInput 
                    label="Description" 
                    {...form.register(`experience.${index}.description`)}
                    multiline={true}
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleImproveText('experience', index)}
                  disabled={improving === `experience.${index}`}
                  className={`mt-7 px-3 py-1 rounded bg-luxury-700 hover:bg-luxury-600 border border-luxury-600 text-luxury-200 transition-colors ${
                    improving === `experience.${index}` ? 'opacity-50 cursor-wait' : ''
                  }`}
                >
                  {improving === `experience.${index}` ? 'Improving...' : 'AI Improve'}
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  {...form.register(`experience.${index}.current`)}
                  className="rounded border-gray-300"
                />
                <span>Current Position</span>
              </label>
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="text-red-600 text-sm hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-luxury-800 shadow-xl rounded-lg p-6 border border-luxury-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-luxury-gold">Skills</h2>
          <button
            type="button"
            onClick={addSkill}
            className="bg-luxury-gold text-luxury-900 px-3 py-1 rounded text-sm hover:bg-luxury-bronze transition-colors"
          >
            Add Skill
          </button>
        </div>
        <div className="space-y-2">
          {skills.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <FormInput 
                {...form.register(`skills.${index}`)} 
                placeholder="Enter a skill"
              />
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => form.reset()}
          className="px-6 py-2 rounded bg-luxury-800 hover:bg-luxury-700 border border-luxury-700 text-luxury-200 transition-colors"
        >
          Reset
        </button>
        <button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="px-6 py-2 rounded bg-luxury-gold hover:bg-luxury-bronze text-luxury-900 transition-colors disabled:opacity-50"
        >
          {form.formState.isSubmitting ? 'Saving...' : 'Save & Download PDF'}
        </button>
      </div>
      {/* Loading overlay */}
      {improving && (
        <div className="fixed inset-0 bg-luxury-900/50 flex items-center justify-center z-50">
          <div className="p-4 bg-luxury-800 rounded-lg border border-luxury-700">
            Improving text...
          </div>
        </div>
      )}

      {form.formState.isSubmitting && (
        // show overlay loader during save & PDF generation
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-luxury-900/60" />
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <div className="loader-spinner w-24 h-24 relative">
                <div className="layer"></div>
                <div className="layer"></div>
                <div className="layer"></div>
                <div className="layer"></div>
                <div className="layer"></div>
                <div className="layer"></div>
              </div>
              <div className="mt-4 text-luxury-gold font-semibold">On your way...</div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
