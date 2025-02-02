import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    dialect: 'mysql',
    schema: './src/database/schema.ts',
    dbCredentials: {
        url: process.env.DB_URL!,
    },
    out: './src/database/migrations'
    },
)