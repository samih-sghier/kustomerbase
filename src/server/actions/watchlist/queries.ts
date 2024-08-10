// Import necessary modules
import { db } from "@/server/db";
import { watchlist, tenant, property } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { unstable_noStore as noStore } from "next/cache";
import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { getOrganizations } from "../organization/queries";

// Function to get all tenants in the watchlist for the user's organization
export async function getOrgWatchlistTenantsQuery() {
    const { user } = await protectedProcedure(); // Assuming this is for authorization and not used here
    const { currentOrg } = await getOrganizations();

    return await db.query.watchlist.findMany({
        orderBy: desc(watchlist.createdAt),
        where: eq(watchlist.organizationId, currentOrg.id),
        with: {
            tenant: true, // Join tenant table to get tenant details
            property: true, // Join property table to get property details
        },
    });
}

// Schema for paginated watchlist properties
// Schema for paginated watchlist properties
const paginatedWatchlistPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    tenantName: z.string().optional(),
    address: z.string().optional(),
    title: z.string().optional(),
    alertType: z.string().optional()
});

type GetPaginatedWatchlistQueryProps = z.infer<typeof paginatedWatchlistPropsSchema>;

// Function to get all watchlist tenants with pagination and filtering
export async function getAllPaginatedWatchlistTenantsQuery(
    input: GetPaginatedWatchlistQueryProps
) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) {
        throw new Error("Organization not found");
    }
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
            where: and(
                or(
                    input.firstName ? ilike(tenant.firstName, `%${input.firstName}%`) : undefined,
                    input.lastName ? ilike(tenant.lastName, `%${input.lastName}%`) : undefined,
                    input.email ? ilike(tenant.email, `%${input.email}%`) : undefined,
                    // input.address ? ilike(property.address, `%${input.address}%`) : undefined,
                    // input.title ? ilike(property.title, `%${input.title}%`) : undefined,
                    statuses.length > 0 ? inArray(watchlist.alertType, statuses) : undefined,

                ),
                eq(property.organizationId, currentOrg.id),
                eq(tenant.organizationId, currentOrg.id)
            ),
            with: {
                tenant: true, // Ensure tenant details are included
                property: true, // Ensure property details are included
            },
            offset,
            limit: input.per_page,
            orderBy:
                column && column in property
                    ? order === "asc"
                        ? asc(property[column])
                        : desc(property[column])
                    : desc(property.createdAt),

        });

        // Map the data to include tenantName and title
        const mappedData = response.map(item => ({
            ...item,
            tenantName: `${item?.tenant?.firstName} ${item?.tenant?.lastName}`,
            title: item?.property?.title, // Ensure title is correctly mapped from the property table
            organizationId: currentOrg.id
        }));

        // Count the total number of items for pagination
        const total = await tx
            .select({ count: count() })
            .from(watchlist)
            .innerJoin(tenant, eq(watchlist.tenantId, tenant.id)) // Join tenant for filtering
            .innerJoin(property, eq(watchlist.propertyId, property.id)) // Join property for filtering
            .where(
                and(
                    or(
                        input.firstName ? ilike(tenant.firstName, `%${input.firstName}%`) : undefined,
                        input.lastName ? ilike(tenant.lastName, `%${input.lastName}%`) : undefined,
                        input.email ? ilike(tenant.email, `%${input.email}%`) : undefined,
                        // input.address ? ilike(property.address, `%${input.address}%`) : undefined,
                        // input.title ? ilike(property.title, `%${input.title}%`) : undefined,
                        statuses.length > 0 ? inArray(watchlist.alertType, statuses) : undefined,
                    ),
                    eq(property.organizationId, currentOrg.id), // Filter properties by currentOrg.id
                    eq(tenant.organizationId, currentOrg.id) // Use currentOrg.id for filtering tenants
                )
            )
            .execute()
            .then(res => res[0]?.count ?? 0);

        return { data: mappedData, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}
