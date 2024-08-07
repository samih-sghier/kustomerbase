"use server";

import { db } from "@/server/db";
import { tenant, organizations } from "@/server/db/schema";
import { adminProcedure, protectedProcedure } from "@/server/procedures";
import { unstable_noStore as noStore } from "next/cache";
import { asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { getOrganizations } from "../organization/queries";

/**
 * Get all tenants belonging to the user's organization
 * @returns all tenants
 */
export async function getOrgTenantsQuery() {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    // Ensure the user is linked to an organization
    if (!currentOrg) {
        throw new Error("Organization not found");
    }

    return await db.query.tenant.findMany({
        orderBy: desc(tenant.createdAt),
        where: eq(tenant.organizationId, currentOrg.id),
    });
}

/**
 * Get all tenants (admin only)
 * @param page - The page number
 * @param per_page - Number of tenants per page
 * @param sort - Column and direction for sorting
 * @param firstName - Filter tenants by first name
 * @param lastName - Filter tenants by last name
 * @param email - Filter tenants by email
 * @param status - Filter tenants by status
 * @param organizationId - Filter tenants by organization ID
 * @returns paginated tenants
 */
const paginatedTenantPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    status: z.string().optional(),
    organizationId: z.string().optional(),
});

type GetPaginatedTenantQueryProps = z.infer<typeof paginatedTenantPropsSchema>;

export async function getAllPaginatedTenantsQuery(
    input: GetPaginatedTenantQueryProps,
) {
    noStore();
    await adminProcedure();

    const offset = (input.page - 1) * input.per_page;

    const [column, order] = (input.sort?.split(".") as [
        keyof typeof tenant.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["lastName", "desc"];

    const statuses =
        (input.status?.split(".") as (typeof tenant.$inferSelect.status)[]) ??
        [];

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx.query.tenant.findMany({
            orderBy:
                column && column in tenant
                    ? order === "asc"
                        ? asc(tenant[column])
                        : desc(tenant[column])
                    : desc(tenant.createdAt),
            offset,
            limit: input.per_page,
            where: or(
                input.firstName
                    ? ilike(tenant.firstName, `%${input.firstName}%`)
                    : undefined,

                input.lastName
                    ? ilike(tenant.lastName, `%${input.lastName}%`)
                    : undefined,

                input.email
                    ? ilike(tenant.email, `%${input.email}%`)
                    : undefined,

                statuses.length > 0
                    ? inArray(tenant.status, statuses)
                    : undefined,

                input.organizationId
                    ? eq(tenant.organizationId, input.organizationId)
                    : undefined
            ),
        });

        const total = await tx
            .select({
                count: count(),
            })
            .from(tenant)
            .where(
                or(
                    input.firstName
                        ? ilike(tenant.firstName, `%${input.firstName}%`)
                        : undefined,

                    input.lastName
                        ? ilike(tenant.lastName, `%${input.lastName}%`)
                        : undefined,

                    input.email
                        ? ilike(tenant.email, `%${input.email}%`)
                        : undefined,

                    statuses.length > 0
                        ? inArray(tenant.status, statuses)
                        : undefined,

                    input.organizationId
                        ? eq(tenant.organizationId, input.organizationId)
                        : undefined
                ),
            )
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}
