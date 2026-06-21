'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const PlayRowLabel = () => {
    // Replace 'title' with whichever field name you want to display
    const { data, rowNumber } = useRowLabel<{ title?: string }>()

    if (
        !data.youTubeStart ||
        !data.down
    ) return `Play ${String(rowNumber + 1).padStart(2, '0')}`

    return (
        <div>
            {data.youTubeStart} | {data.down}-{data.yardsToGo}
        </div>
    )
}
