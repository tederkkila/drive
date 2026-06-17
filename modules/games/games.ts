import { Drive, Game, Team } from "@/payload-types";

export type GameWithTeamsWithDrives = GameWithTeams & {
    drives: Drive[];
}

export type GameWithTeams = Omit<Game, "homeTeam" | "awayTeam"> & {
    homeTeam: Team;
    awayTeam: Team;
};