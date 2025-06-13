'use client'

import GlobalLayout from '@/components/GlobalLayout'

// Sample data for saved subjects and careers
const savedSubjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History']
const savedCareers = ['Software Engineer', 'Data Scientist', 'Biomedical Researcher']

export default function SavedPreferencesPage() {
  return (
    <GlobalLayout>
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          {/* Page Header */}
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[#101518] tracking-light text-[32px] font-bold leading-tight min-w-72">Saved Preferences</p>
          </div>

          {/* Saved Subjects Section */}
          <h3 className="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Saved Subjects</h3>
          {
            savedSubjects.map((subject, index) => (
              <div key={index} className="flex items-center gap-4 bg-gray-50 px-4 min-h-14 justify-between">
                <p className="text-[#101518] text-base font-normal leading-normal flex-1 truncate">{subject}</p>
                <div className="shrink-0">
                  {/* Placeholder for remove button */}
                  <div className="text-[#101518] flex size-7 items-center justify-center" data-icon="X" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))
          }

          {/* Saved Careers Section */}
          <h3 className="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Saved Careers</h3>
          <div className="flex gap-3 p-3 flex-wrap pr-4">
            {
              savedCareers.map((career, index) => (
                <div key={index} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-4">
                  <p className="text-[#101518] text-sm font-medium leading-normal">{career}</p>
                </div>
              ))
            }
          </div>

          {/* Export as PDF Toggle */}
          <div className="flex items-center gap-4 bg-gray-50 px-4 min-h-14 justify-between mt-4"> {/* Added mt-4 for spacing */}
            <p className="text-[#101518] text-base font-normal leading-normal flex-1 truncate">Export as PDF</p>
            <div className="shrink-0">
              {/* Placeholder for toggle switch */}
              <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-[#eaedf1] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-[#dce8f3]">
                <div className="h-full w-[27px] rounded-full bg-white" style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px' }}></div>
                <input type="checkbox" className="invisible absolute" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </GlobalLayout>
  )
} 