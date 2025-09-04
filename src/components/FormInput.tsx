import React from 'react'

type Props = (
  | (React.InputHTMLAttributes<HTMLInputElement> & { multiline?: false })
  | (React.TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true })
) & {
  label?: string
}

export default function FormInput({ label, multiline, className = '', ...props }: Props) {
  const inputClasses = `bg-luxury-900 border border-luxury-700 rounded p-2 text-luxury-50 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold transition-colors ${className}`
  
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-luxury-200">{label}</label>}
      {multiline ? (
        <textarea {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} className={`${inputClasses} min-h-[100px]`} />
      ) : (
        <input {...(props as React.InputHTMLAttributes<HTMLInputElement>)} className={inputClasses} />
      )}
    </div>
  )
}
