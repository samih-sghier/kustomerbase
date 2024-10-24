"use server";

import { db } from "@/server/db";
import { sources, organizations } from "@/server/db/schema";
import { adminProcedure, protectedProcedure } from "@/server/procedures";
import { unstable_noStore as noStore } from "next/cache";
import { asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { getOrganizations } from "../organization/queries";

/**
 * Get all sources belonging to the user's organization
 * @returns all sources
 */
export async function getOrgSourcesQuery() {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    // Ensure the user is linked to an organization
    if (!currentOrg) {
        throw new Error("Organization not found");
    }

    return await db.query.sources.findFirst({
        where: eq(sources.orgId, currentOrg.id),
    });
}

/**
 * Get stats for the sources belonging to the user's organization
 * @returns stats object containing counts for different source types and total characters
 */
export async function getSourceStatsQuery() {
    const { user } = await protectedProcedure();

    const { currentOrg } = await getOrganizations();

    // Ensure the user is linked to an organization
    if (!currentOrg) {
        throw new Error("Organization not found");
    }

    const orgSources = await db.query.sources.findFirst({
        where: eq(sources.orgId, currentOrg.id),
    });

    if (!orgSources) {
        throw new Error("No sources found for this organization");
    }

    const stats = {
        fileCount: 0,
        fileChars: 0,
        textInputChars: orgSources.text_source?.length || 0,
        linkCount: 0,
        linkChars: 0,
        qaCount: 0,
        qaChars: 0,
        totalChars: 0,
        mailCount: 0,
        mailChars: 0,
        lastTrainedDate: orgSources.lastTrained,
        updatedOn: orgSources.updatedOn
    };

    // Count documents
    if (orgSources.documents) {
        stats.fileCount = Object.keys(orgSources.documents).length;
        stats.fileChars = Object.values(orgSources.documents).reduce((sum, text) => sum + text.length, 0);
    }

    // Count website data
    if (orgSources.website_data) {
        stats.linkCount = Object.keys(orgSources.website_data).length;
        stats.linkChars = Object.values(orgSources.website_data).reduce((sum, text) => sum + text.length, 0);
    }

    // Count Q&A
    if (orgSources.qa_source) {
        stats.qaCount = Object.keys(orgSources.qa_source).length;
        stats.qaChars = Object.entries(orgSources.qa_source).reduce((sum, [q, a]) => sum + q.length + a.length, 0);
    }

    if (orgSources.mail_source) {
        stats.mailCount = Object.keys(orgSources.mail_source).length;
        stats.mailChars = Object.values(orgSources.mail_source).reduce((sum, text) => sum + text.length, 0);
    }


    // Calculate total
    stats.totalChars = stats.fileChars + stats.textInputChars + stats.linkChars + stats.qaChars + stats.mailChars;

    return stats;
}

