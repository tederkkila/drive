"use client";

import React, { createContext, useContext } from "react";

export type GameContextValue = {
    videoId: string;
    startTime: number;
    endTime: number;
    setStartTime: React.Dispatch<React.SetStateAction<number>>;
    setEndTime: React.Dispatch<React.SetStateAction<number>>;
};

export const GameContext = createContext<GameContextValue | null>(null);

export const useGameVideo = () => {
    const context = useContext(GameContext);

    if (!context) {
        throw new Error("useGameVideo must be used within a GameProvider");
    }

    return context;
};