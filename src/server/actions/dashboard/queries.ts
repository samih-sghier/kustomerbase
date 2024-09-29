import { db } from "@/server/db";
import { property, sgAlert, subscriptions, users, membersToOrganizations, emailLogs, connected } from "@/server/db/schema";
import { eq, count, and } from "drizzle-orm";
import { protectedProcedure } from "@/server/procedures";
import { getOrganizations } from "@/server/actions/organization/queries";

// Function to get dashboard information
export async function getDashboardInfo() {
    await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    if (!currentOrg) {
        return {
            emailsSent: 0,
            emailsSentGrowth: 0,
            activeUsers: 0,
            activeUsersGrowth: 0,
            connectedEmails: 0,
            connectedEmailsGrowth: 0,
            inquiries: 0,
            inquiriesGrowth: 0,
            avgResponseTime: "0m",
            avgResponseTimeChange: 0,
            alerts: 0,
            emailRules: 0,
            emailRulesGrowth: 0,
            apiUsage: 0,
            apiUsageChange: 0
        };
    }

    const organizationId = currentOrg.id;

    const emailsSent = await db
        .select({ count: count() })
        .from(emailLogs)
        .where(eq(emailLogs.orgId, organizationId))
        .execute()
        .then(res => res[0]?.count ?? 0);

    const activeUsers = await db
        .select({ count: count() })
        .from(membersToOrganizations)
        .where(eq(membersToOrganizations.organizationId, organizationId))
        .execute()
        .then(res => res[0]?.count ?? 0);

    const connectedEmails = await db
        .select({ count: count() })
        .from(connected)
        .where(eq(connected.orgId, organizationId))
        .execute()
        .then(res => res[0]?.count ?? 0);

    const automatedResponses = await db
        .select({ count: count() })
        .from(emailLogs)
        .where(and(
            eq(emailLogs.orgId, organizationId),
            eq(emailLogs.status, 'sent')
        ))
        .execute()
        .then(res => res[0]?.count ?? 0);

    // Implement logic for other metrics...

    return {
        emailsSent,
        emailsSentGrowth: 5, // Placeholder, implement actual growth calculation
        activeUsers,
        activeUsersGrowth: 3, // Placeholder
        connectedEmails,
        connectedEmailsGrowth: 2, // Placeholder
        inquiries: 10, // Placeholder
        inquiriesGrowth: 2, // Placeholder
        avgResponseTime: "5m", // Placeholder
        avgResponseTimeChange: -2, // Placeholder
        alerts: 0, // Placeholder
        emailRules: 15, // Placeholder
        emailRulesGrowth: 2, // Placeholder
        apiUsage: 1000, // Placeholder
        apiUsageChange: 5 // Placeholder
    };
}

// currencyUtils.ts
export function formatCurrency(amount: string | number | null | undefined): string {
    // Convert string to number if necessary
    if (typeof amount === 'string') {
        amount = parseFloat(amount);
    }

    // Check if the amount is a valid number
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
    }

    // Use Intl.NumberFormat to format the number
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return formatter.format(amount);
}

