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
export type WatchListData = {
    id: string;
    organizationId: string;
    propertyId?: string;
    tenantId?: string;
    alertType: keyof typeof alertTypeEnum.enumValues; // Use enum keys directly
    createdAt: Date;
    tenantName: string,
    firstName?: string;
    lastName?: string;
    email?: string;
    address?: string;
    title?: string;
    unitNumber?: string;
};

export function getWatchListColumns(): ColumnDef<WatchListData>[] {
    return columns;
}

export const columns: ColumnDef<WatchListData>[] = [
    {
        accessorKey: "title",
        header: "Label",
        cell: ({ row }) => row.original.title ?? "N/A",
    },
    {
        accessorKey: "unitNumber",
        header: "Unit Number",
        cell: ({ row }) => row.original.unitNumber ?? "N/A",
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => row.original.address ?? "N/A",
    },
    {
        accessorKey: "tenantName", // You can use any name for the accessorKey
        header: "Tenant",
        cell: ({ row }) => `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email ?? "N/A",
    },
    {
        accessorKey: "alertType",
        header: "Alert Type",
        cell: ({ row }) => (
            <Badge variant="secondary" className="capitalize">
                {row?.original?.alertType}
            </Badge>
        ),
        filterFn: (row, id, value) => {
            return !!value.includes(row.getValue(id));
        },
    },
    // {
    //     accessorKey: "verified",
    //     header: "Verified",
    //     cell: ({ row }) => (
    //         <span className={row.original.verified ? "text-green-600" : "text-red-600"}>
    //             {row.original.verified ? "Yes" : "No"}
    //         </span>
    //     ),
    // },
    // {
    //     accessorKey: "verificationDetails",
    //     header: "Verification Details",
    //     cell: ({ row }) => row.original.verificationDetails ?? "N/A",
    // },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {format(new Date(row.original.createdAt), "PP")}
            </span>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <ColumnDropdown {...row.original} />,
    },
];
