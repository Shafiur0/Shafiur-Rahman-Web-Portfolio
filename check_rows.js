import { neon } from '@neondatabase/serverless';

const databaseUrl = "postgresql://neondb_owner:npg_YN7LJbtSF5kw@ep-wispy-water-annpgty7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

async function check() {
  try {
    const skills = await sql`SELECT COUNT(*) FROM skills`;
    const projects = await sql`SELECT COUNT(*) FROM projects`;
    const achievements = await sql`SELECT COUNT(*) FROM achievements`;
    const settings = await sql`SELECT COUNT(*) FROM profile_settings`;
    
    console.log("Skills count:", skills[0].count);
    console.log("Projects count:", projects[0].count);
    console.log("Achievements count:", achievements[0].count);
    console.log("Profile settings count:", settings[0].count);
  } catch (error) {
    console.error("Error querying database rows:", error);
  }
}

check();
