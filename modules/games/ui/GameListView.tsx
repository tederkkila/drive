import { Suspense } from "react";
import { GameList } from "@/modules/games/ui/GameList";

interface GameListViewProps {
    tenantSlug: string;
}

export const GameListView = ({ tenantSlug }: GameListViewProps) => {
    return (
        <div>
            <h1 className="mb-4">Available Games</h1>

            <Suspense>
                <GameList tenantSlug={ tenantSlug } />
            </Suspense>

        </div>
    )
}