import { db } from "@/server/db";
import { emailLogs, connected, organizations } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { unstable_noStore as noStore } from "next/cache";
import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { getOrganizations } from "../organization/queries";

// Function to get all email logs for the user's organization
export async function getOrgEmailLogsQuery() {
    const { currentOrg } = await getOrganizations();

    return await db.query.emailLogs.findMany({
        orderBy: desc(emailLogs.createdAt),
        where: eq(emailLogs.orgId, currentOrg.id),
        with: {
            connected: true, // Join connected table to get sender details
        },
    });
}

// Schema for paginated email logs
const paginatedEmailLogsPropsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    recipient: z.string().optional(),
    subject: z.string().optional(),
    status: z.string().optional()
});

type GetPaginatedEmailLogsQueryProps = z.infer<typeof paginatedEmailLogsPropsSchema>;

// Function to get all email logs with pagination and filtering
export async function getAllPaginatedEmailLogsQuery(
    input: GetPaginatedEmailLogsQueryProps
) {
    const { currentOrg } = await getOrganizations();
    if (!currentOrg) {
        throw new Error("Organization not found");
    }
    noStore();
    await protectedProcedure();

    const offset = (input.page - 1) * input.per_page;

    // Determine sorting column and order
    const [column, order] = (input.sort?.split(".") as [
        keyof typeof emailLogs.$inferSelect | undefined,
        "asc" | "desc" | undefined
    ]) ?? ["createdAt", "desc"];

    // Collect statuses if provided
    const statuses = (input.status?.split(".") as (typeof emailLogs.$inferSelect.status)[]) ?? [];

    const { data, total } = await db.transaction(async (tx) => {
        // Fetch paginated data with filters
        const response = await tx.query.emailLogs.findMany({
            where: and(
                or(
                    input.email ? ilike(emailLogs.email, `%${input.email}%`) : undefined,
                    input.recipient ? ilike(emailLogs.recipient, `%${input.recipient}%`) : undefined,
                    input.subject ? ilike(emailLogs.subject, `%${input.subject}%`) : undefined,
                    statuses.length > 0 ? inArray(emailLogs.status, statuses) : undefined,
                ),
                eq(emailLogs.orgId, currentOrg.id)
            ),
            // with: {
            //     connected: true, // Include sender details
            // },
            offset,
            limit: input.per_page,
            orderBy:
                column && column in emailLogs
                    ? order === "asc"
                        ? asc(emailLogs[column])
                        : desc(emailLogs[column])
                    : desc(emailLogs.createdAt),
        });

        // Count the total number of items for pagination
        const total = await tx
            .select({ count: count() })
            .from(emailLogs)
            .where(
                and(
                    or(
                        input.email ? ilike(emailLogs.email, `%${input.email}%`) : undefined,
                        input.recipient ? ilike(emailLogs.recipient, `%${input.recipient}%`) : undefined,
                        input.subject ? ilike(emailLogs.subject, `%${input.subject}%`) : undefined,
                        statuses.length > 0 ? inArray(emailLogs.status, statuses) : undefined,
                    ),
                    eq(emailLogs.orgId, currentOrg.id)
                )
            )
            .execute()
            .then(res => res[0]?.count ?? 0);

        return { data: response, total };
    });

    const pageCount = Math.ceil(total / input.per_page);

    return { data, pageCount, total };
}