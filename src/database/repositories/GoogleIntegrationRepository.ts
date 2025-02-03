
import { googleIntegrationsTable } from "../schema";
import { db } from "../initDB";

export class GoogleIntegrationRepository {

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
}

export type GoogleIntegration = {
    id: number;
    userId: number;
    googleId: string;
    accessToken: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
}