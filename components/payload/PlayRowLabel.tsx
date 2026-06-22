'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

type PlayRowLabelData = {
    title?: string
    youTubeStart?: string | number | null
    youTubeEnd?: string | number | null
    quarter?: string | number | null
    down?: string | number | null
    yardsToGo?: string | number | null
    startFieldPosition?: string | number | null
}

export const PlayRowLabel = () => {

    const { data, rowNumber } = useRowLabel<PlayRowLabelData>()

    let i =0;
    if (!data || !rowNumber) {
        return `Play ${String(i++ + 1).padStart(2, '0')}`
    }

    if (
        data.youTubeStart == null ||
        data.youTubeEnd == null ||
        data.quarter == null ||
        data.down == null ||
        data.yardsToGo == null ||
        data.startFieldPosition == null
    ) return `Play ${String(rowNumber + 1).padStart(2, '0')}`

    return (
        <div>
            Q{data.quarter} Play {String(rowNumber + 1).padStart(2, '0')} [{data.youTubeStart} - {data.youTubeEnd}] {data.down}-{data.yardsToGo} [{data.startFieldPosition}]
        </div>
    )
}
