'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const PlayRowLabel = () => {
    // Replace 'title' with whichever field name you want to display
    const { data, rowNumber } = useRowLabel<{ title?: string }>()

    if (
        !data.youTubeStart ||
        !data.youTubeEnd ||
        !data.quarter ||
        !data.down ||
        !data.yardsToGo ||
        !data.startFieldPosition
    ) return `Play ${String(rowNumber + 1).padStart(2, '0')}`

    return (
        <div>
            Q{data.quarter} Play {String(rowNumber + 1).padStart(2, '0')} [{data.youTubeStart} - {data.youTubeEnd}] {data.down}-{data.yardsToGo} [{data.startFieldPosition}]
        </div>
    )
}
