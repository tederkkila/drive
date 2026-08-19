"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const gameFormSchema = z.object({
    name: z.string().min(1, "Game name is required"),
    slug: z.string().min(1, "Slug is required"),
    date: z.string().min(1, "Date is required"),
    homeTeam: z.string().min(1, "Home team is required"),
    awayTeam: z.string().min(1, "Away team is required"),
    homeScore: z.number().min(0, "Score must be 0 or greater"),
    awayScore: z.number().min(0, "Score must be 0 or greater"),
    videoId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/, "Invalid YouTube video ID")
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface NewGameFormProps {
    tenantSlug: string;
}

export function NewGameForm({ tenantSlug }: NewGameFormProps) {
    const router = useRouter();
    const trpc = useTRPC();

    const { data: tenant } = useQuery(trpc.tenants.getOne.queryOptions({ tenantSlug }));
    const { data: teamsData } = useQuery(trpc.teams.getAll.queryOptions({ tenantSlug }));

    const createGameOptions = trpc.games.createGame.mutationOptions({
        onSuccess: (data) => {
            toast.success("Game created successfully!");
            router.push(`/games/${data.id}/edit`);
        },
        onError: (error) => {
            toast.error(`Failed to create game: ${error.message}`);
        },
    });

    const createGame = useMutation(createGameOptions);

    const form = useForm<GameFormValues>({
        resolver: zodResolver(gameFormSchema),
        defaultValues: {
            name: "",
            slug: "",
            date: "",
            homeTeam: "",
            awayTeam: "",
            homeScore: 0,
            awayScore: 0,
            videoId: "",
        },
    });

    const onSubmit = async (values: GameFormValues) => {
        if (!tenant) {
            toast.error("Tenant not found");
            return;
        }

        createGame.mutate({
            ...values,
            tenants: [tenant.id],
        });
    };

    const generateSlug = () => {
        const name = form.getValues("name");
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    form.setValue("slug", slug, { shouldValidate: true });
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create New Game</CardTitle>
                <CardDescription>
                    Fill out the form below to create a new game. You'll be able to add drives after creation.
                </CardDescription>
            </CardHeader>
            <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FieldGroup>
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Game Name</FieldLabel>
                                    <Input
                                        id={field.name}
                                        placeholder="e.g., Week 1 vs Team Name"
                                        aria-invalid={fieldState.invalid}
                                        {...field}
                                        onBlur={() => {
                                            field.onBlur();
                                            if (!form.getValues("slug")) {
                                                generateSlug();
                                            }
                                        }}
                                    />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="slug"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                                    <div className="flex gap-2">
                                        <Input
                                            id={field.name}
                                            placeholder="game-slug"
                                            aria-invalid={fieldState.invalid}
                                            {...field}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={generateSlug}
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                    <FieldDescription>
                                        URL-friendly version of the game name
                                    </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="date"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Game Date</FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="date"
                                        aria-invalid={fieldState.invalid}
                                        {...field}
                                    />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="homeTeam"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Home Team</FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select home team" />
                                            </SelectTrigger>
                                            <SelectContent>
                        {teamsData?.docs?.map((team) => (
                                                    <SelectItem key={team.id} value={team.id}>
                                                        {team.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="awayTeam"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Away Team</FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select away team" />
                                            </SelectTrigger>
                                            <SelectContent>
                        {teamsData?.docs?.map((team) => (
                                                    <SelectItem key={team.id} value={team.id}>
                                                        {team.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                    </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FIX 3: Simplify inputs by allowing Zod coercion to handle standard native events */}
                            <Controller
                                control={form.control}
                                name="homeScore"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Home Score</FieldLabel>
                                        <Input
                                            id={field.name}
                                            type="number"
                                            aria-invalid={fieldState.invalid}
                                            name={field.name}
                                            ref={field.ref}
                                            onBlur={field.onBlur}
                                            value={field.value}
                                            onChange={(event) => {
                                                field.onChange(Number(event.target.value));
                                            }}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="awayScore"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Away Score</FieldLabel>
                                        <Input
                                            id={field.name}
                                            type="number"
                                            aria-invalid={fieldState.invalid}
                                            name={field.name}
                                            ref={field.ref}
                                            onBlur={field.onBlur}
                                            value={field.value}
                                            onChange={(event) => {
                                                field.onChange(Number(event.target.value));
                                            }}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                    </div>

                    <Controller
                        control={form.control}
                        name="videoId"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>YouTube Video ID</FieldLabel>
                                <Input
                                    id={field.name}
                                    placeholder="YouTube video ID"
                                    aria-invalid={fieldState.invalid}
                                    {...field}
                                />
                                <FieldDescription>
                                    The YouTube video ID for this game
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={createGame.isPending}
                        >
                            {createGame.isPending ? "Creating..." : "Create Game"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                    </FieldGroup>

                </form>
            </CardContent>
        </Card>
    );
}