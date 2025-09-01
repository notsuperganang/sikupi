'use client'

import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        className={`
          flex min-h-[80px] w-full rounded-md border border-stone-300 
          bg-white px-3 py-2 text-sm ring-offset-white
          placeholder:text-stone-500 
          focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200
          disabled:cursor-not-allowed disabled:opacity-50
          ${className}
        `}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'