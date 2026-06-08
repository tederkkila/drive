import type { CollectionConfig } from 'payload'

export const Drives: CollectionConfig = {
    slug: 'drives',
    fields: [
        // Relationships
        { name: 'game', type: 'relationship', relationTo: 'games', required: true },
        { name: 'possessingTeam', type: 'relationship', relationTo: 'teams',  },

        // Drive Metadata
        { name: 'driveNumber', type: 'number', required: true },
        { name: 'startFieldPosition', type: 'text', required: true }, // e.g., "Own 25"
        { name: 'result', type: 'text' }, // e.g., "Touchdown", "Punt", "Interception"


        // Embedded Plays Array
        {
            name: 'plays',
            type: 'array',
            admin: { initCollapsed: true },
            fields: [
                { name: 'youTubeStart', type: "date"},
                { name: 'youTubeEnd', type: "date"},
                { name: 'playNumber', type: 'number', required: true },
                { name: 'quarter', type: 'number', required: true },
                { name: 'down', type: 'number', required: true },
                { name: 'yardsToGo', type: 'number', required: true },
                { name: 'description', type: 'textarea', required: true }, // e.g., "Mahomes pass deep right to Kelce..."
                { name: 'yardsGained', type: 'number', required: true },
                { name: 'playType', type: 'select',
                    options: [
                        'run',
                        'pass',
                        'punt',
                        'field_goal',
                        'penalty',
                        'interception',
                        'fumble_recovered',
                        'fumble_lost',
                        'turnover_on_downs'
                    ]
                },
            ],
        },
    ],
}
