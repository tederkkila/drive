// Helper to convert football coordinates to an absolute 0-100 field position
export const getAbsolutePosition = (spot: number): number => {
    return spot <= 0 ? Math.abs(spot) : 100 - spot;
};

// Helper to convert absolute 0-100 position back to football coordinates
export const getFootballSpot = (absolute: number): number => {
    return absolute <= 50 ? -absolute : 100 - absolute;
};

/**
 * Calculates the exact physical yards gained between two field spots.
 */
export const calculateDriveDistance = (startSpot: number, endSpot: number): number => {
    const startAbsolute = getAbsolutePosition(startSpot);
    const endAbsolute = getAbsolutePosition(endSpot);

    // Returns positive for moving forward, negative for moving backward
    return endAbsolute - startAbsolute;
};

/**
 * Finds the ending field spot given a starting spot and the yards gained.
 */
export const calculateEndSpot = (startSpot: number, driveDistance: number): number => {
    const startAbsolute = getAbsolutePosition(startSpot);
    const endAbsolute = startAbsolute + driveDistance;

    return getFootballSpot(endAbsolute);
};