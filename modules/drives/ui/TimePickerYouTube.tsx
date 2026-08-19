import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";
import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box } from "@radix-ui/themes";
import { Input } from "@/components/ui/input";

interface TimePickerYouTubeProps {
    videoId: string;
    time: number;
    label: string;
    onPickTime: (time: number) => void;
}

export const TimePickerYouTube = ({
    videoId,
    time,
    label,
    onPickTime,
}: TimePickerYouTubeProps) => {
    const playerRef = useRef<YouTubePlayer  | null>(null);
    const [ isPlayerReady, setIsPlayerReady ] = useState(false);

  // Guard references to track state changes safely
    const lastSoughtTimeRef = useRef<number | null>(null);
    const isProgrammaticSeekRef = useRef<boolean>(false);

    const normalizedTime = Number.isFinite(time) ? Math.max(0, time) : 0;
    const floorTime = Math.floor(normalizedTime);

    // Capture the initial time once on mount/video change to prevent
    // react-youtube from rebuilding the player options on every prop change.
    const initialTimeRef = useRef<number>(floorTime);

    const opts: YouTubeProps["opts"] = {
        width: "100%",
        height: "360",
        playerVars: {
            controls: 1,
            rel: 0,
            playsinline: 1,
            disablekb: 0,
          // Use the stable ref here so opts object doesn't mutate dynamically
          start: initialTimeRef.current,
        },
    };

  // 3. Update return type here
  const getSafePlayer = async (): Promise<YouTubePlayer | null> => {
        const player = playerRef.current;
    if (!player || typeof player.seekTo !== "function") return null;
        try {
            const iframe = typeof player.getIframe === "function"
                ? await player.getIframe()
                : null;

            if (!iframe || !iframe.src) return null;
            return player;
        } catch {
            return null;
        }
    };

  // Triggers the micro-playback trick to flush out the fallback thumbnail image
    const forceRenderFrame = async (targetTime: number) => {
        const player = await getSafePlayer();
        if (!player) return;

        lastSoughtTimeRef.current = targetTime;
        isProgrammaticSeekRef.current = true;

        // 1. Mute to prevent any audio pops during the frame flash
        if (typeof player.mute === "function") await player.mute();

        // 2. Displace playhead to target timestamp
        await player.seekTo(targetTime, true);

        // 3. Command playback to force buffer hydration
        if (typeof player.playVideo === "function") await player.playVideo();
    };

    // Intercept state updates to instantly freeze the player once the frame arrives
    const handleStateChange: YouTubeProps["onStateChange"] = (event) => {
        const playerState = event.data;
        const player = event.target;

        // State 1 = PLAYING
        if (playerState === 1 && isProgrammaticSeekRef.current) {
            isProgrammaticSeekRef.current = false;

            // Pause immediately now that the frame is rendered on canvas
            if (typeof player.pauseVideo === "function") {
                void player.pauseVideo();
            }

            // Restore user audio configuration
            if (typeof player.unMute === "function") {
                void player.unMute();
            }
        }
    };

  // Sync external parent prop changes
    useEffect(() => {
        if (!isPlayerReady) return;

        const syncPlayer = async () => {
            const player = await getSafePlayer();
            if (!player) return;

            const playerTime = Math.floor(await player.getCurrentTime());

            // Check if the parent time is genuinely different from player's position
            if (playerTime !== floorTime && lastSoughtTimeRef.current !== floorTime) {
                await forceRenderFrame(floorTime);
            }
        };

        void syncPlayer();
  }, [floorTime, isPlayerReady]);

  // Handle absolute video switches
    useEffect(() => {
        setIsPlayerReady(false);
        playerRef.current = null;
        lastSoughtTimeRef.current = null;
        isProgrammaticSeekRef.current = false;
        initialTimeRef.current = floorTime; // Update initial start time window for the new video
    }, [ videoId ]);

    const handleReady: YouTubeProps["onReady"] = (event) => {
        playerRef.current = event.target;
        setIsPlayerReady(true);

        // On first load, enforce the visual seek and pause block
        void forceRenderFrame(floorTime);
    };

    const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const parsedValue = parseInt(value, 10);
        if (!Number.isNaN(parsedValue)) {
            const roundedTime = Math.floor(parsedValue);
            onPickTime(roundedTime);
            await forceRenderFrame(roundedTime);
        }
    }

    const pickCurrentTime = async () => {
        const player = await getSafePlayer();

        if (!player || typeof player.getCurrentTime !== "function") return;

        const currentTime = await player.getCurrentTime();
        const roundedTime = Math.floor(currentTime);

        onPickTime(roundedTime);
        await forceRenderFrame(roundedTime);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{label}</CardTitle>
                {/*<CardDescription>*/}
                {/*    Scrub to the correct frame, then click “Use current time”.*/}
                {/*</CardDescription>*/}
            </CardHeader>
            <CardContent className="space-y-2 [--card-spacing:--spacing(2)]">
                <YouTube
                    key={videoId}
                    videoId={videoId}
                    opts={opts}
                    onReady={handleReady}
                    onStateChange={handleStateChange}
                />
                <Box className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={pickCurrentTime}>
                        Use current time
                    </Button>
                    <Input
                        className="ml-2 w-20"
                        type="number"
                        step="1"
                        value={floorTime}
                        onChange={handleInputChange}
                    />
                    <span className="ml-2 text-xs font-mono text-gray-500 select-none">
                        {new Date(floorTime * 1000).toISOString().substring(11, 19)}
                    </span>
                </Box>
            </CardContent>
        </Card>
    );
};
