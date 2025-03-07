import { and, eq } from "drizzle-orm";
import { db } from "../initDB";
import { userSettingsTable } from "../schema";
import { SettingsObject, UserSettingsKeysType } from "@shared/types";
import { DefaultUserSettings } from "@shared/constants";

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

    return setting.value;
  }

  async setUserSetting(
    userId: number,
    key: UserSettingsKeysType,
    value: string
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

  async getAllForUser(
    userId: number
  ): Promise<SettingsObject> {
    const result = await db.query.userSettingsTable.findMany({
      where: eq(userSettingsTable.userId, userId),
    });

    const userSettings = {} as SettingsObject;

    for (const setting of result) {
      userSettings[setting.key as UserSettingsKeysType] = setting.value;
    }

    const settings = {
      ...DefaultUserSettings,
      ...userSettings,
    };

    return settings;
  }
}
