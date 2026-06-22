import type { CollectionConfig, Field } from 'payload'
import {
    getAbsolutePosition,
    calculateDriveDistance
} from "@/modules/drives/ui/fieldCalculations";

export const Drives: CollectionConfig = {
    slug: 'drives',
    admin: {
        useAsTitle: "driveTitle",
    },
    hooks: {
        // 2. Use a collection-level beforeChange hook to update the title on save
        beforeChange: [
            async ({ data, req }) => {

                const driveNumber = data?.driveNumber || 'No Drive Number';
                const gameId = data?.game || 'No Game';
                const teamId = data?.possessingTeam || 'No Team';

                // console.log('driveNumber', driveNumber);
                // console.log('gameId', gameId);
                // console.log('teamId', teamId);

                if (!gameId || !teamId) {
                    data.profileTitle = `New Drive - ${driveNumber}`;
                    return data;
                }

                try {
                    // Fetch the game details only once during the write operation
                    const gameDocid = typeof gameId === 'object' ? gameId.id : gameId;
                    const gameDoc = await req.payload.findByID({
                        collection: 'games',
                        id: gameDocid,
                        depth: 0,
                    });

                    const teamDocid = typeof teamId === 'object' ? teamId.id : teamId;
                    const teamDoc = await req.payload.findByID({
                        collection: 'teams',
                        id: teamDocid,
                        depth: 0,
                    });

                    if (gameDoc && teamDoc) {
                        const gameName = gameDoc.name || '';
                        const teamName = teamDoc.abbreviation || '';
                        const name = `${gameName} ${teamName}`.trim() || 'Unnamed User';
                        data.driveTitle = `${name} | Drive ${driveNumber.toString().padStart(3, '0')}`;
                    }
                } catch (error) {
                    data.driveTitle = `Drive Creation In Progress (${driveNumber})`;
                }

                // console.log('data.driveTitle', data.driveTitle);
                return data;
            }
        ]
    },
    fields: [
        {
            name: 'driveTitle',
            type: 'text',
            admin: {
                hidden: true, // Hides it from the edit form view if you don't need it there
            },
        },


        // Relationships
        { name: 'game', type: 'relationship', relationTo: 'games', required: true, maxDepth: 2 },
        { name: 'possessingTeam', type: 'relationship', relationTo: 'teams',  },

        {type: "group", label: "Drive MetaData", fields: [
            // Drive Metadata
            {type: "row", fields: [
                { name: 'driveNumber', type: 'number', required: true, index: true, admin: { width: '15%' }, },
                { name: 'direction', type: 'select', options: ['left', 'right'], required: true, admin: { width: '15%' }, },
                { name: 'startFieldPosition', type: 'number', required: true }, // e.g., "Own 25"
                { name: 'result', type: 'select',
                    options: [
                        'touchdown',
                        'field_goal',
                        'interception',
                        'fumble_lost',
                        'turnover_on_downs',
                        'punt',
                        'end_of_period',
                    ]
                }, // e.g., "Touchdown", "Punt", "Interception"

            ]},
        ]},

        // Embedded Plays Array
        {
            name: 'plays',
            type: 'array',
            admin: {
                components: {
                    RowLabel: '@/components/payload/PlayRowLabel#PlayRowLabel',
                },
                initCollapsed: true,
            },
            fields: [
                {type: "row", fields: [
                        { name: 'playNumber', type: 'number', required: true, admin: { width: '15%' }, },
                        { name: 'quarter', type: 'number', required: true, admin: { width: '15%' }, },
                        { name: 'down', type: 'number', required: true, admin: { width: '15%' },
                            validate: (val: number) => {
                                // Standard required check
                                if (val === undefined || val === null) {
                                    return 'This field is required'
                                }

                                // Range limit logic (e.g., 18 to 100)
                                if (val < 1 || val > 4) {
                                    return 'Age must be between 1 and 4'
                                }

                                return true // Return true if valid
                            },
                        },
                        { name: 'yardsToGo', title: "Distance", type: 'number', required: true, admin: { width: '15%' }, },
                        {
                            name: 'hash', type: 'select',
                            options: [
                                'left',
                                'middle',
                                'right',
                            ],
                            required: true,
                        },
                    ]
                },
                {
                    type: "row", fields: [
                        { name: 'youTubeStart', type: "number", required: true,
                            admin: {
                                components: {
                                    Field: '@/components/payload/TimePickerInput#TimePickerInput', // Path to your custom component
                                },
                            }
                        },
                        { name: 'youTubeEnd', type: "number", required: true,
                            admin: {
                                components: {
                                    Field: '@/components/payload/TimePickerInput#TimePickerInput', // Path to your custom component
                                },
                            }
                        },
                    ]
                },
                { name: 'description', type: 'textarea', required: true },
                {
                    type: "row", fields: [
                        {
                            name: 'playType', type: 'select',
                            options: [
                                'run',
                                'pass',
                                'punt',
                                'field_goal',
                                'extra_point',
                                'penalty',
                                'timeout',
                            ]
                        },
                        { name: 'startFieldPosition', type: 'number', required: true, admin: { width: '15%' }, },
                        { name: 'endFieldPosition', type: 'number', required: true, admin: { width: '15%' }, },

                        {name: 'yardsGained', type: 'number', required: true,
                            admin: {
                                readOnly: true,
                                width: '15%'
                            },
                            hooks: {
                                beforeChange: [
                                    ({ siblingData, data }) => {
                                        const start = siblingData?.startFieldPosition;
                                        const end = siblingData?.endFieldPosition;
                                        const direction = data?.direction;


                                        if (typeof start === 'number' && typeof end === 'number') {

                                            const absoluteStart = getAbsolutePosition(start, direction)
                                            const absoluteEnd = getAbsolutePosition(end, direction)

                                            return calculateDriveDistance(absoluteStart, absoluteEnd, direction);

                                        }

                                        return 0;

                                    }
                                ]
                            }
                        },

                    ]
                },
                { type: 'group', label: 'Penalty Details', fields: [
                        { type: 'row', fields: [
                                { name: 'penalty', type: 'text', required: false,
                                    admin: {
                                        description: "Enter Comma-separated list of penalties (ex. False Start, Offensive Holding)",
                                    }
                                },

                                { name: 'penaltyYards', type: 'number', required: false, admin: { width: '15%'} },
                            ]
                        },
                        { name: 'nullifyPlay', label: 'Penalty nullifies play', type: 'checkbox', required: false,
                            admin: {
                                description: "Check to nullify gains on this play an only use the penalty yards.",
                            }
                        },
                    ]
                },

            ],
        },
    ] as Field[],
}
