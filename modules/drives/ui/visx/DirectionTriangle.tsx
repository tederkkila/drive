import React from "react";

interface DirectionTrianglePointsProps {
    xField: any;
    yScale: any;
    x: number;
    y: number;
    width: number;
    height: number;
    driveColor: string;
    direction: "left" | "right";
}

export const DirectionTriangle = ({ xField, yScale, x, y, width, height, driveColor, direction }: DirectionTrianglePointsProps) => {

    let directionTrianglePoints = "";

    if (direction === "left") {
        directionTrianglePoints  = `${xField(x - 1.5)} ${yScale(y+(height)/2)},`
        + `${xField(x - 0.25)} ${yScale(y)},`
        + `${xField(x - 0.25)} ${yScale(y+height)}`
    } else if (direction === "right") {
        directionTrianglePoints  = `${xField(x + width + 1.5)} ${yScale(y+(height)/2)},`
        + `${xField(x + width + 0.25)} ${yScale(y)},`
        + `${xField(x + width + 0.25)} ${yScale(y+height)}`
    }

    return (
        <polygon
            points={directionTrianglePoints}
            fill={driveColor}
        />
    )
}