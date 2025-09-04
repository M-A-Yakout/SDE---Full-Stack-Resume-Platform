"use client"
import React from 'react'

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-luxury-900/60 z-50 flex items-center justify-center">
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
  )
}
