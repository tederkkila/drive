"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Drive, Game } from "@/payload-types";

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

function TimePickerYouTube({
                               videoId,
                               time,
                               label,
                               onPickTime,
                           }: {
    videoId: string;
    time: number;
    label: string;
    onPickTime: (time: number) => void;
}) {
    const playerRef = useRef<YT.Player | null>(null);
    const pauseTimeoutRef = useRef<number | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    const normalizedTime = Number.isFinite(time) ? Math.max(0, time) : 0;

    const opts: YouTubeProps["opts"] = {
        width: "100%",
        height: "360",
        playerVars: {
            controls: 1,
            rel: 0,
            playsinline: 1,
            disablekb: 0,
        },
    };

    const clearPauseTimeout = () => {
        if (pauseTimeoutRef.current !== null) {
            window.clearTimeout(pauseTimeoutRef.current);
            pauseTimeoutRef.current = null;
        }
    };

    const getSafePlayer = () => {
        const player = playerRef.current;

        if (!player || typeof player.seekTo !== "function") {
            return null;
        }

        try {
            const iframe = typeof player.getIframe === "function"
                ? player.getIframe()
                : null;

            if (!iframe || !iframe.src) {
                return null;
            }

            return player;
        } catch {
            return null;
        }
    };

    const seekPlayerToTime = (targetTime: number) => {
        const player = getSafePlayer();

        if (!player) {
            return;
        }

        clearPauseTimeout();

        try {
        player.seekTo(targetTime, true);

            pauseTimeoutRef.current = window.setTimeout(() => {
                const safePlayer = getSafePlayer();

                if (safePlayer && typeof safePlayer.pauseVideo === "function") {
                    safePlayer.pauseVideo();
            }
            }, 250);
        } catch {
            // The YouTube iframe can briefly be unavailable while React is rendering/remounting.
            // Ignoring this prevents a transient iframe state from crashing the editor.
        }
    };

    const handleReady: YouTubeProps["onReady"] = (event) => {
        playerRef.current = event.target;
        setIsPlayerReady(true);

        window.setTimeout(() => {
        seekPlayerToTime(normalizedTime);
        }, 250);
    };

    useEffect(() => {
        if (!isPlayerReady) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
        seekPlayerToTime(normalizedTime);
        }, 100);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isPlayerReady, normalizedTime]);

    useEffect(() => {
        return () => {
            clearPauseTimeout();
            playerRef.current = null;
        };
    }, []);

    const pickCurrentTime = async () => {
        const player = getSafePlayer();

        if (!player || typeof player.getCurrentTime !== "function") {
            return;
        }

        const currentTime = await player.getCurrentTime();

        if (typeof currentTime === "number") {
            onPickTime(Math.floor(currentTime));
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{label}</CardTitle>
                <CardDescription>
                    Scrub to the correct frame, then click “Use current time”.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <YouTube videoId={videoId} opts={opts} onReady={handleReady} />
                <Button type="button" variant="outline" onClick={pickCurrentTime}>
                    Use current time
                </Button>
            </CardContent>
        </Card>
    );
}

export function GameDriveEditor({ game, tenantSlug }: GameDriveEditorProps) {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [selectedDriveId, setSelectedDriveId] = useState<string>("");
    const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
    const [plays, setPlays] = useState<EditablePlay[]>([]);
    const [driveProperties, setDriveProperties] = useState<EditableDriveProperties>({
        driveNumber: 1,
        possessingTeam: "",
        direction: "right",
        startFieldPosition: 25,
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

    const createDrive = useMutation(
        trpc.drives.createNextForGame.mutationOptions({
            onSuccess: async (drive) => {
                toast.success(`Drive ${drive.driveNumber} created.`);
                setSelectedDriveId(drive.id);

                await queryClient.invalidateQueries(
                    trpc.games.getDriveListForGame.queryFilter({
                        gameId: game.id,
                    }),
                );
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

                await queryClient.invalidateQueries(
                    trpc.games.getDriveListForGame.queryFilter({
                        gameId: game.id,
                    }),
                );

                if (selectedDriveId) {
                    await queryClient.invalidateQueries(
                        trpc.drives.getOne.queryFilter({
                            driveId: selectedDriveId,
                        }),
                    );
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
                    await queryClient.invalidateQueries(
                        trpc.drives.getOne.queryFilter({
                            driveId: selectedDriveId,
                        }),
                    );
                }
            },
            onError: (error) => {
                toast.error(`Failed to save plays: ${error.message}`);
            },
        }),
    );

    useEffect(() => {
        const firstDriveId = driveListQuery.data?.[0]?.id;

        if (!selectedDriveId && firstDriveId) {
            setSelectedDriveId(firstDriveId);
        }
    }, [driveListQuery.data, selectedDriveId]);

    useEffect(() => {
        const drive = selectedDriveQuery.data as Drive | undefined;
        const drivePlays = drive?.plays ?? [];

        if (drive) {
            setDriveProperties({
                driveNumber: drive.driveNumber ?? 1,
                possessingTeam:
                    typeof drive.possessingTeam === "string"
                        ? drive.possessingTeam
                        : drive.possessingTeam?.id ?? "",
                direction: drive.direction ?? "right",
                startFieldPosition: drive.startFieldPosition ?? 25,
                result: drive.result ?? "punt",
            });
        }

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
                startFieldPosition: play.startFieldPosition ?? 25,
                endFieldPosition: play.endFieldPosition ?? 25,
                yardsGained: play.yardsGained ?? 0,
                penalty: play.penalty ?? "",
                penaltyYards: play.penaltyYards ?? undefined,
                nullifyPlay: play.nullifyPlay ?? false,
            })),
        );

        setCurrentPlayIndex(0);
    }, [selectedDriveQuery.data]);

    const currentPlay = plays[currentPlayIndex];

    const selectedDriveNumber = useMemo(() => {
        return driveListQuery.data?.find((drive) => drive.id === selectedDriveId)?.driveNumber;
    }, [driveListQuery.data, selectedDriveId]);

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
            const nextPlay = createEmptyPlay(current.length + 1);
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
        setDriveProperties((current) => ({
            ...current,
            ...patch,
        }));
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Drives</CardTitle>
                    <CardDescription>
                        Select an existing drive or create the next drive for this game.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="w-full md:max-w-xs space-y-2">
                        <Label>Selected Drive</Label>
                        <Select value={selectedDriveId} onValueChange={setSelectedDriveId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a drive" />
                            </SelectTrigger>
                            <SelectContent>
                                {driveListQuery.data?.map((drive) => (
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
                            }
                        )}
                        disabled={createDrive.isPending}
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
                                        <SelectValue placeholder="Select team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeof game.homeTeam !== "string" && (
                                            <SelectItem value={game.homeTeam.id}>
                                                {game.homeTeam.name}
                                            </SelectItem>
                                        )}

                                        {typeof game.awayTeam !== "string" && (
                                            <SelectItem value={game.awayTeam.id}>
                                                {game.awayTeam.name}
                                            </SelectItem>
                                        )}
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
                                        <SelectValue />
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
                                        <SelectValue placeholder="Select result" />
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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label>Quarter</Label>
                                        <Input
                                            type="number"
                                            value={currentPlay.quarter}
                                            onChange={(event) =>
                                                patchCurrentPlay({
                                                    quarter: Number(event.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Down</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={4}
                                            value={currentPlay.down}
                                            onChange={(event) =>
                                                patchCurrentPlay({
                                                    down: Number(event.target.value),
                                                })
                                            }
                                        />
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
                                        <Select
                                            value={currentPlay.hash}
                                            onValueChange={(value: HashValue) =>
                                                patchCurrentPlay({ hash: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="left">Left</SelectItem>
                                                <SelectItem value="middle">Middle</SelectItem>
                                                <SelectItem value="right">Right</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>YouTube Start Time</Label>
                                        <Input
                                            type="number"
                                            step="1"
                                            value={currentPlay.youTubeStart}
                                            onChange={(event) =>
                                                patchCurrentPlay({
                                                    youTubeStart: Number(event.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>YouTube End Time</Label>
                                        <Input
                                            type="number"
                                            step="1"
                                            min={currentPlay.youTubeStart + MIN_PLAY_DURATION_SECONDS}
                                            value={currentPlay.youTubeEnd}
                                            onChange={(event) =>
                                                patchCurrentPlay({
                                                    youTubeEnd: Number(event.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

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
                                    />
                                </div>

                                <div className="space-y-2">
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
                                                <SelectValue />
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
                                            onChange={(event) =>
                                                patchCurrentPlay({
                                                    yardsGained: Number(event.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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