import React from 'react';
import { Group } from '@visx/group';
import { Bar, Line } from '@visx/shape';
import { scaleLinear, ScaleLinear } from '@visx/scale';

interface FootballFieldProps {
    /** Optional custom pixel width of the canvas container. Defaults to 960. */
    width?: number;
    /** Optional custom pixel height of the canvas container. Defaults to 426.64. */
    height?: number;
}

export default function FootballFieldWithScales({
                                                    width = 1024,
                                                    height = 426.64,
                                                }: FootballFieldProps): React.JSX.Element {
    // 1. Define real-world football field dimensions (in yards)
    const totalLengthYards: number = 120; // 100 yards of playing field + two 10-yard endzones
    const totalWidthYards: number = 53.33; // Standard football field width

    // 2. Create Explicitly Typed Visx Linear Scales
    const xScale: ScaleLinear<number, number> = scaleLinear<number>({
        domain: [0, totalLengthYards],
        range: [0, width],
    });

    const yScale: ScaleLinear<number, number> = scaleLinear<number>({
        domain: [0, totalWidthYards],
        range: [0, height],
    });

    // 3. Complete array of yard numbers appearing sequentially from left to right
    const yardLines: number[] = [10, 20, 30, 40, 50, 40, 30, 20, 10];

    return (
        <svg
            width={width}
            height={height}
            style={{ backgroundColor: '#2e7d32', fontFamily: 'Arial, sans-serif' }}
        >
            <Group>
                {/* Field Boundary */}
                <rect x={0} y={0} width={width} height={height} stroke="#ffffff" strokeWidth={4} fill="transparent" />

                {/* Left End Zone (0 to 10 yards) */}
                <rect x={xScale(0)} y={yScale(0)} width={xScale(10)} height={height} fill="#1b5e20" stroke="#ffffff" strokeWidth={2} />

                {/* Right End Zone (110 to 120 yards) */}
                <rect x={xScale(110)} y={yScale(0)} width={xScale(10)} height={height} fill="#1b5e20" stroke="#ffffff" strokeWidth={2} />

                {/* Major 10-Yard Lines and Text Labels */}
                {yardLines.map((yard: number, index: number) => {
                    // Calculation accounts for the first 10-yard endzone, stepping by 10 yards for each index
                    const yardAbsoluteX: number = 20 + index * 10;
                    const pixelX: number = xScale(yardAbsoluteX);

                    return (
                        <g key={`yard-line-${index}`}>
                            {/* Major Yard Line */}
                            <Line
                                from={{ x: pixelX, y: yScale(0) }}
                                to={{ x: pixelX, y: yScale(totalWidthYards) }}
                                stroke="#ffffff"
                                strokeWidth={2}
                            />

                            {/* Sideline Text Label (Top Sideline View) */}
                            <text
                                x={pixelX}
                                y={yScale(4)}
                                fill="#ffffff"
                                fontSize="18"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {yard}
                            </text>

                            {/* Sideline Text Label (Bottom Sideline View - Rotated 180 degrees) */}
                            <text
                                x={pixelX}
                                y={yScale(totalWidthYards - 4)}
                                fill="#ffffff"
                                fontSize="18"
                                fontWeight="bold"
                                textAnchor="middle"
                                transform={`rotate(180, ${pixelX}, ${yScale(totalWidthYards - 4)})`}
                            >
                                {yard}
                            </text>
                        </g>
                    );
                })}

                {/* Midfield 50-Yard Line */}
                <Line
                    from={{ x: xScale(60), y: yScale(0) }}
                    to={{ x: xScale(60), y: yScale(totalWidthYards) }}
                    stroke="#ffffff"
                    strokeWidth={3}
                />

                {/* Individual 1-Yard Hash Marks across the 100-yard playing grid */}
                {Array.from({ length: 99 }).map((_, i: number) => {
                    const yardX: number = 11 + i;
                    const pixelX: number = xScale(yardX);

                    // Prevent rendering overlapping shapes on top of major 10-yard lines
                    if (yardX % 10 === 0) return null;

                    return (
                        <g key={`hash-${i}`}>
                            {/* Top Sideline Hashes */}
                            <Line from={{ x: pixelX, y: yScale(0) }} to={{ x: pixelX, y: yScale(1) }} stroke="#ffffff" strokeWidth={1} />

                            {/* Top Inbound Hashes (Standard professional/college spacing rules) */}
                            <Line from={{ x: pixelX, y: yScale(18.5) }} to={{ x: pixelX, y: yScale(19.5) }} stroke="#ffffff" strokeWidth={1} />

                            {/* Bottom Inbound Hashes */}
                            <Line from={{ x: pixelX, y: yScale(33.83) }} to={{ x: pixelX, y: yScale(34.83) }} stroke="#ffffff" strokeWidth={1} />

                            {/* Bottom Sideline Hashes */}
                            <Line from={{ x: pixelX, y: yScale(totalWidthYards - 1) }} to={{ x: pixelX, y: yScale(totalWidthYards) }} stroke="#ffffff" strokeWidth={1} />
                        </g>
                    );
                })}
            </Group>
        </svg>
    );
}
