// Helper to convert football coordinates to an absolute 0-100 field position
export const getAbsolutePosition = (spot: number, direction: 'left' | 'right'): number => {

    let absolute = spot;

    if (direction !== 'left' && direction !== 'right') {
        throw new Error('Invalid direction');
    }

    if (direction === 'right') {
        // -45 right | < 0 ? 45* : 55
        // +45 right | < 0 ? 45  : 55*
        absolute = (spot <= 0) ? Math.abs(spot) : 100 - spot;
    } else if (direction === 'left') {
        // -45 left | < 0 ? 55* : 45
        // +45 left | < 0 ? 55  : 45*
        absolute = (spot <= 0) ? 100 - Math.abs(spot) : Math.abs(spot);
    }

    return absolute;

};

// Helper to convert absolute 0-100 position back to football coordinates
export const getFootballSpot = (absolute: number, direction: 'left' | 'right'): number => {

    let spot: number = 0

    if (direction !== 'left' && direction !== 'right') {
        throw new Error('Invalid direction');
    }

    if (direction === 'right') {
        // 55 right | <= 50 ? -55  : 45*
        // 45 right | <= 50 ? -45* : 55
        spot =  absolute <= 50 ? -absolute : 100 - absolute;
    } else if (direction === 'left') {
        // 55 left  | <= 50 ? -55  : 45*
        // 45 left  | <= 50 ? -55* : 45
        spot =  absolute <= 50 ? 100 - absolute : -absolute;
    }

    return spot;

};

/**
 * Calculates the exact physical yards gained between two field spots.
 */
export const calculateDriveDistance = (startSpot: number, endSpot: number, driveDirection: 'left' | 'right'): number => {
    const startAbsolute = getAbsolutePosition(startSpot, driveDirection);
    const endAbsolute = getAbsolutePosition(endSpot, driveDirection);

    // Returns positive for moving forward, negative for moving backward
    return endAbsolute - startAbsolute;
};

/**
 * Finds the ending field spot given a starting spot and the yards gained.
 */
export const calculateEndSpotAbsolute = (startSpotAbsolute: number, driveDistance: number, driveDirection: 'left' | 'right'): number => {

    //console.log("calculateEndSpotAbsolute: ", startSpotAbsolute, driveDistance, driveDirection)
    if (startSpotAbsolute < 0 || startSpotAbsolute > 100) {
        throw new Error('Invalid absolute start spot');
    }

    let endAbsoluteAbsolute = getAbsolutePosition(startSpotAbsolute, driveDirection);
     //console.log("endAbsoluteAbsolute: ", endAbsoluteAbsolute);

    if (driveDirection === "left") {
        endAbsoluteAbsolute -= driveDistance;
    } else if (driveDirection === "right") {
        endAbsoluteAbsolute += driveDistance;
    }
     //console.log("endAbsoluteAbsolute +: ", endAbsoluteAbsolute);

    return endAbsoluteAbsolute;
};