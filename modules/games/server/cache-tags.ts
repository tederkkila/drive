export const gameCacheTags = {
    game: (gameId: string) => `game:${gameId}`,
    gameWithDrives: (gameId: string) => `game-with-drives:${gameId}`,
    gameDrives: (gameId: string) => `game-drives:${gameId}`,
    tenantGames: (tenantSlug: string) => `tenant-games:${tenantSlug}`,
};