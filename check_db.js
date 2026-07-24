import { neon } from '@neondatabase/serverless';

const databaseUrl = "postgresql://neondb_owner:npg_YN7LJbtSF5kw@ep-wispy-water-annpgty7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

async function check() {
  try {
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    console.log("Tables in the database:", tables);
  } catch (error) {
    console.error("Error querying database:", error);
  }
}

check();
