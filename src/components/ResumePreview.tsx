import React from 'react'

export default function ResumePreview({ data }: { data: any }) {
  return (
    <div className="bg-luxury-800 rounded-lg p-6 border border-luxury-700 text-luxury-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{data?.personal?.fullName || 'Your name'}</h1>
          <div className="text-sm text-luxury-gold">{data?.personal?.email}</div>
          {data?.personal?.location && <div className="text-sm text-gray-300">{data.personal.location}</div>}
          {data?.personal?.summary && <p className="mt-3 text-sm text-gray-200">{data.personal.summary}</p>}
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-luxury-gold mb-2">Experience</h2>
          {(data?.experience || []).map((e: any, i: number) => (
            <div key={i} className="mb-4 p-3 bg-luxury-900 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{e.position || e.role} {e.company ? `@ ${e.company}` : ''}</div>
                  <div className="text-sm text-gray-400">{e.startDate}{e.endDate ? ` - ${e.endDate}` : ' - Present'}</div>
                </div>
              </div>
              {e.description && <p className="mt-2 text-sm text-gray-200">{e.description}</p>}
              {(e.bullets || []).length > 0 && (
                <ul className="list-disc list-inside mt-2 text-sm text-gray-200">
                  {(e.bullets || []).map((b: string, bi: number) => <li key={bi}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
