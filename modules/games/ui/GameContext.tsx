"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type GameContextValue = {
    videoId: string;
    setVideoId: React.Dispatch<React.SetStateAction<string>>;
    startTime: number;
    endTime: number;
    setStartTime: React.Dispatch<React.SetStateAction<number>>;
    setEndTime: React.Dispatch<React.SetStateAction<number>>;
    triggerSeekTo: (start: number, end: number) => void;
    seekRequest: {
        start: number;
        end: number;
        count: number;
    };
    triggerPause: () => void;
    pauseTriggerCount: number;
    expandedDriveIds: string[];
    setExpandedDriveIds: React.Dispatch<React.SetStateAction<string[]>>;
};

export const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const [videoId, setVideoId] = useState<string>("");
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(3600);
    const [seekTriggerCount, setSeekTriggerCount] = useState<number>(0);
    const [seekRequest, setSeekRequest] = useState({
        start: 0,
        end: 3600,
        count: 0,
    });
    const [pauseTriggerCount, setPauseTriggerCount] = useState<number>(0);
    const [expandedDriveIdsState, setExpandedDriveIdsState] = useState<string[]>([]);

    const setExpandedDriveIds: React.Dispatch<React.SetStateAction<string[]>> = useCallback((value) => {
        setExpandedDriveIdsState((previous) => {
            const next = typeof value === "function" ? value(previous) : value;

            const isSame =
                previous.length === next.length &&
                previous.every((id, index) => id === next[index]);

            return isSame ? previous : next;
        });
    }, []);

    const triggerSeek = useCallback(() => {
        setSeekTriggerCount(prev => prev + 1);
    }, []);

    const triggerSeekTo = useCallback((start: number, end: number) => {
        setStartTime(start);
        setEndTime(end);
        setSeekRequest((previous) => ({
            start,
            end,
            count: previous.count + 1,
        }));
    }, []);

    const triggerPause = useCallback(() => {
        setPauseTriggerCount(prev => prev + 1);
    }, []);

    const value = useMemo(() => ({
        videoId,
        setVideoId,
        startTime,
        endTime,
        setStartTime,
        setEndTime,
        triggerSeek,
        triggerSeekTo,
        seekTriggerCount,
        seekRequest,
        triggerPause,
        pauseTriggerCount,
        expandedDriveIds: expandedDriveIdsState,
        setExpandedDriveIds
    }), [
        videoId,
        startTime,
        endTime,
        triggerSeek,
        triggerSeekTo,
        seekTriggerCount,
        seekRequest,
        triggerPause,
        pauseTriggerCount,
        expandedDriveIdsState,
        setExpandedDriveIds
    ]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameVideo = () => {
    const context = useContext(GameContext);

    if (!context) {
        throw new Error("useGameVideo must be used within a GameProvider");
    }

    return context;
};