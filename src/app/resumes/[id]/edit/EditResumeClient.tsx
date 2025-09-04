"use client"
import React from 'react'
import ResumeForm from '../../../../components/ResumeForm'
import { useRouter } from 'next/navigation'

export default function EditResumeClient({ id, defaultValues }: any) {
  const router = useRouter()
  const onSubmit = async (data: any) => {
    const res = await fetch(`/api/resumes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const json = await res.json()
    if (!res.ok) return alert(json.error || 'Failed')
    router.push(`/resumes/${id}/view`)
  }

  return <ResumeForm defaultValues={defaultValues} onSubmit={onSubmit} />
}
