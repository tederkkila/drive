import React, { useContext } from "react";
import { Box, AspectRatio } from "@radix-ui/themes";
import { GameContext } from "@/modules/games/ui/GameView";

interface YouTubeEmbedProps {
    videoId: string;
}

export const YouTubeEmbed = ({ videoId }: YouTubeEmbedProps) => {

    const { startTime, endTime } = useContext(GameContext);

        console.log(" startTime", startTime)

        let src = `https://www.youtube.com/embed/${videoId}` + `?start=${startTime}`;
        if (endTime) {
            src += `&end=${endTime}`;
            src += `&loop=1`;
            src += `&playlist=${videoId}`;
            src += `&autoplay=1`;
        }

    const iframeKey = `${startTime}-${endTime}`;

    return (
        <div>
        {src &&
            <Box width={{initial: "100%", md: "1080px"}}>
                <AspectRatio ratio={16 / 9}>
                    <iframe
                        key={iframeKey}
                        // width="560"
                        // height="315"
                        src={src}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{width: "100%", height: "100%"}}
                    />

                </AspectRatio>
            </Box>
        }
        </div>
    )
}