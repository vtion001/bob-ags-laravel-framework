'use client'

import { useEffect } from 'react'

export function Analytics() {
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://v0.analytics.vercel-scripts.com/v0/umd.js'
        script.defer = true
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])

    return null
}
