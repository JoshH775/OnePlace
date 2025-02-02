import { drizzle } from 'drizzle-orm/mysql2'
import { migrate } from 'drizzle-orm/mysql2/migrator'
import * as schema from './schema'
import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
    uri: process.env.DB_URL,
  });

export const db = drizzle({ client: connection, schema, mode: 'default' })
await migrate(db, { migrationsFolder: './src/database/migrations' })
console.log('Database initialized')



