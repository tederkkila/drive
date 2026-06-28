"use client";

import dynamic from "next/dynamic";

export const GameViewClient = dynamic(
    () => import("./GameView").then((mod) => mod.GameView),
    {
        ssr: false,
        loading: () => <div>GameView Loading...</div>,
    },
);