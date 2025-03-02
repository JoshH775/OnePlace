import { and, eq } from "drizzle-orm";
import { db } from "../initDB";
import { userSettingsTable } from "../schema";
import { UserSettingsKeysType } from "@shared/types";
import { UserSettingsKeys } from "@shared/constants";

console.log(UserSettingsKeys)

export default class SettingsRepository {
    async getUserSetting(
        key: UserSettingsKeysType,
        userId: number
    ): Promise<string | null> {
        const setting = await db.query.userSettingsTable.findFirst({
            where: and(
                eq(userSettingsTable.userId, userId),
                eq(userSettingsTable.key, key)
            ),
        });

        if (!setting) return null;

        return setting.value
    }

    async setUserSetting(
        userId: number,
        key: UserSettingsKeysType,
        value: string,
    ) {
        await db
            .insert(userSettingsTable)
            .values({
                userId,
                key,
                value,
            })
            .onDuplicateKeyUpdate({
                set: { value },
            });
    }

    async getAllForUser(userId: number): Promise<Record<UserSettingsKeysType, { value: string }>> {
        const result = await db.query.userSettingsTable.findMany({
            where: eq(userSettingsTable.userId, userId),
        });

        const settings = {} as Record<UserSettingsKeysType, { value: string }>;
        result.forEach((setting) => {
            settings[setting.key as UserSettingsKeysType] = { value: setting.value };
        });

        return settings;
    }
}


