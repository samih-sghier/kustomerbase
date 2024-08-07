"use client";

import { DataTable } from "@/app/(app)/_components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { getWatchListColumns, type AlertData } from "./columns";
import { alertTypeEnum } from "@/server/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import type {
    DataTableFilterableColumn,
    DataTableSearchableColumn,
} from "@/types/data-table";
import { type getAllPaginatedWatchlistTenantsQuery } from "@/server/actions/watchlist/queries";
import { getOrgTenantsQuery } from "@/server/actions/tenants/queries";
import { getOrgPropertiesQuery } from "@/server/actions/properties/queries";
import { getAllPaginatedAlertsQuery } from "@/server/actions/alert/queries";


async function fetchProperties() {
    return (await getOrgPropertiesQuery()).map(property => { });
}

async function fetchTenants() {
    return await getOrgTenantsQuery();
}

// Define filterable columns for the DataTable
const filterableColumns: DataTableFilterableColumn<AlertData>[] = [
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
        options: [], // Define specific options if necessary
    },

    // {
    //     id: "lastName",
    //     title: "Tenant's name",
    //     options: [], // Define specific options if necessary
    // },
    // {
    //     id: "email",
    //     title: "Tenant's mail",
    //     options: [], // Define specific options if necessary
    // },
];

type AlertTableProps = {
    watchListPromise: ReturnType<typeof getAllPaginatedAlertsQuery>;
};

// Define searchable columns for the DataTable
const searchableColumns: DataTableSearchableColumn<AlertData>[] = [
    // { id: "address", placeholder: "Search by address..." },
    // { id: "lastName", placeholder: "Search tenant name..." }
];

export function AlertTable({ watchListPromise }: AlertTableProps) {
    const { data, pageCount, total } = React.use(watchListPromise);

    // Define the columns with the new fields
    const columns = useMemo<ColumnDef<AlertData, unknown>[]>(
        () => getWatchListColumns(),
        [],
    );

    // Ensure that the new fields are included
    const watchListData: AlertData[] = data.map((item) => ({
        id: item.id!,
        alertType: item.alertType,
        createdAt: item.createdAt,
        organizationId: item.organizationId,
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
