"use client";

import { DataTable } from "@/app/(app)/_components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { getWatchListColumns, type WatchListData } from "./columns";
import { alertTypeEnum } from "@/server/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";
import { type getAllPaginatedWatchlistTenantsQuery } from "@/server/actions/watchlist/queries";
import { getOrgTenantsQuery } from "@/server/actions/tenants/queries";
import { getOrgPropertiesQuery } from "@/server/actions/properties/queries";


// Define filterable columns for the DataTable

type WatchListTableProps = {
    watchListPromise: ReturnType<typeof getAllPaginatedWatchlistTenantsQuery>;
    properties: ReturnType<typeof getOrgPropertiesQuery>;
    tenants: ReturnType<typeof getOrgTenantsQuery>;

};

// Define searchable columns for the DataTable
const searchableColumns: DataTableSearchableColumn<WatchListData>[] = [
    { id: "title", placeholder: "Search by label..." },
];

export function WatchListTable({ watchListPromise, properties, tenants }: WatchListTableProps) {
    const { data, pageCount, total } = React.use(watchListPromise);
    const filterableColumns: DataTableFilterableColumn<WatchListData>[] = [
        {
            id: "alertType",
            title: "Alert Type",
            options: alertTypeEnum.enumValues.map((v) => ({
                label: v,
                value: v,
            })),
        },
        {
            id: "address",
            title: "Property Address",
            options: properties?.map((v) => ({
                label: v.address,
                value: v.address,
            })) ?? [], // Define specific options if necessary
        },

        {
            id: "tenantName",
            title: "Tenant's name",
            options: tenants?.map((v) => ({
                label: v.firstName + " " + v.lastName,
                value: v.firstName + " " + v.lastName,
            })) ?? [],
        },
    ];
    // Define the columns with the new fields
    const columns = useMemo<ColumnDef<WatchListData, unknown>[]>(
        () => getWatchListColumns(),
        [],
    );

    // Ensure that the new fields are included
    const watchListData: WatchListData[] = data.map((item) => ({
        id: item.id!,
        alertType: item.alertType,
        createdAt: item.createdAt,
        organizationId: item.organizationId,
        tenantName: `${item.tenant?.firstName || ""} ${item.tenant?.lastName || ""}`.trim(), // Combine firstName and lastName
        propertyId: item.propertyId!, // Assert that propertyId is a string
        tenantId: item.tenantId!,     // Assert that tenantId is a string
        firstName: item.tenant?.firstName || "", // Include tenant details
        lastName: item.tenant?.lastName || "",
        email: item.tenant?.email || "",
        address: item.property?.address || "", // Include property details
        title: item.property?.title || "",
        unitNumber: item.property?.unitNumber || "",
    }));

    const { table } = useDataTable({
        data: watchListData,
        columns,
        pageCount,
        searchableColumns,
        filterableColumns,
    });

    return (
        <>
            <DataTable
                table={table}
                columns={columns}
                filterableColumns={filterableColumns}
                searchableColumns={searchableColumns}
                totalRows={total}
            />
        </>
    );
}
