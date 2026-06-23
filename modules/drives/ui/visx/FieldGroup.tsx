import { Group } from '@visx/group';
import { Line } from "@visx/shape";
import { scaleLinear } from "@visx/scale";

interface FieldGroupProps {
    yScale: any;
    width: number;
    height: number;
    totalLengthYards: number;
    totalWidthYards: number;
    endZoneColor: string;
    lineColor: string;
    simple?: boolean;
}

export const FieldGroup = ({ yScale, width, height, totalLengthYards, totalWidthYards, endZoneColor, lineColor, simple }: FieldGroupProps) => {

    // console.log("xScale", xScale)
    // console.log("yScale", yScale)
    // console.log("width", width)
    // console.log("height", height)
    // console.log("totalWidthYards", totalWidthYards)

    const xScale = scaleLinear<number>({
        domain: [0, totalLengthYards],
        range: [0, width],
    });

    const yardNumbers: number[] = [10, 20, 30, 40, 50, 40, 30, 20, 10];
    const yardLines: number[] = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5];

    let left = 0;
    let y = 0;
    let graphicHeight = height;
    const endZoneColorSimple = "#dcdcdc";
    let endZoneStrokeColor = "#aaaaaa";

    if (simple) {
        left = 1;
        y = 2;
        graphicHeight = height - 4;
        endZoneColor = endZoneColorSimple;
        endZoneStrokeColor = "#cccccc";
    }

    //console.log("FieldGroup", width, height, totalLengthYards, totalWidthYards, endZoneColor, lineColor, simple)

    return (
        <Group left={left}>

            {/* Left End Zone (0 to 10 yards) */}
            <rect x={xScale(0)} y={yScale(y)} width={xScale(10)} height={graphicHeight}
                  fill={endZoneColor}
                  stroke={endZoneStrokeColor} strokeWidth={simple ? "0" : "1"} />

            {/* Right End Zone (110 to 120 yards) */}
            <rect x={xScale(110)} y={yScale(y)} width={xScale(10)} height={graphicHeight}
                  fill={endZoneColor}
                  stroke={endZoneStrokeColor} strokeWidth={simple ? "0" : "1"} />

            {/* Outer Field Boundary */}
            {!simple &&
                <rect x={0} y={0} width={width} height={height} stroke={lineColor} strokeOpacity={0.5} strokeWidth={2} fill="transparent" />
            }

            {/* 5-Yard Lines */}
            {yardLines.map((yard: number, index: number) => {
                const yardAbsoluteX: number = 15 + index * 5;
                const pixelX: number = xScale(yardAbsoluteX);

                return (

                    <g key={`yard-line-${index}`}>
                        <Line
                            from={{ x: pixelX, y: yScale(y) }}
                            to={{ x: pixelX, y: yScale(totalWidthYards) }}
                            stroke={lineColor}
                            strokeOpacity={simple ? "0.05" : "0.2"}
                            strokeWidth={1}
                        />
                    </g>
                );
            })}

            {/* Major 10-Yard Lines and Text Labels */}

            {yardNumbers.map((yard: number, index: number) => {
                const yardAbsoluteX: number = 20 + index * 10;
                const pixelX: number = xScale(yardAbsoluteX);

                if (simple) return

                return (
                    <g key={`yard-number-${index}`}>
                        <Line
                            from={{ x: pixelX, y: yScale(y) }}
                            to={{ x: pixelX, y: yScale(totalWidthYards) }}
                            stroke={lineColor}
                            strokeOpacity="0.2"
                            strokeWidth={1}
                        />

                        {/* Top Sideline Label */}
                        <text
                            x={pixelX + 1}
                            y={yScale(totalWidthYards-6)}
                            fill={lineColor}
                            fillOpacity={0.35}
                            fontSize={Math.max(9, width * 0.015)}
                            fontWeight="bolder"
                            textAnchor="middle"
                            letterSpacing="2"
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
                stroke={lineColor}
                strokeOpacity={simple ? "0.1" : "0.2"}
                strokeWidth={2}
            />

            {Array.from({ length: 99 }).map((_, i: number) => {
                const yardX: number = 11 + i;
                const pixelX: number = xScale(yardX);

                if (yardX % 5 === 0) return null;
                if (simple) return

                return (
                    <g key={`hash-${i}`}>
                        <Line from={{ x: pixelX, y: yScale(0) }} to={{ x: pixelX, y: yScale(2) }} stroke={lineColor} strokeOpacity="0.3" strokeWidth={1} />
                        <Line from={{ x: pixelX, y: yScale(18.5) }} to={{ x: pixelX, y: yScale(19.5) }} stroke={lineColor} strokeOpacity="0.3" strokeWidth={1} />
                        <Line from={{ x: pixelX, y: yScale(33.83) }} to={{ x: pixelX, y: yScale(34.83) }} stroke={lineColor} strokeOpacity="0.3" strokeWidth={1} />
                        <Line from={{ x: pixelX, y: yScale(totalWidthYards - 2) }} to={{ x: pixelX, y: yScale(totalWidthYards) }} stroke={lineColor} strokeOpacity="0.3" strokeWidth={1} />
                    </g>
                );
            })}

        </Group>
    )
}