"use server";

import { db } from "@/server/db";
import { connected } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { unstable_noStore as noStore } from "next/cache";
import { and, eq, ilike, inArray, asc, desc, count, or } from "drizzle-orm";
import { z } from "zod";
import { getOrganizations } from "../organization/queries";

/**
 * Get all connected records for the user's organization
 * @returns all connected records
 */
export async function getOrgConnectedQuery() {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    // Ensure the user is linked to an organization
    if (!currentOrg) {
        throw new Error("Organization not found");
    }

    return await db.query.connected.findMany({
        orderBy: desc(connected.createdAt),
        where: eq(connected.orgId, currentOrg.id),
    });
}

/**
 * Get connected records based on filters and pagination
 * @param page - The page number
 * @param per_page - Number of records per page
 * @param sort - Column and direction for sorting
 * @param email - Filter by email
 * @param provider - Filter by provider
 * @returns paginated connected records
 */
const paginatedConnectedPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    provider: z.string().optional(),
    purpose: z.string().optional(),
});

type GetPaginatedConnectedQueryProps = z.infer<typeof paginatedConnectedPropsSchema>;

export async function getPaginatedConnectedQuery(input: GetPaginatedConnectedQueryProps) {
    noStore();
    await protectedProcedure();

    const offset = (input.page - 1) * input.per_page;

    const [column, order] = (input.sort?.split(".") as [
        keyof typeof connected.$inferSelect | undefined,
        "asc" | "desc" | undefined,
    ]) ?? ["createdAt", "desc"];

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx.query.connected.findMany({
            orderBy:
                column && column in connected
                    ? order === "asc"
                        ? asc(connected[column])
                        : desc(connected[column])
                    : desc(connected.createdAt),
            offset,
            limit: input.per_page,
            where: and(
                input.email ? ilike(connected.email, `%${input.email}%`) : undefined,
                input.provider ? eq(connected.provider, input.provider) : undefined,
                input.purpose ? ilike(connected.purpose, `%${input.purpose}%`) : undefined
            ),
        });

        const total = await tx
            .select({
                count: count(),
            })
            .from(connected)
            .where(
                and(
                    input.email ? ilike(connected.email, `%${input.email}%`) : undefined,
                    input.provider ? eq(connected.provider, input.provider) : undefined,
                    input.purpose ? ilike(connected.purpose, `%${input.purpose}%`) : undefined
                )
            )
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}

/**
 * Get connected records by email and orgId
 * @param email - Email of the connected record
 * @param orgId - Organization ID
 * @returns connected records
 */
type GetConnectedByEmailProps = {
    email: string;
    orgId: string;
};

export async function getConnectedByEmail({ email, orgId }: GetConnectedByEmailProps) {
    await protectedProcedure();

    return await db.query.connected.findMany({
        where: and(
            eq(connected.email, email),
            eq(connected.orgId, orgId)
        ),
    });
}
