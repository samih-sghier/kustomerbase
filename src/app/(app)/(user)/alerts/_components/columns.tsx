/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type alertTypeEnum } from "@/server/db/schema";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ColumnDropdown } from "./column-dropdown";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// types/data.ts
export interface AlertData {
    id: string;
    alertType: string;
    createdAt: string;
    updatedAt?: string; // Added to match the table structure
    organizationId: string;
    propertyId: string;
    tenantId: string;
    firstName?: string; // Optional because it might not be in all alert entries
    lastName?: string;  // Optional because it might not be in all alert entries
    email?: string;     // Optional because it might not be in all alert entries
    address: string;
    title?: string;     // Optional because it might not be in all alert entries
    unitNumber?: string; // Optional because it might not be in all alert entries
    alertLink?: string; // Added to match the table structure
    archived: boolean;
    platform?: string;  // Added to match the table structure
    detectedOn: string; // Added to match the table structure
}



export function getWatchListColumns(): ColumnDef<AlertData>[] {
    return columns;
}

export const columns: ColumnDef<AlertData>[] = [
    {
        accessorKey: 'alertType',
        header: 'Alert Type',
        cell: ({ row }) => (
            <Badge variant="secondary" className="capitalize">
                {row.original.alertType}
            </Badge>
        ),
        filterFn: (row, id, value) => {
            return !!value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'title',
        header: 'Property',
        cell: ({ row }) => row.original.address ?? 'N/A',
    },
    {
        accessorKey: 'platform',
        header: 'Platform',
        cell: ({ row }) => row.original.platform ?? 'N/A',
    },
    {
        accessorKey: 'detectedOn',
        header: 'Detected On',
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.original.detectedOn && format(new Date(row.original.detectedOn), 'PP')}
            </span>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.original.createdAt && format(new Date(row.original.createdAt), 'PP')}
            </span>
        ),
    },
    // {
    //     accessorKey: 'alertLink',
    //     header: 'Alert Link',
    //     cell: ({ row }) => (
    //         <a href={row.original.alertLink ?? '#'} target="_blank" rel="noopener noreferrer">
    //             {row.original.alertLink ? 'View Alert' : 'N/A'}
    //         </a>
    //     ),
    // },

    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ColumnDropdown {...row.original} />, // Ensure ColumnDropdown is defined
    },
];
