import React from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { ParentSize } from '@visx/responsive';

interface InnerFieldProps {
    width: number;
    height: number;
}

/**
 * 1. The Inner SVG Field Renderer
 */
function ResponsiveFootballField({ width, height }: InnerFieldProps): React.JSX.Element {
    const totalLengthYards = 120; // 100 yards of playing field + two 10-yard end zones
    const totalWidthYards = 53.33; // Standard football field width ratio

    // Create responsive linear scales based on active parent element bounds
    const xScale = scaleLinear<number>({
        domain: [0, totalLengthYards],
        range: [0, width],
    });

    const yScale = scaleLinear<number>({
        domain: [0, totalWidthYards],
        range: [0, height],
    });

    const yardNumbers: number[] = [10, 20, 30, 40, 50, 40, 30, 20, 10];
    const yardLines: number[] = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5];


    // Evaluation condition: only show detailed hash marks for sizes 1024px or larger
    const showHashMarks = width >= 1024;

    return (
        <svg
            width={width}
            height={height}
            style={{ backgroundColor: '#2e7d32', fontFamily: 'Arial, sans-serif', display: 'block' }}
        >
            <Group>
                {/* Outer Field Boundary */}
                <rect x={0} y={0} width={width} height={height} stroke="#ffffff" strokeWidth={4} fill="transparent" />

                {/* Left End Zone (0 to 10 yards) */}
                <rect x={xScale(0)} y={yScale(0)} width={xScale(10)} height={height} fill="#1b5e20" stroke="#ffffff" strokeWidth={2} />

                {/* Right End Zone (110 to 120 yards) */}
                <rect x={xScale(110)} y={yScale(0)} width={xScale(10)} height={height} fill="#1b5e20" stroke="#ffffff" strokeWidth={2} />


                {/* Major 10-Yard Lines and Text Labels */}
                {yardNumbers.map((yard: number, index: number) => {
                    const yardAbsoluteX: number = 20 + index * 10;
                    const pixelX: number = xScale(yardAbsoluteX);

                    return (
                        <g key={`yard-line-${index}`}>
                            <Line
                                from={{ x: pixelX, y: yScale(0) }}
                                to={{ x: pixelX, y: yScale(totalWidthYards) }}
                                stroke="#ffffff"
                                strokeWidth={2}
                            />

                            {/* Top Sideline Label */}
                            <text
                                x={pixelX}
                                y={yScale(4)}
                                fill="#ffffff"
                                fontSize={Math.max(10, width * 0.018)}
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {yard}
                            </text>

                            {/* Bottom Sideline Label (Rotated) */}
                            <text
                                x={pixelX}
                                y={yScale(totalWidthYards - 4)}
                                fill="#ffffff"
                                fontSize={Math.max(10, width * 0.018)}
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

                {/* Individual 1-Yard Hash Marks (Conditional Render) */}
                {showHashMarks && Array.from({ length: 99 }).map((_, i: number) => {
                    const yardX: number = 11 + i;
                    const pixelX: number = xScale(yardX);

                    if (yardX % 10 === 0) return null;

                    return (
                        <g key={`hash-${i}`}>
                            <Line from={{ x: pixelX, y: yScale(0) }} to={{ x: pixelX, y: yScale(1) }} stroke="#ffffff" strokeWidth={1} />
                            <Line from={{ x: pixelX, y: yScale(18.5) }} to={{ x: pixelX, y: yScale(19.5) }} stroke="#ffffff" strokeWidth={1} />
                            <Line from={{ x: pixelX, y: yScale(33.83) }} to={{ x: pixelX, y: yScale(34.83) }} stroke="#ffffff" strokeWidth={1} />
                            <Line from={{ x: pixelX, y: yScale(totalWidthYards - 1) }} to={{ x: pixelX, y: yScale(totalWidthYards) }} stroke="#ffffff" strokeWidth={1} />
                        </g>
                    );
                })}
            </Group>
        </svg>
    );
}

/**
 * 2. Exported Parent Container Component
 */
export default function FootballFieldContainer(): React.JSX.Element {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>test
            <ParentSize debounceTime={100}>
                {({ width }) => {

                    // Cap the dynamic viewport width at an absolute limit of 1024px
                    const boundedWidth = Math.min(width, 1024);

                    const calculatedHeight = width * (53.33 / 120);
                    console.log(width, calculatedHeight, boundedWidth);

                    return (
                        <ResponsiveFootballField
                            width={width}
                            height={calculatedHeight}
                        />
                    );
                }}
            </ParentSize>
        </div>
    );
}
