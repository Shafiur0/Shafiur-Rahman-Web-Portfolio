import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const settings = await sql`SELECT * FROM profile_settings`;

    // Convert to object format
    const profile = {};
    settings.forEach((setting) => {
      profile[setting.key] = setting.value;
    });

    return Response.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
      return Response.json(
        { error: "Key and value are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO profile_settings (key, value, updated_at)
      VALUES (${key}, ${value}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) 
      DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating profile setting:", error);
    return Response.json(
      { error: "Failed to update profile setting" },
      { status: 500 },
    );
  }
}
