// Import necessary modules
import { db } from "@/server/db";
import { watchlist, tenant, property, sgAlert } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { unstable_noStore as noStore } from "next/cache";
import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or, where } from "drizzle-orm";
import { z } from "zod";
import { getOrganizations } from "../organization/queries";
import { endOfDay, startOfDay, subDays } from "date-fns";

// Schema for paginated alerts
const paginatedAlertsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    tenantName: z.string().optional(),
    address: z.string().optional(),
    title: z.string().optional(),
    alertType: z.string().optional(),
    organizationId: z.string().optional()
});

type GetPaginatedAlertsQueryProps = z.infer<typeof paginatedAlertsSchema>;

// Function to get all paginated alerts with filtering and sorting
export async function getAllPaginatedAlertsQuery(
    input: GetPaginatedAlertsQueryProps
) {
    noStore(); // Call to disable caching if applicable
    await protectedProcedure(); // Ensure proper authorization, if needed

    const offset = (input.page - 1) * input.per_page;

    // Determine sorting column and order
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof watchlist.$inferSelect | undefined,
        "asc" | "desc" | undefined
    ]) ?? ["createdAt", "desc"];

    // Collect statuses if provided
    const statuses = (input.alertType?.split(".") as (typeof sgAlert.$inferSelect.alertType)[]) ?? [];

    const { data, total } = await db.transaction(async (tx) => {
        // Fetch paginated data with filters
        const response = await tx.query.sgAlert.findMany({
            where: or(
                input.firstName ? ilike(tenant.firstName, `%${input.firstName}%`) : undefined,
                input.lastName ? ilike(tenant.lastName, `%${input.lastName}%`) : undefined,
                input.email ? ilike(tenant.email, `%${input.email}%`) : undefined,
                input.address ? ilike(property.address, `%${input.address}%`) : undefined,
                input.title ? ilike(property.title, `%${input.title}%`) : undefined,
                statuses.length > 0 ? inArray(watchlist.alertType, statuses) : undefined,
                input.organizationId ? eq(tenant.organizationId, input.organizationId) : undefined
            ),
            with: {
                tenant: true, // Join tenant table to get tenant details
                property: true, // Join property table to get property details
            },
            offset,
            limit: input.per_page,
            orderBy:
                column && column in watchlist
                    ? order === "asc"
                        ? asc(watchlist[column])
                        : desc(watchlist[column])
                    : desc(watchlist.createdAt),
        });

        // Map the data to include tenantName and title
        const mappedData = response.map(item => ({
            ...item,
            tenantName: `${item?.tenant?.firstName} ${item.tenant?.lastName}`,
            title: item?.property?.title
        }));

        // Count the total number of items for pagination
        const total = await tx
            .select({ count: count() })
            .from(watchlist)
            .innerJoin(tenant, eq(watchlist.tenantId, tenant.id)) // Join tenant for filtering
            .innerJoin(property, eq(watchlist.propertyId, property.id)) // Join property for filtering
            .where(
                or(
                    input.firstName ? ilike(tenant.firstName, `%${input.firstName}%`) : undefined,
                    input.lastName ? ilike(tenant.lastName, `%${input.lastName}%`) : undefined,
                    input.email ? ilike(tenant.email, `%${input.email}%`) : undefined,
                    input.address ? ilike(property.address, `%${input.address}%`) : undefined,
                    input.title ? ilike(property.title, `%${input.title}%`) : undefined,
                    statuses.length > 0 ? inArray(watchlist.alertType, statuses) : undefined,
                    input.organizationId ? eq(tenant.organizationId, input.organizationId) : undefined
                )
            )
            .execute()
            .then(res => res[0]?.count ?? 0);

        return { data: mappedData, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}

// Function to get alerts by ID
export async function getAlertByIdQuery(alertId: string) {
    await protectedProcedure(); // Ensure proper authorization

    return await db.query.watchlist.findFirst({
        where: eq(watchlist.id, alertId),
        with: {
            tenant: true, // Join tenant table to get tenant details
            property: true, // Join property table to get property details
        },
    });
}


// Function to get alert statistics based on organizationId
export async function getAlertStatistics() {
    await protectedProcedure(); // Ensure proper authorization
    const { currentOrg } = await getOrganizations();
    const organizationId = currentOrg.id;
    // Define the date range for new alerts (last 3 days)
    const now = new Date();
    const threeDaysAgo = subDays(now, 3);
    const startOfThreeDaysAgo = startOfDay(threeDaysAgo);
    const endOfThreeDaysAgo = endOfDay(now);

    // Count total alerts for the specified organization
    const totalAlertsPromise = db
        .select({ count: count() })
        .from(sgAlert)
        .where(eq(sgAlert.organizationId, organizationId))
        .execute();

    // Count new alerts (detected within the last 3 days) for the specified organization
    const newAlertsPromise = db
        .select({ count: count() })
        .from(sgAlert)
        .where(
            and(
                eq(sgAlert.organizationId, organizationId),
                gte(sgAlert.detectedOn, startOfThreeDaysAgo),
                lte(sgAlert.detectedOn, endOfThreeDaysAgo)
            )
        )
        .execute();

    // Count archived alerts for the specified organization
    const archivedAlertsPromise = db
        .select({ count: count() })
        .from(sgAlert)
        .where(
            and(
                eq(sgAlert.organizationId, organizationId),
                eq(sgAlert.archived, true)
            )
        )
        .execute();

    // Execute all queries concurrently
    const [totalAlertsResult, newAlertsResult, archivedAlertsResult] = await Promise.all([
        totalAlertsPromise,
        newAlertsPromise,
        archivedAlertsPromise
    ]);

    // Extract counts from results
    const totalAlerts = totalAlertsResult[0]?.count ?? 0;
    const newAlerts = newAlertsResult[0]?.count ?? 0;
    const archivedAlerts = archivedAlertsResult[0]?.count ?? 0;

    return {
        totalAlerts,
        newAlerts,
        archivedAlerts
    };
}
