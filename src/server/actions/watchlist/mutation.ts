"use server";

import { db } from "@/server/db";
import { watchlist, watchlistInsertSchema } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { getOrganizations } from "../organization/queries";


type CreateWatchlistProps = z.infer<typeof watchlistInsertSchema>;
export async function createWatchlistMutation(props: CreateWatchlistProps) {
    // Ensure the user is authenticated and fetch organizations
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    // Validate the watchlist data against the schema
    const watchlistParse = await watchlistInsertSchema.safeParseAsync(props);

    if (!watchlistParse.success) {
        throw new Error("Invalid watchlist item", {
            cause: watchlistParse.error.errors,
        });
    }

    const watchlistData = watchlistParse.data;

    // Check if the item already exists
    const existingWatchlistItem = await db
        .select()
        .from(watchlist)
        .where(and(
            eq(watchlist.organizationId, currentOrg?.id ?? watchlistData.organizationId),
            eq(watchlist.propertyId, watchlistData.propertyId),
            eq(watchlist.tenantId, watchlistData.tenantId),
            eq(watchlist.alertType, watchlistData.alertType)
        ))
        .execute();

    if (existingWatchlistItem.length > 0) {
        throw new Error("This alert type for the specified property and tenant already exists.");
    }

    // Insert or update the watchlist item
    return await db
        .insert(watchlist)
        .values({
            ...watchlistData,
            organizationId: currentOrg?.id ?? watchlistData.organizationId,
        })
        .onConflictDoUpdate({
            target: [watchlist.organizationId, watchlist.propertyId, watchlist.tenantId, watchlist.alertType],
            set: {
                ...watchlistData,
                organizationId: currentOrg?.id ?? watchlistData.organizationId,
            },
        })
        .execute();
}

/**
 * Remove a property or tenant from the user's watchlist
 * @param id - The ID of the watchlist item to remove
 */
export async function removeWatchListItemMutation({
    id,
}: {
    id: string;
}) {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    // Ensure an ID is provided
    if (!id) {
        throw new Error("Watchlist item ID must be provided");
    }

    // Remove the watchlist item
    const result = await db.delete(watchlist).where(
        and(
            eq(watchlist.organizationId, currentOrg.id),
            eq(watchlist.id, id) // Assuming the watchlist table has an `id` column
        )
    ).execute();

    if (result.count === 0) {
        throw new Error("No matching watchlist entry found");
    }

    return result;
}

/**
 * Update the alert type of a watchlist item
 * @param props - The data to update
 */
const watchlistUpdateFormSchema = watchlistInsertSchema.pick({
    alertType: true,
});

type UpdateWatchlistProps = z.infer<typeof watchlistUpdateFormSchema>;

export async function updateWatchListAlertTypeMutation(props: UpdateWatchlistProps & { id: string }) {
    const { id, ...updateProps } = props;

    // Validate the watchlist data against the schema
    const watchlistParse = await watchlistUpdateFormSchema.safeParseAsync(updateProps);

    if (!watchlistParse.success) {
        throw new Error("Invalid watchlist data", {
            cause: watchlistParse.error.errors,
        });
    }

    const updatedAlertType = watchlistParse.data.alertType;

    // Fetch the current watchlist item
    const currentItems = await db
        .select()
        .from(watchlist)
        .where(eq(watchlist.id, id))
        .execute();

    if (currentItems.length === 0) {
        throw new Error("Watchlist item not found");
    }

    const currentItemData = currentItems[0];

    // Check if the new alert type already exists for the property and tenant
    const existingWatchlistItems = await db
        .select()
        .from(watchlist)
        .where(and(
            eq(watchlist.organizationId, currentItemData?.organizationId),
            eq(watchlist.propertyId, currentItemData?.propertyId),
            eq(watchlist.tenantId, currentItemData?.tenantId),
            eq(watchlist.alertType, updatedAlertType)
        ))
        .execute();

    if (existingWatchlistItems.length > 0) {
        throw new Error("This alert type for the specified property and tenant already exists.");
    }

    // Update the watchlist item
    return await db.update(watchlist).set(updateProps).where(
        and(
            eq(watchlist.id, id) // Assuming the watchlist table has an `id` column
        )
    ).execute();
}