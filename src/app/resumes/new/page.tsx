"use client"
import React from 'react'
import ResumeForm from '../../../components/ResumeForm'
import { useRouter } from 'next/navigation'

export default function NewResumePage() {
  const router = useRouter()

  const onSubmit = async (data: any) => {
    try {
      // First save the resume
      const saveRes = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userEmail: data.personal?.email }),
      })
      
      const saveJson = await saveRes.json().catch(() => ({}))
      if (!saveRes.ok) {
        // show message from server if present
        throw new Error(saveJson.error || 'Failed to save resume')
      }
      
      const json = saveJson
      
      // Generate PDF
      const pdfRes = await fetch(`/api/pdf/${json.id}`, {
        method: 'POST'
      })
      
      if (!pdfRes.ok) {
        throw new Error('Failed to generate PDF')
      }
      
      // Get the PDF URL from response
      const { pdfUrl } = await pdfRes.json()
      
      // Download the PDF
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${data.title || 'resume'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
  // Navigate to the resume view
  router.push(`/resumes/${json.id}/view`)
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-luxury-900 text-luxury-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="mr-4 px-4 py-2 rounded bg-luxury-800 hover:bg-luxury-700 border border-luxury-700 text-luxury-200 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-luxury-gold to-luxury-silver bg-clip-text text-transparent">
            New Resume
          </h1>
        </div>
        <div className="bg-luxury-800 rounded-lg border border-luxury-700 p-6">
          <ResumeForm defaultValues={{ title: '', personal: { fullName: '', email: '' }, education: [], experience: [], skills: [] }} onSubmit={onSubmit} showValidationNotifications />
        </div>
      </div>
    </div>
  )
}
