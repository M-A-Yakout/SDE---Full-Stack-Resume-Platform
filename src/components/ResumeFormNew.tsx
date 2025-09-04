"use client"
import React from 'react'
import { 
  useForm,
  useFieldArray,
  Control,
  FieldArrayWithId,
  UseFormRegister,
  UseFormWatch,
  SubmitHandler
} from 'react-hook-form'
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

// Types
type ResumeFormData = z.infer<typeof resumeFormSchema>
type Education = z.infer<typeof educationSchema>
type Experience = z.infer<typeof experienceSchema>
type FieldValues = { skills: string[] }

interface Props {
  defaultValues?: Partial<ResumeFormData>
  onSubmit: (data: ResumeFormData) => void
}

export default function ResumeForm({ defaultValues, onSubmit }: Props) {
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: defaultValues || {
      title: '',
      personal: {
        fullName: '',
        email: '',
      },
      education: [],
      experience: [],
      skills: [],
    },
  })

  const educationArray = useFieldArray({
    control: form.control,
    name: "education"
  })

  const experienceArray = useFieldArray({
    control: form.control,
    name: "experience"
  })

  // @ts-ignore - TypeScript has issues with string[] in useFieldArray
  const skillsArray = useFieldArray({
    control: form.control,
    name: "skills"
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Resume Details</h2>
        <FormInput label="Resume Title" {...form.register('title')} />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
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
          <FormInput 
            label="Professional Summary" 
            {...form.register('personal.summary')}
            multiline={true}
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Education</h2>
          <button
            type="button"
            onClick={() => educationArray.append({
              school: '',
              degree: '',
              field: '',
              startDate: '',
              endDate: '',
              current: false,
              description: ''
            })}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Add Education
          </button>
        </div>
        {educationArray.fields.map((field, index) => (
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
              <FormInput 
                label="Description" 
                {...form.register(`education.${index}.description`)}
                multiline={true}
              />
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
                onClick={() => educationArray.remove(index)}
                className="text-red-600 text-sm hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Experience</h2>
          <button
            type="button"
            onClick={() => experienceArray.append({
              company: '',
              position: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              description: ''
            })}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Add Experience
          </button>
        </div>
        {experienceArray.fields.map((field, index) => (
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
              <FormInput 
                label="Description" 
                {...form.register(`experience.${index}.description`)}
                multiline={true}
                placeholder="Describe your responsibilities and achievements..."
              />
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
                onClick={() => experienceArray.remove(index)}
                className="text-red-600 text-sm hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <button
            type="button"
            onClick={() => skillsArray.append('')}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Add Skill
          </button>
        </div>
        <div className="space-y-2">
          {skillsArray.fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormInput 
                {...form.register(`skills.${index}`)} 
                placeholder="Enter a skill"
              />
              <button
                type="button"
                onClick={() => skillsArray.remove(index)}
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
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          Reset
        </button>
        <button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {form.formState.isSubmitting ? 'Saving...' : 'Save Resume'}
        </button>
      </div>
    </form>
  )
}
