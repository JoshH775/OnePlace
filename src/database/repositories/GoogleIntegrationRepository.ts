
import { googleIntegrationsTable } from "../schema";
import { db } from "../initDB";
import { eq } from "drizzle-orm";
import { IntegrationRepository } from "./IntegrationUtils";

export class GoogleIntegrationRepository implements IntegrationRepository {

    integrationName: string = 'google';

    async findByUserId(userId: number, includeTokens = true): Promise<GoogleIntegration | GoogleIntegrationWithoutTokens | null> {
        const integration = await db.query.googleIntegrationsTable.findFirst({
            where: (integrations, { eq }) => eq(integrations.userId, userId),
        });
        
        if (!integration) return null;

        if (includeTokens) {
            return integration;
        }

        const { accessToken, refreshToken, ...integrationWithoutTokens } = integration;
        return integrationWithoutTokens;
     

    }

    async findByGoogleId(googleId: string): Promise<GoogleIntegration | null> {
        const integration = await db.query.googleIntegrationsTable.findFirst({
            where: (integrations, { eq }) => eq(integrations.googleId, googleId),
        });

        return integration ?? null;
    }

    async createIntegrationForUser(userId: number, googleId: string, accessToken: string, refreshToken: string): Promise<GoogleIntegration> {
        const result = await db.insert(googleIntegrationsTable).values({
            userId: userId,
            googleId: googleId,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });

        return {
            id: result[0].insertId,
            userId: userId,
            googleId: googleId,
            accessToken: accessToken,
            refreshToken: refreshToken,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    async deleteIntegrationForUser(userId: number): Promise<{ status: number, message: string }> {
        const integration = await this.findByUserId(userId);
        if (!integration) {
            return { status: 404, message: `Integration not found for user id ${userId}` };
        }

        const encodedToken = encodeURIComponent((integration as GoogleIntegration).accessToken);
        const response = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${encodedToken}`);

        if (response.status !== 200 && response.status !== 400) {
            return { status: response.status, message: 'Failed to revoke access token' };
        }

        await db.delete(googleIntegrationsTable).where(eq(googleIntegrationsTable.userId, userId));

        return { status: 200, message: 'Successfully deleted integration' };
    }

    async refreshAccessToken(userId: number, integrationId: number) {
        const integration = await this.findByUserId(userId);
        if (!integration) {
            return { status: 404, message: `Integration not found for user id ${userId}` };
        }

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&refresh_token=${(integration as GoogleIntegration).refreshToken}&grant_type=refresh_token`
        });

        if (response.status !== 200) {
            return { status: response.status, message: 'Failed to refresh access token' };
        }

        const data = await response.json();
        await db.update(googleIntegrationsTable).set({
            accessToken: data.access_token,
        }).where(eq(googleIntegrationsTable.id, integrationId));

        return { status: 200, message: 'Successfully refreshed access token' };
    }
}

export type GoogleIntegration = {
    id: number;
    userId: number;
    googleId: string;
    accessToken: string;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type GoogleIntegrationWithoutTokens = Omit<GoogleIntegration, 'accessToken' | 'refreshToken'>;