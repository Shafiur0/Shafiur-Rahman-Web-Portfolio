import sql from "@/app/api/utils/sql";

export async function getPortfolioData() {
  try {
    const [skills, projects, achievements, profiles] = await Promise.all([
      sql`
        SELECT * FROM skills 
        ORDER BY display_order ASC, created_at DESC
      `,
      sql`
        SELECT * FROM projects 
        ORDER BY display_order ASC, created_at DESC
      `,
      sql`
        SELECT * FROM achievements 
        ORDER BY display_order ASC, created_at DESC
      `,
      sql`
        SELECT * FROM profile 
        LIMIT 1
      `
    ]);

    return {
      skills: Array.isArray(skills) ? skills : [],
      projects: Array.isArray(projects) ? projects : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      profile: profiles?.[0] || {}
    };
  } catch (error) {
    console.error("Error loading portfolio data in server loader:", error);
    return {
      skills: [],
      projects: [],
      achievements: [],
      profile: {}
    };
  }
}
