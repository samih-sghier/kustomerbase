import { relations, sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTableCreator,
    primaryKey,
    text,
    timestamp,
    unique,
    varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type AdapterAccount } from "next-auth/adapters";
import { z } from "zod";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
    (name) => `sg_${name}`,
);

export const usersRoleEnum = pgEnum("role", ["User", "Admin", "Super Admin"]);


export const users = createTable("user", {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified", {
        mode: "date",
    }).default(sql`CURRENT_TIMESTAMP`),
    image: varchar("image", { length: 255 }),
    role: usersRoleEnum("role").default("User").notNull(),
    isNewUser: boolean("isNewUser").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    membersToOrganizations: many(membersToOrganizations),
    feedback: many(feedback),
}));

export const userInsertSchema = createInsertSchema(users, {
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long"),
    email: z.string().email(),
    image: z.string().url(),
});

export const accounts = createTable(
    "account",
    {
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id),
        type: varchar("type", { length: 255 })
            .$type<AdapterAccount["type"]>()
            .notNull(),
        provider: varchar("provider", { length: 255 }).notNull(),
        providerAccountId: varchar("providerAccountId", {
            length: 255,
        }).notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: varchar("token_type", { length: 255 }),
        scope: varchar("scope", { length: 255 }),
        id_token: text("id_token"),
        session_state: varchar("session_state", { length: 255 }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
        userIdIdx: index("account_userId_idx").on(account.userId),
    }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
    "session",
    {
        sessionToken: varchar("sessionToken", { length: 255 })
            .notNull()
            .primaryKey(),
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (session) => ({
        userIdIdx: index("session_userId_idx").on(session.userId),
    }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
    "verificationToken",
    {
        identifier: varchar("identifier", { length: 255 }).notNull(),
        token: varchar("token", { length: 255 }).notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    }),
);

export const organizations = createTable("organization", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    ownerId: varchar("ownerId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
});

export const createOrgInsertSchema = createInsertSchema(organizations, {
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long"),
    image: z.string().url({ message: "Invalid image URL" }),
});

export const organizationsRelations = relations(
    organizations,
    ({ one, many }) => ({
        owner: one(users, {
            fields: [organizations.ownerId],
            references: [users.id],
        }),
        membersToOrganizations: many(membersToOrganizations),
        subscriptions: one(subscriptions, {
            fields: [organizations.id],
            references: [subscriptions.orgId],
        }),
    }),
);

export const membersToOrganizationsRoleEnum = pgEnum("org-member-role", [
    "Director",
    "Property Manager",
    "Agent",
    "IT",
    "Analyst",
    "Billing",
    "Viewer",
    "Developer",
    "Billing",
    "Admin",
]);

export const membersToOrganizations = createTable(
    "membersToOrganizations",
    {
        id: varchar("id", { length: 255 }).default(sql`gen_random_uuid()`),
        memberId: varchar("memberId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        memberEmail: varchar("memberEmail", { length: 255 }).notNull(),
        organizationId: varchar("organizationId", { length: 255 })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        role: membersToOrganizationsRoleEnum("role")
            .default("Viewer")
            .notNull(),
        createdAt: timestamp("createdAt", { mode: "date" })
            .notNull()
            .defaultNow(),
    },
    (mto) => ({
        compoundKey: primaryKey({
            columns: [mto.id, mto.memberId, mto.organizationId],
        }),
    }),
);

export const membersToOrganizationsRelations = relations(
    membersToOrganizations,
    ({ one }) => ({
        member: one(users, {
            fields: [membersToOrganizations.memberId],
            references: [users.id],
        }),
        organization: one(organizations, {
            fields: [membersToOrganizations.organizationId],
            references: [organizations.id],
        }),
    }),
);

export const membersToOrganizationsInsertSchema = createInsertSchema(
    membersToOrganizations,
);

export const orgRequests = createTable(
    "orgRequest",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        organizationId: varchar("organizationId", {
            length: 255,
        })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt", { mode: "date" })
            .notNull()
            .defaultNow(),
    },
    (or) => ({
        orgIdIdx: index("orgRequest_organizationId_idx").on(or.organizationId),
    }),
);

export const orgRequestsRelations = relations(orgRequests, ({ one }) => ({
    user: one(users, { fields: [orgRequests.userId], references: [users.id] }),
    organization: one(organizations, {
        fields: [orgRequests.organizationId],
        references: [organizations.id],
    }),
}));

export const orgRequestInsertSchema = createInsertSchema(orgRequests);

// Property schema

export const propertyStatusEnum = pgEnum("property-status", [
    "Available",
    "Leased",
    "Pending",
]);

export const propertyTypeEnum = pgEnum("property-type", [
    "Apartment",
    "Condominium",
    "Townhouse",
    "Studio Apartment",
    "Loft",
    "Duplex",
    "Multi-Family Home",
]);

export const property = createTable("property", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    organizationId: varchar("organizationId", { length: 255 })
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    status: propertyStatusEnum("status").default("Available").notNull(),
    type: propertyTypeEnum("type").notNull(),
    placeId: text("placeId").notNull(),
    unitNumber: text("unitNumber").notNull(),
    tenantCapacity: integer("tenantCapacity").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// Enum for alert types
export const alertTypeEnum = pgEnum("alert_type", [
    "Subleasing",
    "Notice to Vacate",
    "Unauthorized Tenants",
    "Court Complaints",
]);

// Define the watchlist table
// Define the watchlist table with a compound primary key or unique index
// Define the watchlist table
export const watchlist = createTable(
    "watchlist",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        organizationId: varchar("organizationId", { length: 255 })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        propertyId: varchar("propertyId", { length: 255 })
            .references(() => property.id, { onDelete: "set null" }),
        tenantId: varchar("tenantId", { length: 255 })
            .references(() => tenant.id, { onDelete: "set null" }),
        alertType: alertTypeEnum("alertType").notNull(),
        createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
        updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().defaultNow(),
    },
    (table) => ({
        // Create a compound index to ensure uniqueness
        uniqueIndex: index("unique_watchlist_constraint")
            .on(table.organizationId, table.propertyId, table.tenantId, table.alertType),
    })
);

export const watchlistRelations = relations(watchlist, ({ one }) => ({
    organization: one(organizations, {
        fields: [watchlist.organizationId],
        references: [organizations.id],
    }),
    property: one(property, {
        fields: [watchlist.propertyId],
        references: [property.id],
    }),
    tenant: one(tenant, {
        fields: [watchlist.tenantId],
        references: [tenant.id],
    }),
}));


export const watchlistInsertSchema = createInsertSchema(watchlist, {
    organizationId: z.string().uuid("Invalid organization ID format"),
    propertyId: z.string().uuid("Invalid property ID format"),
    tenantId: z.string().optional(),
    alertType: z.enum([
        "Subleasing",
        "Unauthorized Tenants",
        "Notice to Vacate",
        "Court Complaints",
    ])
});


export const propertyRelations = relations(property, ({ one }) => ({
    organization: one(organizations, {
        fields: [property.organizationId],
        references: [organizations.id],
    }),
}));

export const propertyInsertSchema = createInsertSchema(property, {
    title: z.string().min(3, "Title must be at least 3 characters long").max(255, "Title must be at most 255 characters long"),
    description: z.string().min(2, "Description must be at least 10 characters long").optional(),
    price: z.number().min(0, "Price must be a positive number"),
    address: z.string().min(3, "Address must be at least 3 characters long").max(255, "Address must be at most 255 characters long"),
    status: z.enum(["Available", "Leased", "Pending"]),
    organizationId: z.string(),
    type: z.enum(["Apartment",
        "Condominium",
        "Townhouse",
        "Studio Apartment",
        "Loft",
        "Duplex",
        "Multi-Family Home"]),
    unitNumber: z.string(),
    placeId: z.string(),
    tenantCapacity: z.number().positive("Capacity must be a positive number").optional()
});

export const propertySelectSchema = createSelectSchema(property, {
    title: z.string().min(3, "Title must be at least 3 characters long").max(255, "Title must be at most 255 characters long"),
    description: z.string().min(2, "Description must be at least 10 characters long").optional(),
    price: z.number().min(0, "Price must be a positive number"),
    address: z.string().min(3, "Address must be at least 3 characters long").max(255, "Address must be at most 255 characters long"),
    status: z.enum(["Available", "Leased", "Pending"]),
    type: z.enum(["Apartment",
        "Condominium",
        "Townhouse",
        "Studio Apartment",
        "Loft",
        "Duplex",
        "Multi-Family Home"]),
    unitNumber: z.string(),
    placeId: z.string(),
    tenantCapacity: z.number().positive("Capacity must be a positive number").optional()
});

export const propertyUpdateSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long").max(255, "Title must be at most 255 characters long").optional(),
    description: z.string().min(2, "Description must be at least 10 characters long").optional(),
    price: z.number().min(0, "Price must be a positive number"),
    address: z.string().min(3, "Address must be at least 3 characters long").max(255, "Address must be at most 255 characters long").optional(),
    status: z.enum(["Available", "Leased", "Pending"]).optional(),
    type: z.enum([
        "Apartment",
        "Condominium",
        "Townhouse",
        "Studio Apartment",
        "Loft",
        "Duplex",
        "Multi-Family Home"
    ]),
    placeId: z.string(),
    unitNumber: z.string(),
    tenantCapacity: z.number().positive("Capacity must be a positive number").optional()
});

// tenants schema

export const tenantStatusEnum = pgEnum("tenant-status", [
    "Active",
    "Inactive",
    "Pending",
]);

export const tenantTypeEnum = pgEnum("tenant-type", [
    "Individual",
    "Corporate",
]);


export const connected = createTable("connected", {
    email: varchar("email", { length: 255 })
        .notNull()
        .primaryKey()
        .unique(),
    orgId: text("orgId")
        .notNull()
        .unique()
        .references(() => organizations.id, { onDelete: "cascade" }),
    frequency: integer("frequency"),
    access_token: varchar("access_token", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }).notNull(),
    purpose: text("purpose"),
    provider: varchar("provider", { length: 255 }).notNull(),
    isActive: boolean("isActive").default(true),
    expires_at: integer("expires_at"),
    lastOn: timestamp("lastOn", { mode: "date" }),
    lastThreadId: varchar("lastThreadId", { length: 255 }),
    updatedOn: timestamp("updatedOn", { mode: "date" }).defaultNow(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const connectedInsertSchema = z.object({
    email: z.string().email("Email must be a valid email address"),
    orgId: z.string(), // Generic string instead of UUID
    frequency: z.number().int().optional(), // Optional if not required
    access_token: z.string().min(1, "Access token is required"),
    refresh_token: z.string().min(1, "Refresh token is required"),
    purpose: z.string().optional(),
    isActive: z.boolean().default(true),
    provider: z.string().min(1, "Provider is required"),
    expires_at: z.number().int().optional(), // Optional if not required
    lastOn: z.string().optional(), // Ensure proper format if needed
    lastThreadId: z.string().optional(),
});

export const connectedUpdateSchema = z.object({
    email: z.string().email("Email must be a valid email address").optional(), // Typically not updated
    orgId: z.string(), // Generic string instead of UUID
    frequency: z.number().int().optional(),
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    purpose: z.string().optional(),
    provider: z.string().optional(),
    expires_at: z.number().int().optional(),
    lastOn: z.string().optional(), // Ensure proper format if needed
    lastThreadId: z.string().optional(),
});


export const connectedSelectSchema = z.object({
    email: z.string().email("Email must be a valid email address"),
    orgId: z.string(), // Generic string instead of UUID
    frequency: z.number().int().optional(),
    access_token: z.string(),
    refresh_token: z.string(),
    purpose: z.string().optional(),
    provider: z.string(),
    isActive: z.boolean(),
    expires_at: z.number().int().optional(),
    lastOn: z.string().optional(), // Ensure proper format if needed
    lastThreadId: z.string().optional(),
    createdAt: z.date().optional() // Date format, adjust as needed
});

export const tenant = createTable("tenant", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    firstName: varchar("firstName", { length: 255 }).notNull(),
    organizationId: varchar("organizationId", { length: 255 }).notNull(),
    lastName: varchar("lastName", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }),
    address: text("address"),
    status: tenantStatusEnum("status").default("Pending").notNull(),
    type: tenantTypeEnum("type").default("Individual").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const tenantRelations = relations(tenant, ({ many }) => ({
    properties: many(property),
}));

export const tenantInsertSchema = createInsertSchema(tenant, {
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Email must be a valid email address"),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(["Active", "Inactive", "Pending"]),
    type: z.enum(["Individual", "Corporate"]),
    organizationId: z.string(),
});

export const tenantUpdateSchema = z.object({
    id: z.string().uuid("Invalid ID format").optional(), // ID is usually not updated
    firstName: z.string().min(1, "First name is required").max(255).optional(),
    lastName: z.string().min(1, "Last name is required").max(255).optional(),
    email: z.string().email("Email must be a valid email address").optional(),
    phone: z.string().max(20).optional(),
    address: z.string().optional(),
    status: z.enum(["Active", "Inactive", "Pending"]).optional(), // Enum values as part of the schema
    type: z.enum(["Individual", "Corporate"]), // Enum values as part of the schema
    organizationId: z.string().uuid("Invalid organization ID format").optional(),
});

export const tenantSelectSchema = createSelectSchema(tenant, {
    firstName: z.string().min(1, "First name must be at least 1 character long"),
    lastName: z.string().min(1, "Last name must be at least 1 character long"),
    email: z.string().email("Email must be a valid email address"),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(["Active", "Inactive", "Pending"]),
    type: z.enum(["Individual", "Corporate"]),
    organizationId: z.string().uuid("Invalid organization ID format"),
    createdAt: z.date().optional() // Adjust according to how you handle dates
});

// Feedback schema

export const feedbackLabelEnum = pgEnum("feedback-label", [
    "Issue",
    "Idea",
    "Question",
    "Complaint",
    "Feature Request",
    "Other",
]);

export const feedbackStatusEnum = pgEnum("feedback-status", [
    "Open",
    "In Progress",
    "Closed",
]);

export const feedback = createTable("feedback", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    message: text("message").notNull(),
    label: feedbackLabelEnum("label").notNull(),
    status: feedbackStatusEnum("status").default("Open").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const feedbackRelations = relations(feedback, ({ one }) => ({
    user: one(users, { fields: [feedback.userId], references: [users.id] }),
}));

export const feedbackInsertSchema = createInsertSchema(feedback, {
    title: z
        .string()
        .min(3, "Title is too short")
        .max(255, "Title is too long"),
    message: z
        .string()
        .min(10, "Message is too short")
        .max(1000, "Message is too long"),
});

export const feedbackSelectSchema = createSelectSchema(feedback, {
    title: z
        .string()
        .min(3, "Title is too short")
        .max(255, "Title is too long"),
    message: z
        .string()
        .min(10, "Message is too short")
        .max(1000, "Message is too long"),
});

export const webhookEvents = createTable("webhookEvent", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    eventName: text("eventName").notNull(),
    processed: boolean("processed").default(false),
    body: jsonb("body").notNull(),
    processingError: text("processingError"),
});

export const subscriptions = createTable("subscription", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    stripeSubscriptionId: text("stripeSubscriptionId").unique().notNull(),
    orderId: text("orderId").notNull(),
    orgId: text("orgId")
        .notNull()
        .unique()
        .references(() => organizations.id, { onDelete: "cascade" }),
    priceId: text("priceId").notNull()
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    organization: one(organizations, {
        fields: [subscriptions.orgId],
        references: [organizations.id],
    }),
}));

export const waitlistUsers = createTable("waitlistUser", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const waitlistUsersSchema = createInsertSchema(waitlistUsers, {
    email: z.string().email("Email must be a valid email address"),
    name: z.string().min(3, "Name must be at least 3 characters long"),
});


export const sgAlert = createTable(
    "alert",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        propertyId: varchar("propertyId", { length: 255 })
            .references(() => property.id, { onDelete: "set null" }),
        organizationId: varchar("organizationId", { length: 255 })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        address: varchar("address", { length: 255 }),
        tenantId: varchar("tenantId", { length: 255 })
            .references(() => tenant.id, { onDelete: "set null" }),
        alertType: alertTypeEnum("alertType").notNull(),
        alertLink: varchar("alertLink", { length: 255 }),
        archived: boolean("archived").default(false).notNull(),
        platform: varchar("platform", { length: 255 }),
        detectedOn: timestamp("detectedOn", { mode: "date" }).notNull().defaultNow(),
    },
    (table) => ({
        uniqueAlertIndex: index("unique_alert_constraint")
            .on(table.organizationId, table.propertyId, table.tenantId, table.alertType, table.detectedOn),
    })
);

export const sgAlertRelations = relations(sgAlert, ({ one }) => ({
    organization: one(organizations, {
        fields: [sgAlert.organizationId],
        references: [organizations.id],
    }),
    property: one(property, {
        fields: [sgAlert.propertyId],
        references: [property.id],
    }),
    tenant: one(tenant, {
        fields: [sgAlert.tenantId],
        references: [tenant.id],
    }),
}));

export const sgAlertInsertSchema = createInsertSchema(sgAlert, {
    propertyId: z.string().uuid("Invalid property ID format").optional(),
    organizationId: z.string().uuid("Invalid organization ID format"),
    address: z.string().optional(),
    tenantId: z.string().uuid("Invalid tenant ID format").optional(),
    alertType: z.enum([
        "Subleasing",
        "Unauthorized Tenants",
        "Notice to Vacate",
        "Court Complaints",
    ]),
    alertLink: z.string().url().optional(),
    archived: z.boolean().optional(),
    platform: z.string().optional(),
    detectedOn: z.date().optional(),
});



