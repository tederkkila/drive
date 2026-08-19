"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Drive, Game } from "@/payload-types";
import { TimePickerYouTube } from "@/modules/drives/ui/TimePickerYouTube";
import {
    calculateAbsoluteDriveDistance,
    calculateEndSpotAbsolute,
    getAbsolutePosition,
    getFootballSpot,
} from "@/modules/drives/ui/fieldCalculations";

type DriveDirection = "left" | "right";

type DriveResult =
    | "touchdown"
    | "field_goal"
    | "interception"
    | "fumble_lost"
    | "turnover_on_downs"
    | "punt"
    | "end_of_period";

type EditableDriveProperties = {
    driveNumber: number;
    possessingTeam: string;
    direction: DriveDirection;
    startFieldPosition: number;
    result?: DriveResult;
};

const MIN_PLAY_DURATION_SECONDS = 4;

type HashValue = "left" | "middle" | "right";

type PlayType =
    | "run"
    | "pass"
    | "punt"
    | "field_goal"
    | "extra_point"
    | "penalty"
    | "timeout";

type EditablePlay = {
    id?: string;
    playNumber?: number;
    quarter: number;
    down: number;
    yardsToGo: number;
    hash: HashValue;
    youTubeStart: number;
    youTubeEnd: number;
    description: string;
    playType?: PlayType;
    startFieldPosition: number;
    endFieldPosition: number;
    yardsGained: number;
    penalty?: string;
    penaltyYards?: number;
    nullifyPlay?: boolean;
};

interface GameDriveEditorProps {
    game: Game;
    tenantSlug: string;
}

const createEmptyPlay = (playNumber: number): EditablePlay => ({
    playNumber,
    quarter: 1,
    down: 1,
    yardsToGo: 10,
    hash: "middle",
    youTubeStart: 0,
    youTubeEnd: 5,
    description: "",
    playType: "run",
    startFieldPosition: 25,
    endFieldPosition: 25,
    yardsGained: 0,
    penalty: "",
    penaltyYards: undefined,
    nullifyPlay: false,
});

export function GameDriveEditor({ game, tenantSlug }: GameDriveEditorProps) {

    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const teams = [
        typeof game.homeTeam !== "string" ? game.homeTeam : undefined,
        typeof game.awayTeam !== "string" ? game.awayTeam : undefined,
    ].filter((team) => team !== undefined);

    const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id ?? "");
    const [selectedDriveId, setSelectedDriveId] = useState<string>("");
    const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
    const [plays, setPlays] = useState<EditablePlay[]>([]);
    const previousLoadedDriveIdRef = useRef<string>("");

    const [driveProperties, setDriveProperties] = useState<EditableDriveProperties>({
        driveNumber: 1,
        possessingTeam: "",
        direction: "right",
        startFieldPosition: -25,
        result: "punt",
    });

    const driveListQuery = useQuery(
        trpc.games.getDriveListForGame.queryOptions({
            gameId: game.id,
        }),
    );

    const selectedDriveQuery = useQuery({
        ...trpc.drives.getOne.queryOptions({
            driveId: selectedDriveId,
        }),
        enabled: Boolean(selectedDriveId),
    });

    const visibleDriveList = useMemo(() => {
        return driveListQuery.data?.filter((drive) => {
            if (!selectedTeamId) return true;

            return drive.possessingTeam === selectedTeamId;
        }) ?? [];
    }, [driveListQuery.data, selectedTeamId]);

    const createDrive = useMutation(
        trpc.drives.createNextForGame.mutationOptions({
            onSuccess: async (drive) => {
                toast.success(`Drive ${drive.driveNumber} created.`);
                setSelectedDriveId(drive.id);

                await queryClient.invalidateQueries({
                    queryKey: trpc.games.getDriveListForGame.queryKey({
                        gameId: game.id,
                    }),
                });
            },
            onError: (error) => {
                toast.error(`Failed to create drive: ${error.message}`);
            },
        }),
    );

    const updateDriveProperties = useMutation(
        trpc.drives.updateDriveProperties.mutationOptions({
            onSuccess: async () => {
                toast.success("Drive properties saved.");

                await queryClient.invalidateQueries({
                    queryKey: trpc.games.getDriveListForGame.queryKey({
                        gameId: game.id,
                    }),
                });

                if (selectedDriveId) {
                    await queryClient.invalidateQueries({
                        queryKey: trpc.drives.getOne.queryKey({
                            driveId: selectedDriveId,
                        }),
                    });
                }
            },
            onError: (error) => {
                toast.error(`Failed to save drive properties: ${error.message}`);
            },
        }),
    );

    const updatePlays = useMutation(
        trpc.drives.updatePlays.mutationOptions({
            onSuccess: async () => {
                toast.success("Plays saved.");

                if (selectedDriveId) {
                    await queryClient.invalidateQueries({
                        queryKey: trpc.drives.getOne.queryKey({
                            driveId: selectedDriveId,
                        }),
                    });
                }
            },
            onError: (error) => {
                toast.error(`Failed to save plays: ${error.message}`);
            },
        }),
    );

    useEffect(() => {
        const firstDriveId = visibleDriveList[0]?.id;

        if (!selectedDriveId && firstDriveId) {
            setSelectedDriveId(firstDriveId);
            return;
        }

        if (
            selectedDriveId &&
            visibleDriveList.length > 0 &&
            !visibleDriveList.some((drive) => drive.id === selectedDriveId)
        ) {
            setSelectedDriveId(firstDriveId ?? "");
            return;
        }

        if (visibleDriveList.length === 0 && selectedDriveId) {
            setSelectedDriveId("");
            setPlays([]);
            setCurrentPlayIndex(0);
            previousLoadedDriveIdRef.current = "";
        }
    }, [visibleDriveList, selectedDriveId]);

    useEffect(() => {
        const drive = selectedDriveQuery.data as Drive | undefined;

        if (!drive) {
            return;
        }

        const drivePlays = drive?.plays ?? [];
        const isDifferentDrive = previousLoadedDriveIdRef.current !== drive.id;

        previousLoadedDriveIdRef.current = drive.id;

        setDriveProperties({
            driveNumber: drive.driveNumber ?? 1,
            possessingTeam:
                typeof drive.possessingTeam === "string"
                    ? drive.possessingTeam
                    : drive.possessingTeam?.id ?? "",
            direction: drive.direction ?? "right",
            startFieldPosition: drive.startFieldPosition ?? -25,
            result: drive.result ?? "punt",
        });

        setPlays(
            drivePlays.map((play, index) => ({
                id: play.id ?? undefined,
                playNumber: play.playNumber ?? index + 1,
                quarter: play.quarter ?? 1,
                down: play.down ?? 1,
                yardsToGo: play.yardsToGo ?? 10,
                hash: play.hash ?? "middle",
                youTubeStart: play.youTubeStart ?? 0,
                youTubeEnd: play.youTubeEnd ?? 5,
                description: play.description ?? "",
                playType: play.playType ?? "run",
                startFieldPosition: play.startFieldPosition ?? -25,
                endFieldPosition: play.endFieldPosition ?? -25,
                yardsGained: play.yardsGained ?? 0,
                penalty: play.penalty ?? "",
                penaltyYards: play.penaltyYards ?? undefined,
                nullifyPlay: play.nullifyPlay ?? false,
            })),
        );

        setCurrentPlayIndex((index) => {
            if (isDifferentDrive) {
                return 0;
            }

            return Math.max(0, Math.min(index, drivePlays.length - 1));
        });
    }, [selectedDriveQuery.data]);

    const currentPlay = plays[currentPlayIndex];

    const calculateYardsGained = (
        startFieldPosition: number,
        endFieldPosition: number,
        direction: DriveDirection,
    ) => {
        const absoluteStart = getAbsolutePosition(startFieldPosition, direction);
        const absoluteEnd = getAbsolutePosition(endFieldPosition, direction);

        return calculateAbsoluteDriveDistance(
            absoluteStart,
            absoluteEnd,
            direction,
        );
    };

    const selectedDriveNumber = useMemo(() => {
        return visibleDriveList.find((drive) => drive.id === selectedDriveId)?.driveNumber;
    }, [visibleDriveList, selectedDriveId]);

    const patchCurrentPlay = (patch: Partial<EditablePlay>) => {
        setPlays((current) =>
            current.map((play, index) => {
                if (index !== currentPlayIndex) {
                    return play;
                }

                const nextPlay = {
                    ...play,
                    ...patch,
                };

                if (
                    "startFieldPosition" in patch ||
                    "endFieldPosition" in patch
                ) {
                    nextPlay.yardsGained = calculateYardsGained(
                        nextPlay.startFieldPosition,
                        nextPlay.endFieldPosition,
                        driveProperties.direction,
                    );
                }

                if ("youTubeStart" in patch) {
                    const minimumEndTime = nextPlay.youTubeStart + MIN_PLAY_DURATION_SECONDS;

                    if (nextPlay.youTubeEnd < minimumEndTime) {
                        nextPlay.youTubeEnd = minimumEndTime;
                    }
                }

                if ("youTubeEnd" in patch) {
                    const minimumEndTime = nextPlay.youTubeStart + MIN_PLAY_DURATION_SECONDS;

                    if (nextPlay.youTubeEnd < minimumEndTime) {
                        nextPlay.youTubeEnd = minimumEndTime;
                        toast.warning(
                            `End time must be at least ${MIN_PLAY_DURATION_SECONDS} seconds after start time.`,
                        );
                    }
                }

                return nextPlay;
            }),
        );
    };

    const addPlay = () => {
        setPlays((current) => {
            const previousPlay = current.at(-1);
            const nextPlayNumber = current.length + 1;

            const nextPlayStartTime = previousPlay
                ? previousPlay.youTubeEnd + 10
                : 0;

            let previousEndFieldPosition = driveProperties.startFieldPosition;

            if (previousPlay) {

                previousEndFieldPosition = previousPlay.endFieldPosition;

                if (previousPlay.penaltyYards !== undefined) {

                    if (previousPlay.nullifyPlay) {
                        //ignore previous play yardage
                        previousEndFieldPosition = previousPlay.startFieldPosition;
                    }

                    const absoluteSpot = getAbsolutePosition(
                        previousEndFieldPosition,
                        driveProperties.direction,
                    );
                    const absolutePenaltySpot = calculateEndSpotAbsolute(
                        absoluteSpot,
                        previousPlay.penaltyYards,
                        driveProperties.direction,
                    );
                    previousEndFieldPosition = getFootballSpot(
                        absolutePenaltySpot,
                        driveProperties.direction,
                    );
                }
            }


            const nextPlayStartFieldPosition = previousEndFieldPosition;

            const nextPlay: EditablePlay = {
                ...createEmptyPlay(nextPlayNumber),
                quarter: previousPlay?.quarter ?? 1,
                down: previousPlay?.down ?? 1,
                yardsToGo: previousPlay?.yardsToGo ?? 10,
                hash: previousPlay?.hash ?? "middle",
                youTubeStart: nextPlayStartTime,
                youTubeEnd: nextPlayStartTime + 10,
                startFieldPosition: nextPlayStartFieldPosition,
                endFieldPosition: nextPlayStartFieldPosition,
                yardsGained: calculateYardsGained(
                    nextPlayStartFieldPosition,
                    nextPlayStartFieldPosition,
                    driveProperties.direction,
                ),
            };

            setCurrentPlayIndex(current.length);
            return [...current, nextPlay];
        });
    };

    const removeCurrentPlay = () => {
        setPlays((current) => {
            const next = current.filter((_, index) => index !== currentPlayIndex);

            setCurrentPlayIndex((index) => Math.max(0, Math.min(index, next.length - 1)));

            return next.map((play, index) => ({
                ...play,
                playNumber: index + 1,
            }));
        });
    };

    const savePlays = () => {
        if (!selectedDriveId) {
            toast.error("Select a drive first.");
            return;
        }

        updatePlays.mutate({
            driveId: selectedDriveId,
            plays,
        });
    };

    const patchDriveProperties = (patch: Partial<EditableDriveProperties>) => {
        setDriveProperties((current) => {
            const nextDriveProperties = {
                ...current,
                ...patch,
            };

            if ("direction" in patch) {
                setPlays((currentPlays) =>
                    currentPlays.map((play) => ({
                        ...play,
                        yardsGained: calculateYardsGained(
                            play.startFieldPosition,
                            play.endFieldPosition,
                            nextDriveProperties.direction,
                        ),
                    })),
                );
            }

            return nextDriveProperties;
        });
    };

    const saveDriveProperties = () => {
        if (!selectedDriveId) {
            toast.error("Select a drive first.");
            return;
        }

        updateDriveProperties.mutate({
            driveId: selectedDriveId,
            ...driveProperties,
        });
    };

    const handleSelectedTeamChange = (teamId: string) => {
        setSelectedTeamId(teamId);
        setSelectedDriveId("");
        setPlays([]);
        setCurrentPlayIndex(0);
        previousLoadedDriveIdRef.current = "";
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Team</CardTitle>
                    <CardDescription>
                        Select the team whose drives and plays you want to edit.
                    </CardDescription>
                </CardHeader>
                <CardContent className="w-full md:max-w-xs space-y-2">
                    <Label>Selected Team</Label>
                    <Select value={selectedTeamId} onValueChange={handleSelectedTeamChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select team"/>
                        </SelectTrigger>
                        <SelectContent>
                            {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Drives</CardTitle>
                    <CardDescription>
                        Select an existing drive or create the next drive for the selected team.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="w-full md:max-w-xs space-y-2">
                        <Label>Selected Drive</Label>
                        <Select value={selectedDriveId} onValueChange={setSelectedDriveId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a drive"/>
                            </SelectTrigger>
                            <SelectContent>
                                {visibleDriveList.map((drive) => (
                                    <SelectItem key={drive.id} value={drive.id}>
                                        Drive {drive.driveNumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="button"
                        onClick={() => createDrive.mutate(
                            {
                                gameId: game.id,
                                tenantSlug,
                                possessingTeamId: selectedTeamId,
                            }
                        )}
                        disabled={createDrive.isPending || !selectedTeamId}
                    >
                        {createDrive.isPending ? "Creating..." : "Create New Drive"}
                    </Button>
                </CardContent>
            </Card>

            {!selectedDriveId ? (
                <Card>
                    <CardContent className="py-8 text-sm text-muted-foreground">
                        Select or create a drive to begin editing plays.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Drive Properties</CardTitle>
                            <CardDescription>
                                View and edit the selected drive metadata.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <div className="space-y-2">
                                    <Label>Drive Number</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={driveProperties.driveNumber}
                                        onChange={(event) =>
                                            patchDriveProperties({
                                                driveNumber: Number(event.target.value),
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Possessing Team</Label>
                                    <Select
                                        value={driveProperties.possessingTeam}
                                        onValueChange={(value) =>
                                            patchDriveProperties({
                                                possessingTeam: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select team"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teams.map((team) => (
                                                <SelectItem key={team.id} value={team.id}>
                                                    {team.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Direction</Label>
                                    <Select
                                        value={driveProperties.direction}
                                        onValueChange={(value: DriveDirection) =>
                                            patchDriveProperties({
                                                direction: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Start Field Position</Label>
                                    <Input
                                        type="number"
                                        value={driveProperties.startFieldPosition}
                                        onChange={(event) =>
                                            patchDriveProperties({
                                                startFieldPosition: Number(event.target.value),
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Result</Label>
                                    <Select
                                        value={driveProperties.result}
                                        onValueChange={(value: DriveResult) =>
                                            patchDriveProperties({
                                                result: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select result"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="touchdown">Touchdown</SelectItem>
                                            <SelectItem value="field_goal">Field Goal</SelectItem>
                                            <SelectItem value="interception">Interception</SelectItem>
                                            <SelectItem value="fumble_lost">Fumble Lost</SelectItem>
                                            <SelectItem value="turnover_on_downs">
                                                Turnover on Downs
                                            </SelectItem>
                                            <SelectItem value="punt">Punt</SelectItem>
                                            <SelectItem value="end_of_period">End of Period</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={saveDriveProperties}
                                    disabled={updateDriveProperties.isPending}
                                >
                                    {updateDriveProperties.isPending
                                        ? "Saving Drive..."
                                        : "Save Drive Properties"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Play Editor{selectedDriveNumber ? ` — Drive ${selectedDriveNumber}` : ""}
                            </CardTitle>
                            <CardDescription>
                                Add, remove, navigate, and edit plays for the selected drive.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={currentPlayIndex === 0}
                                    onClick={() => setCurrentPlayIndex((index) => Math.max(0, index - 1))}
                                >
                                    Previous Play
                                </Button>

                                <div className="text-sm text-muted-foreground">
                                    {plays.length === 0
                                        ? "No plays yet"
                                        : `Play ${currentPlayIndex + 1} of ${plays.length}`}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={plays.length === 0 || currentPlayIndex >= plays.length - 1}
                                    onClick={() =>
                                        setCurrentPlayIndex((index) =>
                                            Math.min(plays.length - 1, index + 1),
                                        )
                                    }
                                >
                                    Next Play
                                </Button>

                                <Button type="button" onClick={addPlay}>
                                    Add Play
                                </Button>

                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={!currentPlay}
                                    onClick={removeCurrentPlay}
                                >
                                    Remove Play
                                </Button>
                            </div>

                            {!currentPlay ? (
                                <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                                    No play selected. Add a play to begin.
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        <TimePickerYouTube
                                            videoId={game.videoId}
                                            time={currentPlay.youTubeStart}
                                            label="Start Frame"
                                            onPickTime={(time) =>
                                                patchCurrentPlay({
                                                    youTubeStart: time,
                                                })
                                            }
                                            key="start"
                                        />

                                        <TimePickerYouTube
                                            videoId={game.videoId}
                                            time={currentPlay.youTubeEnd}
                                            label="End Frame"
                                            onPickTime={(time) =>
                                                patchCurrentPlay({
                                                    youTubeEnd: Math.max(
                                                        time,
                                                        currentPlay.youTubeStart + MIN_PLAY_DURATION_SECONDS,
                                                    ),
                                                })
                                            }
                                            key="end"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mbe-2">

                                        <div className="space-y-2">
                                            <Label>Quarter</Label>
                                            <RadioGroup
                                                value={String(currentPlay.quarter ?? 1)}
                                                onValueChange={(value) => patchCurrentPlay({ quarter: Number(value) })}
                                                className="flex gap-4"
                                            >
                                                {[1, 2, 3, 4].map((q) => (
                                                    <div key={q} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={String(q)} id={`quarter-${q}`}/>
                                                        <Label htmlFor={`quarter-${q}`} className="cursor-pointer font-normal">
                                                            {q}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Down</Label>
                                            <RadioGroup
                                                value={String(currentPlay.down ?? 1)}
                                                onValueChange={(value) => patchCurrentPlay({ down: Number(value) })}
                                                className="flex gap-4"
                                            >
                                                {[1, 2, 3, 4].map((q) => (
                                                    <div key={q} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={String(q)} id={`down-${q}`}/>
                                                        <Label htmlFor={`down-${q}`} className="cursor-pointer font-normal">
                                                            {q}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Distance</Label>
                                            <Input
                                                type="number"
                                                value={currentPlay.yardsToGo}
                                                onChange={(event) =>
                                                    patchCurrentPlay({
                                                        yardsToGo: Number(event.target.value),
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Hash</Label>
                                            <RadioGroup
                                                value={currentPlay.hash}
                                                onValueChange={(value: HashValue) =>
                                                    patchCurrentPlay({ hash: value })
                                                }
                                                className="flex gap-4"
                                            >
                                                {["left", "middle", "right"].map((hash) => (
                                                    <div key={hash} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={hash} id={`hash-${hash}`}/>
                                                        <Label htmlFor={`hash-${hash}`} className="cursor-pointer font-normal">
                                                            {hash}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mbe-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={currentPlay.description}
                                            onChange={(event) =>
                                                patchCurrentPlay({
                                                    description: event.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label>Play Type</Label>
                                            <Select
                                                value={currentPlay.playType}
                                                onValueChange={(value: PlayType) =>
                                                    patchCurrentPlay({ playType: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="run">Run</SelectItem>
                                                    <SelectItem value="pass">Pass</SelectItem>
                                                    <SelectItem value="punt">Punt</SelectItem>
                                                    <SelectItem value="field_goal">Field Goal</SelectItem>
                                                    <SelectItem value="extra_point">Extra Point</SelectItem>
                                                    <SelectItem value="penalty">Penalty</SelectItem>
                                                    <SelectItem value="timeout">Timeout</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Start Field Position</Label>
                                            <Input
                                                type="number"
                                                value={currentPlay.startFieldPosition}
                                                onChange={(event) =>
                                                    patchCurrentPlay({
                                                        startFieldPosition: Number(event.target.value),
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>End Field Position</Label>
                                            <Input
                                                type="number"
                                                value={currentPlay.endFieldPosition}
                                                onChange={(event) =>
                                                    patchCurrentPlay({
                                                        endFieldPosition: Number(event.target.value),
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Yards Gained</Label>
                                            <Input
                                                type="number"
                                                value={currentPlay.yardsGained}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Penalty</Label>
                                            <Input
                                                value={currentPlay.penalty ?? ""}
                                                onChange={(event) =>
                                                    patchCurrentPlay({
                                                        penalty: event.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Penalty Yards</Label>
                                            <Input
                                                type="number"
                                                value={currentPlay.penaltyYards ?? ""}
                                                onChange={(event) =>
                                                    patchCurrentPlay({
                                                        penaltyYards: event.target.value
                                                            ? Number(event.target.value)
                                                            : undefined,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Nullify Play</Label>
                                            <Checkbox
                                                name="nullify-checkbox"
                                                id="nullify-checkbox"
                                                checked={currentPlay.nullifyPlay}
                                                onCheckedChange={(checked) =>
                                                    patchCurrentPlay({
                                                        nullifyPlay: !!checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            onClick={savePlays}
                                            disabled={updatePlays.isPending}
                                        >
                                            {updatePlays.isPending ? "Saving..." : "Save Plays"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}