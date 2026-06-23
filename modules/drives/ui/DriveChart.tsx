import React from "react";
import { Drive, Team } from "@/payload-types";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useGameVideo } from "@/modules/games/ui/GameContext";
import { DriveChartGraphic, DriveChartTriggerGraphic } from "@/modules/drives/ui/visx/DriveChartGraphic";
import { ParentSize, /*useParentSize*/ } from "@visx/responsive";



function hasPopulatedPossessingTeam(
    drive: Drive,
): drive is Drive & { possessingTeam: Team; plays: NonNullable<Drive["plays"]> } {
    return (
        typeof drive.possessingTeam === "object" &&
        drive.possessingTeam !== null &&
        "abbreviation" in drive.possessingTeam &&
        "level" in drive.possessingTeam &&
        Array.isArray(drive.plays) &&
        drive.plays.length > 0
    );
}

interface DriveChartProps {
    drives: Drive[];
}

export const DriveChart = ({ drives }: DriveChartProps) => {

    //console.log("drives", drives)

    if (!drives || drives.length === 0) return (
        <div>No drives found</div>
    )

    const validDrives = drives.filter(hasPopulatedPossessingTeam);
    //const { parentRef, width, height } = useParentSize({ debounceTime: 150 });

    // console.log("parentRef", parentRef)
    // console.log("width", width)
    // console.log("height", height)

    return (
        <div>
            <Accordion
                type="multiple"
                // collapsible
                // defaultValue="shipping"
                className="w-full space-y-1"
            >
                {validDrives.map((drive) => (
                    <AccordionItem value={drive.id} key={drive.id} className="bg-transparent overflow-hidden">

                        <AccordionTrigger className="hover:no-underline bg-transparent relative">

                            <ParentSize debounceTime={100} className={"z-0 parentSizeTest"} style={{position: 'absolute', top: 0, left: 0}}>{ ({ width, height }) =>
                                <div className="driveCharTriggerGraphicWrapper">
                                    <DriveChartTriggerGraphic drive={drive} width={width} height={height} />
                                </div>
                            }</ParentSize>

                            <div className="px-6 py-4 bg-transparent relative z-10">
                                {drive.possessingTeam.abbreviation} {drive.possessingTeam.level} | Drive {drive.driveNumber}

                            </div>

                        </AccordionTrigger>

                        <AccordionContent>


                            {/*<div ref={parentRef}*/}

                            {/*     //className={`test h-[${drive.plays.length * 40}px] w-full`}*/}
                            {/*>*/}
                            {/*    /!* Only render the chart when the accordion stops moving *!/*/}
                            {/*    {width > 0 && height > 0 && (*/}
                            {/*        <DriveChartGraphic drive={drive} width={width} height={height}/>*/}
                            {/*        // <svg width={width} height={height} className="fade-in duration-200">*/}
                            {/*        //     <rect width={width} height={height} fill="#f3f4f6" />*/}
                            {/*        // </svg>*/}
                            {/*    )}*/}
                            {/*</div>*/}

                            <div
                                style={{height: `${drive.plays.length * 40}px`}}
                                // className={`tedtest h-[${drive.plays.length * 40}px] w-full`}
                            >
                                <ParentSize debounceTime={500} className={""}>{ ({ width, height }) => {
                                    if (width === 0 || height === 0) return null;
                                    return (
                                        <DriveChartGraphic drive={drive} width={width} height={height} />
                                    )
                                }}</ParentSize>
                            </div>

                                {/*<DriveRow key={drive.id} drive={drive} />*/}
                        </AccordionContent>
                    </AccordionItem>
                ))}

            </Accordion>

        </div>
    )
}



/*interface DriveRowProps {
    drive: Drive;
    key: React.Key;
}*/

/*const DriveRow = ({ drive }: DriveRowProps) => {
    return (
        <div className="">

            {drive.plays?.map((play, index: number) => (
                <DrivePlay play={play} key={index} />
            ))}

        </div>
    )
}*/

/*interface DrivePlay {
    youTubeStart: number;
    youTubeEnd: number;
}*/

/*interface DrivePlayProps {
    play: DrivePlay;
    key: React.Key;
}*/

/*
const DrivePlay = ({ play }: DrivePlayProps) => {
    //console.log("play", play)

    const { setStartTime, setEndTime } = useGameVideo();

    const updateTime = () => {
        //console.log("play", play)
        setStartTime(play.youTubeStart);
        setEndTime(play.youTubeEnd);
    }

    return (
        <div>
            <div>Drive Play</div>
            <Button onClick={updateTime}>PLAY</Button>
        </div>
    )
}*/
