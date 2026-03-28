'use client'

import Script from 'next/script'

export function Analytics() {
  return (
    <>
      <Script
        src="https://v0.analytics.vercel-scripts.com/v0/umd.js"
        strategy="lazyOnload"
        defer
      />
    </>
  )
}
