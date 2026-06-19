import { Drive } from "@/payload-types";
import { Group } from "@visx/group";
import React from "react";
type Play = NonNullable<Drive["plays"]>[number];

interface PlayGraphicProps {
    x: number;
    y: number;
    width: number;
    height: number;
    direction: "left" | "right";
    currentPlayYards: number;
    fill: string;
    fillOpacity: number;
}

export const PlayGraphic = ({ x, y, width, height, direction, currentPlayYards, fill, fillOpacity }: PlayGraphicProps) => {

    const arrowOffset = 5;
    let strokeWidth = 0;

    let directionTrianglePoints = "";

    if ((direction === "left" && currentPlayYards > 0) || (direction === "right" && currentPlayYards < 0)) {
        //left pointing arrow
        directionTrianglePoints += `${x + arrowOffset} ${y},` //left top
        directionTrianglePoints += `${x} ${y + (height/2)},` //left middle
        directionTrianglePoints += `${x + arrowOffset} ${y + height},` //left bottom
        directionTrianglePoints += `${x + width} ${y + height},` //right bottom
        directionTrianglePoints += `${x + width} ${y},` //right top
    } else if ((direction === "right" && currentPlayYards > 0) || (direction === "left" && currentPlayYards < 0)) {
        //right pointing arrow
        directionTrianglePoints += `${x + width - arrowOffset} ${y},` //right top
        directionTrianglePoints += `${x + width} ${y + (height/2)},` //right middle
        directionTrianglePoints += `${x + width - arrowOffset} ${y + height},` //right bottom
        directionTrianglePoints += `${x} ${y + height},` //left bottom
        directionTrianglePoints += `${x} ${y},` //left top
    } else {
        //no arrow, no gain
        strokeWidth = 1;
        directionTrianglePoints += `${x} ${y},` //left top
        directionTrianglePoints += `${x} ${y+height},` //left bottom
        directionTrianglePoints += `${x+width} ${y+height},` //right bottom
        directionTrianglePoints += `${x+width} ${y},` //right top
    }

    //console.log("directionTrianglePoints", directionTrianglePoints)
    return (

        <polygon
            points={directionTrianglePoints}
            fill={fill} fillOpacity={fillOpacity}
            stroke={fill} strokeWidth={strokeWidth}
        />
        // <rect
        //     x={xField(driveMarkerX)}
        //     y={yScale(10)}
        //     width={xScale(driveMarkerWidth)}
        //     height={yScale(30)}
        //     fill={playColor} fillOpacity={fillOpacity}
        // />
    )
}