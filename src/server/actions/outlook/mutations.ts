"use server";
import { decode } from 'html-entities';
import { db } from "@/server/db";
import { protectedProcedure } from "@/server/procedures";
import { env } from "@/env";
import { and, eq } from "drizzle-orm";
import { connected, connectedInsertSchema } from "@/server/db/schema";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/TokenCredentialAuthenticationProvider.js";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { getOrganizations } from '../organization/queries';
import { ClientSecretCredential } from "@azure/identity";


const REDIRECT_URI = `${env.NEXTAUTH_URL}/api/outlook/authorize`;

// Replace these with your credentials
const msalConfig = {
    auth: {
        clientId: "9f0d7351-87d3-450a-8f64-ad664a87a7d7",
        authority: `https://login.microsoftonline.com/${"46f71724-bc5a-41ea-b723-93544bd5a83e"}`,
        clientSecret: "VUJ8Q~FPaHD4TMO7RhiE1WPhMxO5hlP~qmd3ndiF",
        redirectUri: REDIRECT_URI
    },
};

const redirectUri = `${env.NEXTAUTH_URL}/api/outlook/authorize`;
const app = new ConfidentialClientApplication(msalConfig);
const credential = new ClientSecretCredential(
    '46f71724-bc5a-41ea-b723-93544bd5a83e',
    '9f0d7351-87d3-450a-8f64-ad664a87a7d7',
    'VUJ8Q~FPaHD4TMO7RhiE1WPhMxO5hlP~qmd3ndiF',
  );
/**
 * Generate authorization URL for Outlook
 */
export async function authorizeOutlook(metadata) {
    const authUrl = app.getAuthCodeUrl({
        redirectUri,
        scopes: ["User.Read", "Mail.Read", "Mail.Send", "offline_access"],
        state: JSON.stringify(metadata),
    });
    return authUrl;
}

/**
 * Handle Outlook OAuth callback and exchange code for access token
 */
export async function handleOAuthCallbackMutation({ code, state }: { code: string, state: any }) {
    if (!code) throw new Error("Authorization code is required");
    
    try {
        const tokenResponse = await app.acquireTokenByCode({
            code,
            redirectUri,
            scopes: ["User.Read", "Mail.Read", "Mail.Send", "offline_access"],
        });
        
        const accessToken = tokenResponse.accessToken;
        
        const refToken = async() => {
            const tokenCache = app.getTokenCache().serialize();
            const refreshTokenObject = (JSON.parse(tokenCache)).RefreshToken
            const refreshToken = refreshTokenObject[Object.keys(refreshTokenObject)[0]].secret;
            return refreshToken;
        }
        const refreshToken = await refToken();
        
        const email = tokenResponse?.account?.username;
        const metadata = state ? JSON.parse(state) : {};
        const orgId = metadata.orgId || '';
        
        console.log("metadata.purpose " + metadata.purpose);
        console.log("metadata.frequency " + metadata.frequency);
        console.log("tokenResponse.expiresOn " + new Date(tokenResponse.expiresOn).getTime());
        
        // Create subscription (watch) for the mailbox
        let subscriptionDetails;
        try {
            const client = Client.init({
                authProvider: async (done) => {
                    done(null, accessToken);
                }
            });

            subscriptionDetails = await createWatchMutation({access_token: accessToken, refresh_token: refreshToken});
        } catch (subscriptionError) {
            console.error('Failed to create Outlook subscription:', subscriptionError);
            // Optionally, you might want to handle this error differently
        }
        
        await createConnectedMutation({
            email,
            orgId,
            access_token: accessToken,
            refresh_token: refreshToken,
            provider: "outlook",
            expires_at: tokenResponse.expiresOn ? Math.floor(new Date(tokenResponse.expiresOn).getTime() / 1000) : undefined,
            frequency: +metadata.frequency || undefined,
            historyId: subscriptionDetails?.subscriptionId || -1, // Use subscription ID as historyId
            isActive: true,
            purpose: metadata.purpose,
        });
        
        return { 
            tokens: { accessToken, refreshToken }, 
            email, 
            metadata,
            subscription: subscriptionDetails
        };
    } catch (error) {
        throw new Error("Failed to exchange code for access token: " + error.message);
    }
}
/**
 * Create a subscription for Outlook notifications
 */
export async function createWatchMutation({ access_token, refresh_token }: { access_token: string, refresh_token: string }) {
    try {
        // Initialize Microsoft Graph client
        const client = Client.init({
            authProvider: async (done) => {
                done(null, access_token);
            }
        });

        // Create a subscription (equivalent to Gmail's watch)
        const subscription = await client.api('/subscriptions')
            .post({
                changeType: 'created,updated', // Watch for new and updated messages
                notificationUrl: 'https://souk-app-api-v2-prod.us-east-2.elasticbeanstalk.com/health', // Your webhook endpoint
                resource: 'me/mailFolders/inbox/messages',
                expirationDateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            });

        return { 
            subscriptionId: subscription.id, 
            expirationDateTime: new Date(subscription.expirationDateTime).getTime()
        };

    } catch (error) {
        console.error('Error setting up Outlook subscription:', error);
        return { error: error.message };
    }
}

export async function stopOutlookWatchMutation({ access_token, refresh_token }: { access_token: string, refresh_token: string }) {
    try {
        // Initialize Microsoft Graph client
        const client = Client.init({
            authProvider: async (done) => {
                done(null, access_token);
            }
        });

        // Get the existing subscription
        const subscriptions = await client.api('/subscriptions').get();

        // Delete the first (or specific) subscription
        if (subscriptions.value && subscriptions.value.length > 0) {
            await client.api(`/subscriptions/${subscriptions.value[0].id}`)
                .delete();
        }

        return { message: 'Subscription stopped successfully.' };

    } catch (error) {
        console.error('Error stopping Outlook subscription:', error);
        return { error: error?.message };
    }
}

/**
 * Remove an existing subscription
 */
export async function removeOutlookSubscription(subscriptionId, accessToken) {
    const client = Client.initWithMiddleware({
        authProvider: new TokenCredentialAuthenticationProvider(credential, {
            getToken: async () => ({ token: accessToken, expiresOnTimestamp: Date.now() + 3600 * 1000 }),
        }),
    });

    try {
        await client.api(`/subscriptions/${subscriptionId}`).delete();
        return { message: "Subscription removed successfully." };
    } catch (error) {
        throw new Error("Failed to remove subscription: " + error.message);
    }
}

/**
 * Create a connected record
 */
export async function createConnectedMutation(props) {
    const { user } = await protectedProcedure();
    const { currentOrg } = await getOrganizations();

    const connectedParse = await connectedInsertSchema.safeParseAsync(props);
    if (!connectedParse.success) {
        const fieldErrors = connectedParse.error.errors.map(error => ({
            path: error.path.join('.'),
            message: error.message
        }));
    
        throw new Error(JSON.stringify({
            message: "Invalid connected data",
            errors: fieldErrors
        }));
    }

    const connectedData = connectedParse.data;
    const existingConnectedItem = await db
        .select()
        .from(connected)
        .where(
            and(
                eq(connected.email, connectedData.email),
                eq(connected.orgId, currentOrg?.id ?? connectedData.orgId)
            )
        )
        .execute();

    if (existingConnectedItem.length > 0) {
        return await db
            .update(connected)
            .set({
                refresh_token: connectedData.refresh_token,
                access_token: connectedData.access_token,
                expires_at: connectedData.expires_at,
                isActive: true,
            })
            .where(
                and(
                    eq(connected.email, connectedData.email),
                    eq(connected.orgId, currentOrg?.id ?? connectedData.orgId)
                )
            )
            .execute();
    } else {
        return await db
            .insert(connected)
            .values({
                ...connectedData,
                orgId: connectedData.orgId ?? currentOrg?.id,
                isActive: true,
            })
            .execute();
    }
}
