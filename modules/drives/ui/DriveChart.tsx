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
import { ParentSize } from "@visx/responsive";



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


    return (
        <div>
            <Accordion
                type="single"
                collapsible
                //defaultValue="shipping"
                className="w-full space-y-1"
            >
                {validDrives.map((drive) => (
                    <AccordionItem value={drive.id} key={drive.id} className="bg-transparent overflow-hidden">
                        <AccordionTrigger className="hover:no-underline bg-transparent relative">

                            <ParentSize debounceTime={100} className={" z-0 parentSizeTest"} style={{position: 'absolute', top: 0, left: 0}}>{ ({ width, height }) =>
                                <div className="driveCharTriggerGraphicWrapper">
                                    <DriveChartTriggerGraphic drive={drive} width={width} height={height} />
                                </div>
                            }</ParentSize>

                            <div className="px-6 py-4 bg-transparent relative z-10">
                                {drive.possessingTeam.abbreviation} {drive.possessingTeam.level} | Drive {drive.driveNumber}

                            </div>

                        </AccordionTrigger>
                        <AccordionContent>
                            <DriveRow key={drive.id} drive={drive} />
                        </AccordionContent>
                    </AccordionItem>
                ))}

            </Accordion>

        </div>
    )
}



interface DriveRowProps {
    drive: Drive;
    key: React.Key;
}

const DriveRow = ({ drive }: DriveRowProps) => {
    return (
        <div className="">

            {drive.plays?.map((play, index: number) => (
                <DrivePlay play={play} key={index} />
            ))}

        </div>
    )
}

interface DrivePlay {
    youTubeStart: number;
    youTubeEnd: number;
}

interface DrivePlayProps {
    play: DrivePlay;
    key: React.Key;
}

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
}