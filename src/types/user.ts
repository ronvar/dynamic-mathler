import { MathlerGameRecord } from "./mathler";

export type UserMetadata = {
    history: MathlerGameRecord[];
    totalGames: number;
    totalWins: number;
    totalTimePlayed: number;
}