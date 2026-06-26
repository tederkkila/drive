import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import { GameWithTeams } from "@/modules/games/games";

interface GameCardProps {
    game: GameWithTeams;
}

export const GameCard = ({ game }: GameCardProps) => {

    //console.log("game", game)

    const gameDate: string = new Date(game.date).toLocaleDateString();
    return (
        <Card size="sm" className="w-full max-w-sm mb-2">
            <CardHeader>
                <CardTitle>{game.name}</CardTitle>
                <CardDescription>
                    {gameDate}
                </CardDescription>
                <CardAction>
                    <Button variant="outline" >
                        <Link href={`/games/${game.id}`}>View</Link>
                    </Button>
                </CardAction>
            </CardHeader>

            <CardContent>
                <div>

                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td>{game.awayTeam.name}</td>
                                <td>{game.awayTeam.abbreviation}</td>
                                <td>{game.awayScore}</td>
                            </tr>

                            <tr>
                                <td>{game.homeTeam.name}</td>
                                <td>{game.homeTeam.abbreviation}</td>
                                <td>{game.homeScore}</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </CardContent>

        </Card>
    )
}