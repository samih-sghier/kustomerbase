"use server";

import { db } from "@/server/db";
import { property, organizations } from "@/server/db/schema";
import { adminProcedure, protectedProcedure } from "@/server/procedures";
import { unstable_noStore as noStore } from "next/cache";
import { asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { getOrganizations } from "../organization/queries";

/**
 * Get all properties owned by the user's organization
 * @returns all properties
 */
export async function getOrgPropertiesQuery() {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    // // Ensure the user is linked to an organization
    // const organization = await db.query.organizations.findFirst({
    //     where: eq(organizations.ownerId, user.id),
    // });

    // if (!organization) {
    //     throw new Error("Organization not found");
    // }

    return await db.query.property.findMany({
        orderBy: desc(property.createdAt),
        where: eq(property.organizationId, currentOrg.id),
    });
}

/**
 * Get all properties (admin only)
 * @params page - The page number
 * @params per_page - Number of properties per page
 * @params sort - Column and direction for sorting
 * @params title - Filter properties by title
 * @params address - Filter properties by address
 * @params status - Filter properties by status
 * @params organizationId - Filter properties by organization ID
 * @returns paginated properties
 */

const paginatedPropertyPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    title: z.string().optional(),
    address: z.string().optional(),
    status: z.string().optional(),
    organizationId: z.string().optional(),
});

type GetPaginatedPropertyQueryProps = z.infer<typeof paginatedPropertyPropsSchema>;

export async function getAllPaginatedPropertiesQuery(
    input: GetPaginatedPropertyQueryProps,
) {
    noStore();
    await adminProcedure();

    const offset = (input.page - 1) * input.per_page;

    const [column, order] = (input.sort?.split(".") as [
        keyof typeof property.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["title", "desc"];

    const statuses =
        (input.status?.split(".") as (typeof property.$inferSelect.status)[]) ??
        [];

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx.query.property.findMany({
            orderBy:
                column && column in property
                    ? order === "asc"
                        ? asc(property[column])
                        : desc(property[column])
                    : desc(property.createdAt),
            offset,
            limit: input.per_page,
            where: or(
                input.title
                    ? ilike(property.title, `%${input.title}%`)
                    : undefined,

                input.address
                    ? ilike(property.address, `%${input.address}%`)
                    : undefined,

                statuses.length > 0
                    ? inArray(property.status, statuses)
                    : undefined,

                input.organizationId
                    ? eq(property.organizationId, input.organizationId)
                    : undefined
            ),
        });

        const total = await tx
            .select({
                count: count(),
            })
            .from(property)
            .where(
                or(
                    input.title
                        ? ilike(property.title, `%${input.title}%`)
                        : undefined,

                    input.address
                        ? ilike(property.address, `%${input.address}%`)
                        : undefined,

                    statuses.length > 0
                        ? inArray(property.status, statuses)
                        : undefined,

                    input.organizationId
                        ? eq(property.organizationId, input.organizationId)
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
