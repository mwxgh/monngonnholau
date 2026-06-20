'use client'

import { useState, useEffect } from 'react'

const FB_URL = `https://www.facebook.com/${process.env.NEXT_PUBLIC_FB_PAGE_ID}`
const TIKTOK_URL = process.env.NEXT_PUBLIC_TIKTOK_URL ?? '#'

export function FloatingButtons() {
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed bottom-24 right-10 z-50 flex flex-col items-center gap-3">
      {/* Scroll to top */}
      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Lên đầu trang"
          className="group bg-white hover:bg-primary rounded-full shadow-xl p-3 hover:scale-110 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-black group-hover:text-white transition-colors"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}

      {/* TikTok */}
      <a
        href={TIKTOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="bg-white rounded-full shadow-xl p-3 hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      </a>

      {/* Facebook */}
      <a
        href={FB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="bg-white rounded-full shadow-xl p-3 hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2">
          <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      </a>
    </div>
  )
}
