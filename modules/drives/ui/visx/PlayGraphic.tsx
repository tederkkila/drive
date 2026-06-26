import React from "react";
import { Group } from '@visx/group';

interface PlayGraphicProps {
    x: number;
    y: number;
    width: number;
    height: number;
    direction: "left" | "right";
    hash?: 'left' | 'middle' | 'right';
    currentPlayYards: number;
    fill: string;
    fillOpacity: number;
    skinny?: boolean;
    showBall?: boolean;
}

export const PlayGraphic = ({ x, y, width, height, direction, hash, currentPlayYards, fill, fillOpacity, skinny, showBall }: PlayGraphicProps) => {

    const arrowOffset = 5;
    const skinnyOffset = skinny ? 5 : 0;
    let strokeWidth = 1;

    let fadeDirection = "";
    let directionTrianglePoints = "";
    //console.log("params", x, y, width, height, direction, currentPlayYards, fill, fillOpacity)

    let footballGraphicX: number;
    const footballGraphicY = (): number => {
        if (hash === undefined) return y;
        const diamondOffset = 4.5

        if (direction === "left") {
            switch (hash) {
                case 'left':
                    return y + height - diamondOffset;
                case 'middle':
                    return y + (height/2) - diamondOffset;
                case 'right':
                    return  y  - diamondOffset;
                default:
                    return y
            }
        } else if (direction === "right") {
            switch (hash) {
                case 'left':
                    return y - diamondOffset;
                case 'middle':
                    return y + (height/2) - diamondOffset;
                case 'right':
                    return  y + (height) - diamondOffset;
                default:
                    return y
            }
        }

        return y;

    };

    if ((direction === "left" && currentPlayYards > 0) || (direction === "right" && currentPlayYards < 0)) {
        //left pointing arrow
        directionTrianglePoints += `${x + arrowOffset} ${y + skinnyOffset},` //left top
        directionTrianglePoints += `${x} ${y + (height/2)},` //left middle
        directionTrianglePoints += `${x + arrowOffset} ${y + height - skinnyOffset},` //left bottom
        directionTrianglePoints += `${x + width} ${y + height - skinnyOffset},` //right bottom
        directionTrianglePoints += `${x + width} ${y + skinnyOffset},` //right top

        footballGraphicX = x + width - 5;
        fadeDirection = "fadeGradientRight";

    } else if ((direction === "right" && currentPlayYards > 0) || (direction === "left" && currentPlayYards < 0)) {
        //right pointing arrow
        directionTrianglePoints += `${x + width - arrowOffset} ${y + skinnyOffset},` //right top
        directionTrianglePoints += `${x + width} ${y + (height/2)},` //right middle
        directionTrianglePoints += `${x + width - arrowOffset} ${y + height - skinnyOffset},` //right bottom
        directionTrianglePoints += `${x} ${y + height - skinnyOffset},` //left bottom
        directionTrianglePoints += `${x} ${y + skinnyOffset},` //left top

        footballGraphicX = x - 5;
        fadeDirection = "fadeGradientLeft";

    } else {
        //no arrow, no gain
        strokeWidth = 1;
        directionTrianglePoints += `${x} ${y + skinnyOffset},` //left top
        directionTrianglePoints += `${x} ${y + height - skinnyOffset},` //left bottom
        directionTrianglePoints += `${x + width} ${y + height - skinnyOffset},` //right bottom
        directionTrianglePoints += `${x + width} ${y + skinnyOffset},` //right top

        footballGraphicX = x-4.5;
        fadeDirection = "none";
    }

    return (
        <Group>
            <defs>
                <linearGradient id="fadeGradientRight" >
                    <stop offset="0%" stopColor="yellow" stopOpacity="1" />
                    <stop offset="100%" stopColor="yellow" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="fadeGradientLeft" >
                    <stop offset="0%" stopColor="yellow" stopOpacity="0" />
                    <stop offset="100%" stopColor="yellow" stopOpacity="1" />
                </linearGradient>
            </defs>

            {!skinny || fadeDirection === "none" ?
                <polygon
                    points={directionTrianglePoints}
                    fill={fill} fillOpacity={fillOpacity}
                    stroke={fill} strokeWidth={strokeWidth}
                />
            :
                <polygon
                points={directionTrianglePoints}
                fill={`url(#${fadeDirection})`}
                stroke={fill} strokeWidth={strokeWidth}
                />
            }


            {showBall && <FootballGraphic x={footballGraphicX} y={footballGraphicY()} />}
        </Group>
    )
}

interface FootballGraphicProps {
    x: number;
    y: number;
}

const FootballGraphic = ({x, y}: FootballGraphicProps)  => {
    return (
        <svg x={x} y={y} viewBox="0 0 10 9" width="10" height="9">
            {/*<path d="M 0 4.5 C 1 -0.5, 9 -0.5, 10 4.5 C 9 9.5, 1 9.5, 0 4.5 Z" fill="#000000" />*/}
            <path d="M 0 4.5 L 5 0 L 10 4.5 L 5 9 Z" fill="#555555" fillOpacity="0.75" />
        </svg>
    )
}