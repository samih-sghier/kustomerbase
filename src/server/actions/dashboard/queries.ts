import { db } from "@/server/db";
import { tenant, property, sgAlert, subscriptions, users, membersToOrganizations, watchlist } from "@/server/db/schema";
import { eq, count, sum } from "drizzle-orm";
import { protectedProcedure } from "@/server/procedures";
import { getOrganizations } from "@/server/actions/organization/queries";

// Function to get dashboard information
export async function getDashboardInfo() {
    // Ensure proper authorization
    await protectedProcedure();

    // Retrieve the current organization
    const { currentOrg } = await getOrganizations();

    // Return zero values if organization is not found
    if (!currentOrg) {
        return {
            totalRent: formatCurrency(0),
            numberOfTenants: 0,
            numberOfAlerts: 0,
            numberOfProperties: 0,
            numberOfOrganizationMembers: 0,
            numberWatchlist: 0
        };
    }


    const organizationId = currentOrg.id;

    // Fetch total rental value for the organization
    const rentalValueResult = await db
        .select({ totalRentalValue: sum(property.price) })
        .from(property)
        .where(eq(property.organizationId, organizationId)) // Assuming property table has organizationId
        .execute();

    const rentalValue = rentalValueResult[0]?.totalRentalValue ?? 0;

    // Fetch number of tenants for the organization
    const numberOfTenants = await db
        .select({ count: count() })
        .from(tenant)
        .where(eq(tenant.organizationId, organizationId))
        .execute()
        .then(res => res[0]?.count ?? 0); // Safely access the count value;



    // Fetch number of alerts for the organization
    const numberOfAlerts = await db
        .select({ count: count() })
        .from(sgAlert)
        .innerJoin(tenant, eq(sgAlert.tenantId, tenant.id))
        .where(eq(tenant.organizationId, organizationId))
        .execute()
        .then(res => res[0]?.count ?? 0); // Safely access the count value;




    // Fetch number of properties for the organization
    const numberOfProperties = await db
        .select({ count: count() })
        .from(property)
        .where(eq(property.organizationId, organizationId)) // Assuming property table has organizationId
        .execute()
        .then(res => res[0]?.count ?? 0); // Safely access the count value;

    // Dummy value for number of organization members; update this based on actual logic
    const numberOfOrganizationMembers = await db
        .select({ count: count() })
        .from(membersToOrganizations)
        .where(eq(membersToOrganizations.organizationId, organizationId))
        .execute()
        .then(res => res[0]?.count ?? 0); // Safely access the count value;

    const numberWatchlist = await db
        .select({ count: count() })
        .from(watchlist)
        .where(eq(watchlist.organizationId, organizationId))
        .execute()
        .then(res => res[0]?.count ?? 0);

    const totalRent = formatCurrency(rentalValue);
    return {
        totalRent,
        numberOfTenants,
        numberOfAlerts,
        numberOfProperties,
        numberOfOrganizationMembers,
        numberWatchlist
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

