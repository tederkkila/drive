import { Drive } from "@/payload-types";
import { Group } from '@visx/group';
import { scaleLinear } from "@visx/scale";
import { Line } from "@visx/shape";
import React from "react";
import { calculateEndSpot, getAbsolutePosition } from "@/modules/drives/ui/fieldCalculations";
import { Poppins } from "next/font/google";
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});

interface DriveChartTriggerGraphicProps {
    drive: Drive;
    width: number;
    height: number;
}

export const DriveChartTriggerGraphic = ({ drive, width, height }: DriveChartGraphicProps) => {

    console.log("drive", drive)
    // console.log("width", width)
    // console.log("height", height)

    let runCount = 0;
    let runYards = 0;
    let passCount = 0;
    let passYards = 0;
    let penaltyCount = 0;
    let penaltyYards = 0;
    let totalYards = 0;
    let ballPosition = drive.startFieldPosition;

    /*
    <div>Drive Row</div>
    <div>Run: {runCount} for {runYards} yards</div>
    <div>Pass: {passCount} for {passYards} yards</div>
    <div>Penalty: {penaltyCount} for {penaltyYards} yards</div>
    <div>Total: {totalYards} yards</div>
    <div>Starting Position: {drive.startFieldPosition} Final Position: {ballPosition}</div>

     */

    drive.plays?.forEach((play, index, arr) => {
        const isLast: boolean = index === arr.length - 1;
        //console.log("play", play)

        if (play.playType === "run") {
            runCount++;
            runYards += play.yardsGained;
        }

        if (play.playType === "penalty") {
            penaltyCount++;
            penaltyYards += play.yardsGained;
        }

        if (play.playType === "pass") {
            passCount++;
            passYards += play.yardsGained;
        }

        // if(isLast) {
        //     totalYards = runYards + passYards;
        //     ballPosition = calculateEndSpot(ballPosition, totalYards)
        // }
    })

    totalYards = runYards + passYards;

    const totalLengthYards: number = 120;
    const totalWidthYards: number = 53.33;

    const startFieldPosition = getAbsolutePosition(drive.startFieldPosition);
    const endFieldPosition = getAbsolutePosition(calculateEndSpot(startFieldPosition, totalYards));

    // console.log("startFieldPosition", startFieldPosition)
    // console.log("endFieldPosition", endFieldPosition)

    const xScale = scaleLinear<number>({
        domain: [0, totalLengthYards],
        range: [0, width],
    });
    const yScale = scaleLinear<number>({
        domain: [0, totalWidthYards],
        range: [0, height],
    });

    const xField = (x:number) => {
        return xScale(x+10);
    }


    const yardNumbers: number[] = [10, 20, 30, 40, 50, 40, 30, 20, 10];
    const yardLines: number[] = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5];

    return (
        <svg width={width} height={height} style={{ backgroundColor: '#ccd5cc', fontFamily: `${poppins}, Arial, sans-serif`, display: 'block' }}>
            <Group>
                {/* Outer Field Boundary */}
                <rect x={0} y={0} width={width} height={height} stroke="#aaaaaa" strokeWidth={2} fill="transparent" />

                {/* Left End Zone (0 to 10 yards) */}
                <rect x={xScale(0)} y={yScale(0)} width={xScale(10)} height={height} fill="#a8b0a7" stroke="#aaaaaa" strokeWidth={1} />

                {/* Right End Zone (110 to 120 yards) */}
                <rect x={xScale(110)} y={yScale(0)} width={xScale(10)} height={height} fill="#a8b0a7" stroke="#aaaaaa" strokeWidth={1} />

                {/* 5-Yard Lines */}
                {yardLines.map((yard: number, index: number) => {
                    const yardAbsoluteX: number = 15 + index * 5;
                    const pixelX: number = xScale(yardAbsoluteX);

                    return (
                        <g key={`yard-line-${index}`}>
                            <Line
                                from={{ x: pixelX, y: yScale(0) }}
                                to={{ x: pixelX, y: yScale(totalWidthYards) }}
                                stroke="#555555"
                                strokeOpacity="0.2"
                                strokeWidth={1}
                            />
                        </g>
                    );
                })}

                {/* Major 10-Yard Lines and Text Labels */}
                {yardNumbers.map((yard: number, index: number) => {
                    const yardAbsoluteX: number = 20 + index * 10;
                    const pixelX: number = xScale(yardAbsoluteX);

                    return (
                        <g key={`yard-number-${index}`}>
                            <Line
                                from={{ x: pixelX, y: yScale(0) }}
                                to={{ x: pixelX, y: yScale(totalWidthYards) }}
                                stroke="#555555"
                                strokeOpacity="0.2"
                                strokeWidth={1}
                            />

                            {/* Top Sideline Label */}
                            <text
                                x={pixelX + 1}
                                y={yScale(totalWidthYards-4)}
                                fill="#555555"
                                fillOpacity={0.35}
                                fontSize={Math.max(10, width * 0.018)}
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
                    stroke="#555555"
                    strokeOpacity="0.2"
                    strokeWidth={2}
                />

                {Array.from({ length: 99 }).map((_, i: number) => {
                    const yardX: number = 11 + i;
                    const pixelX: number = xScale(yardX);

                    if (yardX % 5 === 0) return null;

                    return (
                        <g key={`hash-${i}`}>
                            <Line from={{ x: pixelX, y: yScale(0) }} to={{ x: pixelX, y: yScale(2) }} stroke="#555555" strokeOpacity="0.3" strokeWidth={1} />
                            <Line from={{ x: pixelX, y: yScale(18.5) }} to={{ x: pixelX, y: yScale(19.5) }} stroke="#555555" strokeOpacity="0.3" strokeWidth={1} />
                            <Line from={{ x: pixelX, y: yScale(33.83) }} to={{ x: pixelX, y: yScale(34.83) }} stroke="#555555" strokeOpacity="0.3" strokeWidth={1} />
                            <Line from={{ x: pixelX, y: yScale(totalWidthYards - 2) }} to={{ x: pixelX, y: yScale(totalWidthYards) }} stroke="#555555" strokeOpacity="0.3" strokeWidth={1} />
                        </g>
                    );
                })}

                {/* Drive Row Graphic   */}
                <rect x={xField(startFieldPosition)} y={yScale(5)} width={xScale(totalYards)} height={yScale(totalWidthYards-20)} stroke="#555555" strokeWidth={1} fill="#555555" fillOpacity={0.5} />


            </Group>
        </svg>
    )
}

interface DriveChartGraphicProps {
    drive: Drive;
    width: number;
    height: number;
}

export const DriveChartGraphic = ({ drive, width, height }: DriveChartGraphicProps) => {

    console.log("drive", drive)
    console.log("width", width)
    console.log("height", height)


    return (
        <div>
            <h1>Drive Chart Graphic</h1>
            <svg width={width} height={height}>
                <rect x={0} y={0} width={width} height={height} fill="red"/>

            </svg>


        </div>
    )
}