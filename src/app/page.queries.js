import sql from "@/app/api/utils/sql";

export async function getPortfolioData() {
  try {
    const [skills, projects, achievements, settings] = await Promise.all([
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
        SELECT * FROM profile_settings
      `
    ]);

    const profile = {};
    if (Array.isArray(settings)) {
      for (const setting of settings) {
        profile[setting.key] = setting.value;
      }
    }

    return {
      skills: Array.isArray(skills) ? skills : [],
      projects: Array.isArray(projects) ? projects : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      profile
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

