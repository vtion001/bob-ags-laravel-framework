'use client'

import { useEffect } from 'react'

export default function AuthMessageHandler({ onError, onPending }: { onError?: (msg: string) => void; onPending?: (msg: string) => void }) {
    // This component handles auth messages from URL params
    // In Laravel/Inertia, we handle this differently via session flash messages
    return null;
}
