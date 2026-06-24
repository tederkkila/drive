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
    search: parseAsString
        .withOptions({
            clearOnDefault: true,
        })
        .withDefault(""),
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

    //console.log("DriveChartTriggerGraphic", width)
    let currentDriveColor = driveColor;

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

    const totalYards = runYards + passYards + penaltyYards;

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

    if (drive.result === "touchdown") {
        currentDriveColor = 'green';
    } else if (drive.result === "field_goal") {
        currentDriveColor = 'yellow';
    }

    const memoizedSvg = useMemo(() => {
        return (
            <svg width={width} height={height} style={{ backgroundColor: fieldColor, fontFamily: `${poppins}, Arial, sans-serif`, display: 'block' }}>
                <Group>

                    <FieldGroup
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
                        fill={currentDriveColor} fillOpacity={0.5}
                    />

                    <text
                        x={xScale(1)}
                        y={yScale(11)}
                        fill={lineColor}
                        fillOpacity={0.85}
                        fontSize={12}
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

    const { setStartTime, setEndTime, triggerSeek } = useGameVideo();

    const handleClick = (
        // event: React.MouseEvent<SVGRectElement, MouseEvent>,
        play: Play
    ) => {
        setStartTime(play.youTubeStart);
        setEndTime(play.youTubeEnd);
        triggerSeek();
    }

    function getOrdinal(n: number): string {
        const pr = new Intl.PluralRules('en-US', { type: 'ordinal' });
        const rule = pr.select(n);

        const suffixes: Record<string, string> = {
            one: 'st',
            two: 'nd',
            few: 'rd',
            other: 'th',
        };

        const suffix = suffixes[rule] || 'th';
        return `${n}${suffix}`;
    }

    const memoizedSvg = useMemo(() => {

        let playTotalYards = 0

        if (!drive.plays) return null;

        return (
            <svg width={width} height={height} className="fade-in duration-200">
                {/*<rect x={0} y={0} width={width} height={height} fill={fieldColor}/>*/}
                <Group top={0} left={0}>



                {drive.plays.map((play, index) => {

                    let filtered = false;

                    let downFiltered = (filters.down.length > 0 && !filters.down.includes(String(play.down)));

                    let playTypeFiltered = (filters.playType.length > 0 && !filters.playType.includes(String(play.playType)));
                    if (playTypeFiltered && filters.playType.includes(String('penalty'))) {

                        if (play.penaltyYards) {
                            playTypeFiltered = false;
                        }

                    }

                    let distanceFiltered =  false
                    if (filters.distance.length > 0) {
                        distanceFiltered = true;
                        filters.distance.forEach((distance) => {
                            if (distance == 'long' && play.yardsToGo > 10) {
                                distanceFiltered = false;
                            } else if (distance.includes("10") && 7 <= play.yardsToGo && play.yardsToGo < 10) {
                                distanceFiltered = false;

                            } else if (distance.includes("6") && 3 <= play.yardsToGo && play.yardsToGo < 6) {
                                distanceFiltered = false;

                            } else if (distance.includes("3") && 0 <= play.yardsToGo && play.yardsToGo < 3) {
                                distanceFiltered = false;
                            }

                        })
                    }

                    let searchFiltered = false;
                    if (filters.search.length > 0) {
                        if (!play.description.toLowerCase().includes(filters.search.toLowerCase())) {
                            searchFiltered = true;
                        }
                    }

                    if (downFiltered || playTypeFiltered || distanceFiltered || searchFiltered) {
                        filtered = true;
                    }

                    const startSpotAbsolute = getAbsolutePosition(play.startFieldPosition, drive.direction)
                    let endSpotAbsolute = getAbsolutePosition(play.endFieldPosition, drive.direction)

                    let currentPlayYards = 0;
                    if (play.penaltyYards) {
                        //console.log("play.penaltyYards", play.penaltyYards)
                        if (play.nullifyPlay) {
                            currentPlayYards += play.penaltyYards;
                        } else {
                            currentPlayYards += play.yardsGained + (play.penaltyYards ? play.penaltyYards : 0);
                        }

                        endSpotAbsolute = calculateEndSpotAbsolute(endSpotAbsolute, currentPlayYards, drive.direction);
                    } else {
                        if (play.nullifyPlay) {
                            currentPlayYards += 0;
                        } else {
                            currentPlayYards += play.yardsGained;
                        }
                    }

                    //drive marker calculations
                    //console.log("play", play)
                    //console.log("currentPlayYards", currentPlayYards)

                    let driveMarkerX = Math.min(startSpotAbsolute, endSpotAbsolute);
                    let driveMarkerWidth = Math.abs(currentPlayYards);

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
                        fillOpacity = 0.1;
                    }

                    let clickFill = "transparent";
                    let clickFillOpacity = 0.0;
                    if (filtered) {
                        clickFill = fieldColor;
                        clickFillOpacity = 0.9;
                    }

                    const ltg = calculateEndSpotAbsolute(startSpotAbsolute, play.yardsToGo, drive.direction);
                    const maxLtg = Math.min(play.yardsToGo, 10)
                    const ltg0 = Math.min(ltg, calculateEndSpotAbsolute(ltg, -maxLtg, drive.direction));

                    //console.log("ltg", ltg)
                    //console.log("ltg0", ltg0)

                    /*console.log(`play: ${   index +1 }` +
                    `   start: ${startSpotAbsolute}` +
                    `   end: ${endSpotAbsolute}` +
                    `   yards: ${currentPlayYards}`)*/


                    return (
                        <Group left={0} top={index * playHeight} key={play.id}>

                            <FieldGroup
                                yScale={yScale}
                                width={width-2}
                                height={playHeight}
                                totalLengthYards={totalLengthYards}
                                totalWidthYards={totalWidthYards}
                                endZoneColor={endZoneColor}
                                lineColor={lineColor}
                                simple={true}
                            />

                            {/*<text x={0} y={10}>{play.id}</text>*/}
                            <text x={2} y={15}>{play.description}</text>
                            <rect x={0} y={2} width={width} height={playHeight -4} fill={driveColor} fillOpacity={0.1} />

                            {/*First down line*/}
                            <rect x={xField(ltg0)} y={2} width={xScale(maxLtg)} height={playHeight -4} fill="yellow" fillOpacity={0.1} />
                            <line x1={xField(ltg)} y1={2} x2={xField(ltg)} y2={playHeight-4} stroke="yellow" strokeWidth="2" />

                            <PlayGraphic
                                x={xField(driveMarkerX)}
                                y={yScale(10)}
                                width={xScale(driveMarkerWidth)}
                                height={yScale(30)}
                                direction={drive.direction}
                                currentPlayYards={currentPlayYards}
                                fill={playColor} fillOpacity={fillOpacity}
                            />

                            <text
                                x={drive.direction == 'left' ?
                                    xField(driveMarkerX + driveMarkerWidth) + 4
                                    :
                                    xField(driveMarkerX ) - 4
                                }
                                y={22.5}
                                fill={currentPlayYards < 0 ? "red" : "black"}
                                textAnchor={drive.direction == "left" ?
                                    "start"
                                    :
                                    "end"
                                }
                            >
                                {currentPlayYards}
                            </text>

                            {/*Down & Distance*/}
                            <text x={xField(109)} y={15} fill="black" textAnchor="end">Play: {index + 1}</text>
                            <text x={xField(109)} y={30} fill="black" textAnchor="end">{getOrdinal(play.down)} & {play.yardsToGo}</text>

                            {/* Transparent click handler*/}
                            <rect x={0} y={1} width={width} height={playHeight -2}
                                  fill={clickFill}
                                  fillOpacity={clickFillOpacity}
                                  onClick={() => handleClick(play)}
                                  style={{ cursor: 'pointer' }}
                            />
                        </Group>
                    )
                })}

                </Group>
            </svg>
        );
    }, [width, drive.plays, filters]);

    return (
        <div>
            {memoizedSvg}
        </div>
    )
}