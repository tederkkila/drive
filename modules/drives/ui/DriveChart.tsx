import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Drive, Team } from "@/payload-types";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button";
import { DriveChartGraphic, DriveChartTriggerGraphic } from "@/modules/drives/ui/visx/DriveChartGraphic";
import { ParentSize, /*useParentSize*/ } from "@visx/responsive";
import { useGameVideo } from "@/modules/games/ui/GameContext";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";

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
    teams?: Team[];
    isAuthenticated?: boolean;
    editHref?: string;
}

export const DriveChart = ({
    drives,
    teams = [],
    isAuthenticated = false,
    editHref,
}: DriveChartProps) => {

    // console.log('isAuthenticated', isAuthenticated)
    // console.log('editHref', editHref)

    const {
        expandedDriveIds,
        setExpandedDriveIds,
        triggerSeekTo,
    } = useGameVideo();

    const lastAutoPlayedPlayIdRef = useRef<string | null>(null);
    const hasHandledInitialPlayIdRef = useRef(false);

    const [, setUrlExpandedDriveNumbers] = useQueryState(
        "drive",
        parseAsArrayOf(parseAsInteger).withDefault([])
    );

    const [urlPlayId] = useQueryState(
        "playId",
        parseAsString.withDefault("")
    );

    const [selectedTeamId] = useQueryState(
        "team",
        parseAsString.withDefault("")
    );

    if (!drives || drives.length === 0) return (
        <div>No drives found</div>
    )

    const validDrives = drives
        .filter(hasPopulatedPossessingTeam)
        .filter((drive) => {
            if (!selectedTeamId) return true;

            return drive.possessingTeam.id === selectedTeamId;
        });

    const selectedTeam = teams.find((team) => team.id === selectedTeamId);
    const selectedTeamName = selectedTeam
        ? `${selectedTeam.abbreviation} ${selectedTeam.level}`
        : "this team";

    const driveIds = validDrives.map((drive) => drive.id);

    const getDriveNumbersFromIds = (ids: string[]) => {
        return ids
            .map((id) => driveIds.indexOf(id))
            .filter((index) => index !== -1)
            .map((index) => index + 1);
    };

    useEffect(() => {
        if (hasHandledInitialPlayIdRef.current) return;
        if (validDrives.length === 0) return;

        hasHandledInitialPlayIdRef.current = true;

        if (!urlPlayId) return;
        if (lastAutoPlayedPlayIdRef.current === urlPlayId) return;

        const matchingDrive = validDrives.find((drive) =>
            drive.plays.some((play) => play.id === urlPlayId)
        );

        const matchingPlay = matchingDrive?.plays.find((play) => play.id === urlPlayId);

        if (!matchingDrive || !matchingPlay) return;

        lastAutoPlayedPlayIdRef.current = urlPlayId;

        const nextExpandedDriveIds = expandedDriveIds.includes(matchingDrive.id)
            ? expandedDriveIds
            : [...expandedDriveIds, matchingDrive.id];

        if (nextExpandedDriveIds.length !== expandedDriveIds.length) {
            setExpandedDriveIds(nextExpandedDriveIds);
            setUrlExpandedDriveNumbers(getDriveNumbersFromIds(nextExpandedDriveIds));
        }

        triggerSeekTo(matchingPlay.youTubeStart, matchingPlay.youTubeEnd);
    }, [
        urlPlayId,
        validDrives,
        expandedDriveIds,
        setExpandedDriveIds,
        setUrlExpandedDriveNumbers,
        triggerSeekTo,
    ]);


    const handleExpandedDriveIdsChange = (ids: string[]) => {
        const driveNumbers = getDriveNumbersFromIds(ids);

        setExpandedDriveIds(ids);
        setUrlExpandedDriveNumbers(ids.length > 0 ? driveNumbers : null);
    };

    //const { parentRef, width, height } = useParentSize({ debounceTime: 150 });

    // console.log("parentRef", parentRef)
    // console.log("width", width)
    // console.log("height", height)

    if (validDrives.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        No drives available for {selectedTeamName}
                    </p>
                </div>

                {isAuthenticated && editHref && (
                    <Button asChild>
                        <Link href={editHref} target={"_blank"}>
                            Add a Drive
                        </Link>
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div>
            <Accordion
                type="multiple"
                // collapsible
                // defaultValue="shipping"
                className="w-full space-y-1"
                value={expandedDriveIds}
                onValueChange={handleExpandedDriveIdsChange}
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
