'use client';

import React, { useMemo } from "react";
import { Drive } from "@/payload-types";
type Play = NonNullable<Drive["plays"]>[number];
import { Group } from '@visx/group';
import { scaleLinear } from "@visx/scale";
import { getAbsolutePosition, calculateEndSpotAbsolute } from "@/modules/drives/ui/fieldCalculations";
import { Poppins } from "next/font/google";
import { FieldGroup } from "@/modules/drives/ui/visx/FieldGroup";
import { useGameVideo } from "@/modules/games/ui/GameContext";
import { PlayGraphic } from "@/modules/drives/ui/visx/PlayGraphic";
import { DirectionTriangle } from "@/modules/drives/ui/visx/DirectionTriangle";
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["700"],
});

import { useQueryStates, parseAsArrayOf, parseAsString } from 'nuqs';

const groupParsers = {
    playType: parseAsArrayOf(parseAsString).withDefault([]),
    down: parseAsArrayOf(parseAsString).withDefault([]),
    distance: parseAsArrayOf(parseAsString).withDefault([]),
    gain: parseAsArrayOf(parseAsString).withDefault([]),
    fieldPosition: parseAsArrayOf(parseAsString).withDefault([]),
};

// const fieldColor = "#ccd5cc";
const fieldColor = "#e9e9e9";
// const endZoneColor = "#a8b0a7";
const endZoneColor = "#adadad";
const lineColor = "#555555";
const driveColor = "#555555";

const totalLengthYards: number = 120;
const totalWidthYards: number = 53.33;

interface DriveChartTriggerGraphicProps {
    drive: Drive;
    width: number;
    height: number;
}

export const DriveChartTriggerGraphic = ({ drive, width, height }: DriveChartTriggerGraphicProps) => {

    // console.log("drive", drive)
    // console.log("width", width)
    // console.log("height", height)

    let runCount = 0;
    let runYards = 0;
    let passCount = 0;
    let passCompletions = 0;
    let passYards = 0;
    let penaltyCount = 0;
    let penaltyYards = 0;
    let timeouts = 0;

    drive.plays?.forEach((play) => {

        const nullifyPlay: boolean = !!(play.nullifyPlay);

        if (play.playType === "penalty" || (play.penalty !== null && play.penalty !== undefined)) {
            penaltyCount++;
            penaltyYards += (play.penaltyYards) ? play.penaltyYards : 0;
        }

        if (play.playType === "run") {
            runCount++;
            if(!nullifyPlay) {
                runYards += play.yardsGained;
            }
        }

        if (play.playType === "pass") {
            passCount++;
            if (
                play.description.toLowerCase().includes("interception") ||
                play.description.toLowerCase().includes("incomplete")
            ) {
                //do nothing
            } else {
                passCompletions++;
            }
            if(!nullifyPlay) {
                passYards += play.yardsGained;
            }
        }

        if (play.playType === "timeout") {
            timeouts++;
        }

    })

    const totalYards = runYards + passYards;

    const startSpotAbsolute = getAbsolutePosition(drive.startFieldPosition, drive.direction);

    // console.log("Test startFieldPosition -45 Left", getAbsolutePosition(-45, "left"))
    // console.log("Test startFieldPosition -45 Right", getAbsolutePosition(-45, "right"))
    // console.log("Test startFieldPosition 45 Left", getAbsolutePosition(45, "left"))
    // console.log("Test startFieldPosition 45 Right", getAbsolutePosition(45, "right"))

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

    //drive marker calculations
    const endSpotAbsolute = calculateEndSpotAbsolute(startSpotAbsolute, totalYards, drive.direction);

    let driveMarkerX = startSpotAbsolute;
    let driveMarkerWidth = Math.abs(totalYards);

    if (startSpotAbsolute > endSpotAbsolute) {
        driveMarkerX = endSpotAbsolute;
    }

    const memoizedSvg = useMemo(() => {
        return (
            <svg width={width} height={height} style={{ backgroundColor: fieldColor, fontFamily: `${poppins}, Arial, sans-serif`, display: 'block' }}>
                <Group>

                    <FieldGroup
                        xScale={xScale}
                        yScale={yScale}
                        width={width}
                        height={height}
                        totalLengthYards={totalLengthYards}
                        totalWidthYards={totalWidthYards}
                        endZoneColor={endZoneColor}
                        lineColor={lineColor}
                    />

                    {/* Drive Row Graphic   */}
                    <DirectionTriangle
                        xField={xField}
                        yScale={yScale}
                        x={driveMarkerX}
                        y={20}
                        width={driveMarkerWidth}
                        height={30}
                        driveColor={driveColor}
                        direction={drive.direction}
                    />

                    <rect
                        x={xField(driveMarkerX)}
                        y={yScale(20)}
                        width={xScale(driveMarkerWidth)}
                        height={yScale(30)}
                        // stroke="#555555" strokeWidth={1}
                        fill={driveColor} fillOpacity={0.5}
                    />

                    <text
                        x={xField(1)}
                        y={yScale(11)}
                        fill={lineColor}
                        fillOpacity={0.85}
                        fontSize={Math.max(12, width * 0.015)}
                        fontWeight="400"
                        textAnchor="start"
                        //letterSpacing="2"
                    >
                        <tspan fontWeight="bold" fill="black">Total Yards: </tspan>
                        {totalYards} |
                        <tspan fontWeight="bold" fill="red"> Run: </tspan>
                        {runCount} for {runYards} yards |
                        <tspan fontWeight="bold" fill="blue"> Pass: </tspan>
                        {passCompletions}/{passCount} for {passYards} yards |
                        <tspan fontWeight="bold" fill="brown"> Penalty: </tspan>
                        {penaltyCount} for {penaltyYards} yards
                        <tspan fontWeight="bold" fill="brown"> Timeouts: </tspan>
                        {timeouts}
                    </text>


                </Group>
            </svg>

        );
    }, [width, height, drive.plays]);

    return (
        <div>{memoizedSvg}</div>
    )
}

interface DriveChartGraphicProps {
    drive: Drive;
    width: number;
    height: number;
}

export const DriveChartGraphic = ({ drive, width, height }: DriveChartGraphicProps) => {

    const [filters, setFilters] = useQueryStates(groupParsers);

    if (!drive.plays) return null;
    if (width === 0) return null;
    if (height === 0) return null;

    const playHeight = 40;

    const xScale = scaleLinear<number>({
        domain: [0, totalLengthYards],
        range: [0, width],
    });
    const yScale = scaleLinear<number>({
        domain: [0, totalWidthYards],
        range: [0, playHeight],
    });

    const xField = (x:number) => {
        return xScale(x+10);
    }

    const { setStartTime, setEndTime } = useGameVideo();

    const handleClick = (
        // event: React.MouseEvent<SVGRectElement, MouseEvent>,
        play: Play
    ) => {
        console.log("handleClick", play)

        setStartTime(play.youTubeStart);
        setEndTime(play.youTubeEnd);
    }

    const memoizedSvg = useMemo(() => {

        let playTotalYards = 0

        if (!drive.plays) return null;

        return (
            <svg width={width} height={height} className="fade-in duration-200">
                <rect x={0} y={0} width={width} height={height} fill={fieldColor}/>


                {drive.plays.map((play, index) => {

                    console.log("filters.playType", filters.playType)
                    console.log("play.playType", play.playType)

                    let filtered = false;
                    let downFiltered = (filters.down.length > 0 && !filters.down.includes(String(play.down)));
                    let playTypeFiltered = (filters.playType.length > 0 && !filters.playType.includes(String(play.playType)));

                    //TODO Include play.nullifyPlay in filter for penalty

                    if (downFiltered || playTypeFiltered) {
                        filtered = true;
                    }

                    const startSpotAbsolute = getAbsolutePosition(play.startFieldPosition, drive.direction)
                    const endSpotAbsolute = getAbsolutePosition(play.endFieldPosition, drive.direction)

                    let currentPlayYards = 0;
                    if (play.penaltyYards) {
                        if (play.nullifyPlay) {
                            currentPlayYards += play.penaltyYards;
                        } else {
                            currentPlayYards += play.yardsGained + (play.penaltyYards ? play.penaltyYards : 0);
                        }
                    } else {
                        if (play.nullifyPlay) {
                            currentPlayYards += 0;
                        } else {
                            currentPlayYards += play.yardsGained;
                        }
                    }

                    //drive marker calculations

                    let driveMarkerX = startSpotAbsolute;
                    let driveMarkerWidth = Math.abs(currentPlayYards);

                    if (startSpotAbsolute > endSpotAbsolute) {
                        driveMarkerX = endSpotAbsolute;
                    }

                    //console.log("   driveMarkerX", driveMarkerX)
                    //console.log("   driveMarkerWidth", driveMarkerWidth)

                    playTotalYards += currentPlayYards;

                    let playColor = driveColor;
                    if (play.playType === "run") {
                        playColor = "red";
                    }
                    if (play.playType === "pass") {
                        playColor = "blue";
                    }
                    if (play.nullifyPlay) {
                        playColor = "yellow";
                    }

                    let fillOpacity = 0.5;
                    if (currentPlayYards < 0 && playColor !== "yellow"){
                        fillOpacity = 0.2;
                    }

                    let clickFill = "transparent";
                    let clickFillOpacity = 0.0;
                    if (filtered) {
                        clickFill = fieldColor;
                        clickFillOpacity = 0.9;
                    }

                    const los = calculateEndSpotAbsolute(startSpotAbsolute, play.yardsToGo, drive.direction);

                    /*console.log(`play: ${   play.playNumber}` +
                    `   start: ${getFootballSpot(startSpotAbsolute, drive.direction)}` +
                    `   end: ${getFootballSpot(endSpotAbsolute, drive.direction)}` +
                    `   yards: ${currentPlayYards}`)*/


                    return (
                        <Group left={0} top={index * playHeight} key={play.id}>
                            {/*<text x={0} y={10}>{play.id}</text>*/}
                            <text x={0} y={15}>{play.description}</text>
                            <rect x={0} y={2} width={width} height={playHeight -4} fill={driveColor} fillOpacity={0.1} />
                            {/*First down line*/}
                            <line x1={xField(los)} y1={2} x2={xField(los)} y2={playHeight-4} stroke="yellow" strokeWidth="2" />

                            <PlayGraphic
                                x={xField(driveMarkerX)}
                                y={yScale(10)}
                                width={xScale(driveMarkerWidth)}
                                height={yScale(30)}
                                direction={drive.direction}
                                currentPlayYards={currentPlayYards}
                                fill={playColor} fillOpacity={fillOpacity}
                            />
                            <text x={xField(driveMarkerX + driveMarkerWidth) + 2} y={22}>{currentPlayYards}</text>
                            {/* Transparent click handler*/}
                            <rect x={0} y={2} width={width} height={playHeight -4}
                                  fill={clickFill}
                                  fillOpacity={clickFillOpacity}
                                  onClick={() => handleClick(play)}
                                  style={{ cursor: 'pointer' }}
                            />
                        </Group>
                    )
                })}


            </svg>
        );
    }, [drive.plays, filters]);

    return (
        <div>
            {memoizedSvg}
        </div>
    )
}