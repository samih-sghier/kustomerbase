// Import necessary modules
import { db } from "@/server/db";
import { watchlist, tenant, property } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { unstable_noStore as noStore } from "next/cache";
import { asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { getOrganizations } from "../organization/queries";

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
    const statuses = (input.alertType?.split(".") as (typeof watchlist.$inferSelect.alertType)[]) ?? [];

    const { data, total } = await db.transaction(async (tx) => {
        // Fetch paginated data with filters
        const response = await tx.query.watchlist.findMany({
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
