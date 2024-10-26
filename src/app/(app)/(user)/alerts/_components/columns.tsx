/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type alertTypeEnum } from "@/server/db/schema";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ColumnDropdown } from "./column-dropdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Added Dialog imports

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// types/data.ts
export interface AlertData {
    id: string;
    summary: string;
    subject: string;
    createdAt: string;
    updatedAt?: string; // Optional to match the table structure
    organizationId: string;
    threadId: string;
    account: string;
    recipient: string;
    escalationLink?: string; // Optional to match the table structure
    archived: boolean;
}

export function getWatchListColumns(): ColumnDef<AlertData>[] {
    return columns;
}

const TruncatedContent = ({ content }: { content: string }) => {
    const truncated = content.length > 30 ? content.slice(0, 30) + "..." : content;
    return (
        <div className="truncate-content">
            <span className="mr-2">{truncated}</span>
        </div>
    );
};

const AlertViewDialog = ({ alert }: { alert: AlertData }) => {
    return (
        <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
                <DialogTitle className="text-lg font-bold">{alert.subject}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
                <div className="grid grid-cols-[150px,1fr] gap-x-4 text-sm">
                    <span className="font-semibold">Summary:</span>
                    <span className="font-semibold-700">{alert.summary}</span>
                </div>
                <div className="grid grid-cols-[150px,1fr] gap-x-4 text-sm">
                    <span className="font-semibold">Created At:</span>
                    <span className="font-semibold-700">{format(new Date(alert.createdAt), "PPpp")}</span>
                </div>
                <div className="grid grid-cols-[150px,1fr] gap-x-4 text-sm">
                    <span className="font-semibold">Account:</span>
                    <Badge variant="success" className="w-fit">{alert.account}</Badge> {/* Added badge for account */}
                </div>
                <div className="grid grid-cols-[150px,1fr] gap-x-4 text-sm">
                    <span className="font-semibold">Recipient:</span>
                    <Badge variant="info" className="w-fit">{alert.recipient}</Badge> {/* Added badge for recipient */}
                </div>
            </div>
        </DialogContent>
    );
};

export const columns: ColumnDef<AlertData>[] = [
    {
        accessorKey: 'summary',
        header: 'Summary',
        cell: ({ row }) => (
            <Dialog>
                <DialogTrigger asChild>
                    <div className="cursor-pointer">
                        <TruncatedContent content={row.original.summary} />
                    </div>
                </DialogTrigger>
                <AlertViewDialog alert={row.original} /> {/* Added dialog for alert details */}
            </Dialog>
        ),
        filterFn: (row, id, value) => {
            return !!value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => (
            <Dialog>
                <DialogTrigger asChild>
                    <div className="cursor-pointer">
                        <TruncatedContent content={row.original.subject} />
                    </div>
                </DialogTrigger>
                <AlertViewDialog alert={row.original} /> {/* Added dialog for alert details */}
            </Dialog>
        ),
        filterFn: (row, id, value) => {
            return !!value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'account',
        header: 'Account',
        cell: ({ row }) => (
            <Dialog>
                <DialogTrigger asChild>
                    <div className="cursor-pointer">
                        <Badge variant="success" >
                            {row.original.account}
                        </Badge>
                    </div>
                </DialogTrigger>
                <AlertViewDialog alert={row.original} /> {/* Added dialog for alert details */}
            </Dialog>
        ),
    },
    {
        accessorKey: 'recipient',
        header: 'Recipient',
        cell: ({ row }) => (
            <Dialog>
                <DialogTrigger asChild>
                    <div className="cursor-pointer">
                        <Badge variant="info" >
                            {row.original.recipient}
                        </Badge>
                    </div>
                </DialogTrigger>
                <AlertViewDialog alert={row.original} /> {/* Added dialog for alert details */}
            </Dialog>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => (
            <Dialog>
                <DialogTrigger asChild>
                    <span className="text-muted-foreground">
                        {row.original.createdAt && format(new Date(row.original.createdAt), 'PPpp')}
                    </span>
                </DialogTrigger>
                <AlertViewDialog alert={row.original} /> {/* Added dialog for alert details */}
            </Dialog>

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
