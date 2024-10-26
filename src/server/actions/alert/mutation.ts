"use server";

import { db } from "@/server/db"; // Adjust the import based on your project structure
import { sgAlert } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures"; // Ensure you have the necessary authentication
import { eq } from "drizzle-orm"; // Import the eq function from drizzle-orm
import { getOrganizations } from "../organization/queries"; // Import the function to get organizations

export async function removeAlertMutation(id: string) {
    if (!id) {
        throw new Error("Invalid alert ID");
    }

    // Ensure the user is authenticated
    const { user } = await protectedProcedure();

    // Fetch the current organization
    const { currentOrg } = await getOrganizations();

    // Fetch the alert data
    const alert = await db.query.sgAlert.findFirst({
        where: eq(sgAlert.id, id)
    });

    if (!alert || alert.organizationId !== currentOrg.id) {
        throw new Error("Alert not found or does not belong to the organization");
    }

    const result = await db.delete(sgAlert).where(eq(sgAlert.id, id)).execute();

    if (result.count === 0) {
        throw new Error("No alert found with the provided ID");
    }

    return { message: "Alert removed successfully" }; // Optional: return a success message
}
