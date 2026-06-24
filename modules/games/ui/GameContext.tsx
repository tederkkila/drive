"use client";

import React, { createContext, useContext, useState } from "react";

export type GameContextValue = {
    videoId: string;
    setVideoId: React.Dispatch<React.SetStateAction<string>>;
    startTime: number;
    endTime: number;
    setStartTime: React.Dispatch<React.SetStateAction<number>>;
    setEndTime: React.Dispatch<React.SetStateAction<number>>;
    triggerSeek: () => void;      // New action to force a jump
    seekTriggerCount: number;     // Observable dependency item
    expandedDriveIds: string[];
    setExpandedDriveIds: (ids: string[]) => void;
};

export const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
    const [videoId, setVideoId] = useState<string>("");
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(3600);
    const [seekTriggerCount, setSeekTriggerCount] = useState<number>(0);
    const [expandedDriveIds, setExpandedDriveIds] = useState<string[]>([]);

    const triggerSeek = () => {
        setSeekTriggerCount(prev => prev + 1);
    };

    const value = {
        videoId,
        setVideoId,
        startTime,
        endTime,
        setStartTime,
        setEndTime,
        triggerSeek,
        seekTriggerCount,
        expandedDriveIds,
        setExpandedDriveIds
    };

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