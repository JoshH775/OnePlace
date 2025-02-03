
import { googleIntegrationsTable } from "../schema";
import { db } from "../initDB";
import { eq } from "drizzle-orm";
import { IntegrationRepository } from "./IntegrationUtils";

export class GoogleIntegrationRepository implements IntegrationRepository {

    integrationName: string = 'google';

    async findByUserId(userId: number): Promise<GoogleIntegration | null> {
        const integration = await db.query.googleIntegrationsTable.findFirst({
            where: (integrations, { eq }) => eq(integrations.userId, userId),
        });

        return integration ?? null;
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

        const encodedToken = encodeURIComponent(integration.accessToken);
        const response = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${encodedToken}`);

        if (response.status !== 200 && response.status !== 400) {
            return { status: response.status, message: 'Failed to revoke access token' };
        }

        await db.delete(googleIntegrationsTable).where(eq(googleIntegrationsTable.userId, userId));

        return { status: 200, message: 'Successfully deleted integration' };
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