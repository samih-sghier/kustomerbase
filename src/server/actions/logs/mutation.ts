"use server";

import { db } from "@/server/db"; // Adjust the import based on your project structure
import { emailLogs } from "@/server/db/schema"; // Import the emailLogs schema
import { protectedProcedure } from "@/server/procedures"; // Ensure you have the necessary authentication
import { eq } from "drizzle-orm"; // Import the eq function from drizzle-orm
import { getOrganizations } from "../organization/queries"; // Import the function to get organizations

export async function removeLogMutation(id: string) {
    if (!id) {
        throw new Error("Invalid log ID");
    }

    // Ensure the user is authenticated
    const { user } = await protectedProcedure();

    // Fetch the current organization
    const { currentOrg } = await getOrganizations();

    // Fetch the log data
    const log = await db.query.emailLogs.findFirst({
        where: eq(emailLogs.id, id)
    });

    if (!log || log.orgId !== currentOrg.id) {
        throw new Error("Log not found or does not belong to the organization");
    }

    // Perform the deletion from the database
    const result = await db.delete(emailLogs).where(eq(emailLogs.id, id)).execute();

    if (result.count === 0) {
        throw new Error("No log found with the provided ID");
    }

    return { message: "Log removed successfully" }; // Optional: return a success message
}