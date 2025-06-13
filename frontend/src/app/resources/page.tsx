'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Resource {
  id: string
  title: string
  description: string
  category: string
  url: string
  tags: string[]
}

export default function ResourcesPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Study Resources
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Access a curated collection of study materials and resources for your chosen subjects.
        </p>
      </div>
      
      <div className="mt-12">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Resources Coming Soon
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                We're working on compiling a comprehensive collection of study resources to help you excel in your VCE subjects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 