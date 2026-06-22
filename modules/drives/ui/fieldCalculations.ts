// Helper to convert football coordinates to an absolute 0-100 field position
export const getAbsolutePosition = (spot: number, direction: 'left' | 'right'): number => {

    let absolute = spot;

    if (direction !== 'left' && direction !== 'right') {
        throw new Error('Invalid direction');
    }

    if (direction === 'right') {
        // -45 right | < 0 ? 45* : 55
        // +45 right | < 0 ? 45  : 55*
        absolute = (spot < 0) ? Math.abs(spot) : 100 - spot;
    } else if (direction === 'left') {
        // -45 left | < 0 ? 55* : 45
        // +45 left | < 0 ? 55  : 45*
        absolute = (spot < 0) ? 100 - Math.abs(spot) : Math.abs(spot);
    }

    //console.log("getAbsolutePosition: ", spot, direction, absolute)

    return absolute;

};

// Helper to convert absolute 0-100 position back to football coordinates
export const getFootballSpot = (absolute: number, direction: 'left' | 'right'): number => {

    let spot: number = 50

    if (direction !== 'left' && direction !== 'right') {
        throw new Error('Invalid direction');
    }

    if (direction === 'right') {
        if (50 < absolute) {
            // we are going right so this is a positive number ex 55 absolute => 45 yield
            spot = 100 - absolute;
        } else {
            // we are going right so this is a negative number ex 45 absolute => -45 yield
            spot = absolute;

        }
    } else if (direction === 'left') {
        if (absolute < 50) {
            // we are going left so this is a positive number ex 45 absolute => 45 yield
            spot = absolute;
        } else {
            // we are going left so this is a negative number ex 55 absolute => -45 yield
            spot = -100 + absolute;

        }
    }

    return spot;

};

/**
 * Calculates the exact physical yards gained between two field spots.
 */
export const calculateAbsoluteDriveDistance = (startAbsolute: number, endAbsolute: number, driveDirection: 'left' | 'right'): number => {

    //console.log("calculateDriveDistance: ", startAbsolute, endAbsolute, driveDirection, typeof driveDirection)

    // Returns positive for moving forward, negative for moving backward
    let distance = 0
    if (driveDirection === "left") {
        distance = startAbsolute - endAbsolute;
    } else if (driveDirection === "right") {
        distance = endAbsolute - startAbsolute;
    }
    return distance;
};

/**
 * Finds the ending field spot given a starting spot and the yards gained.
 */
export const calculateEndSpotAbsolute = (startSpotAbsolute: number, driveDistance: number, driveDirection: 'left' | 'right'): number => {

    //console.log("   calculateEndSpotAbsolute: ", startSpotAbsolute, driveDistance, driveDirection)
    if (startSpotAbsolute < 0 || startSpotAbsolute > 100) {
        throw new Error('Invalid absolute start spot');
    }

    let endAbsoluteAbsolute = startSpotAbsolute;
    // console.log("   endAbsoluteAbsolute: ", endAbsoluteAbsolute);

    if (driveDirection === "left") {
        endAbsoluteAbsolute -= driveDistance;
    } else if (driveDirection === "right") {
        endAbsoluteAbsolute += driveDistance;
    }
    //console.log("endAbsoluteAbsolute +: ", endAbsoluteAbsolute);

    return endAbsoluteAbsolute;
};