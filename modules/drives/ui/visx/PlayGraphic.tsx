import React from "react";

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
    let strokeWidth = 1;

    let directionTrianglePoints = "";
    //console.log("params", x, y, width, height, direction, currentPlayYards, fill, fillOpacity)

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

    return (

        <polygon
            points={directionTrianglePoints}
            fill={fill} fillOpacity={fillOpacity}
            stroke={fill} strokeWidth={strokeWidth}
        />

    )
}