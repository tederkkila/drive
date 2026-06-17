'use client'
import React, { useEffect, useState, CSSProperties } from 'react'
import { useField } from '@payloadcms/ui'
import { NumberFieldClientProps } from 'payload'

export const TimePickerInput: React.FC<NumberFieldClientProps> = ({ field, path }) => {
    // Access the Payload field state
    const { value, setValue } = useField<number>({ path })

    // Local states for the UI inputs
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)

    // Convert stored seconds to HH:MM:SS when the component loads or values change
    useEffect(() => {
        if (typeof value === 'number') {
            const h = Math.floor(value / 3600)
            const m = Math.floor((value % 3600) / 60)
            const s = value % 60
            setHours(h)
            setMinutes(m)
            setSeconds(s)
        } else {
            setHours(0)
            setMinutes(0)
            setSeconds(0)
        }
    }, [value])

    // Update Payload's database value whenever a UI input changes
    const handleTimeChange = (h: number, m: number, s: number) => {
        const totalSeconds = (h * 3600) + (m * 60) + s
        setValue(totalSeconds)
    }

    // Common styling container
    const inputStyle: CSSProperties = {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #e2e8f0',
        width: '70px',
        marginRight: '10px',
        textAlign: 'center' as const
    }

    return (
        <div style={{ marginBottom: '20px' }}>
            <label className="field-label" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                {field.label as string}
            </label>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                    <span style={{ fontSize: '12px', display: 'block', color: '#666' }}>Hours</span>
                    <input
                        type="number"
                        min="0"
                        value={hours}
                        style={inputStyle}
                        onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0)
                            setHours(val)
                            handleTimeChange(val, minutes, seconds)
                        }}
                    />
                </div>

                <div>
                    <span style={{ fontSize: '12px', display: 'block', color: '#666' }}>Minutes</span>
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        style={inputStyle}
                        onChange={(e) => {
                            const val = Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                            setMinutes(val)
                            handleTimeChange(hours, val, seconds)
                        }}
                    />
                </div>

                <div>
                    <span style={{ fontSize: '12px', display: 'block', color: '#666' }}>Seconds</span>
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        style={inputStyle}
                        onChange={(e) => {
                            const val = Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
                            setSeconds(val)
                            handleTimeChange(hours, minutes, val)
                        }}
                    />
                </div>
            </div>

            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                Saved in database as: {value || 0} seconds
            </div>
        </div>
    )
}
