import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const achievements = await sql`
      SELECT * FROM achievements 
      ORDER BY display_order ASC, created_at DESC
    `;
    return Response.json(achievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return Response.json(
      { error: "Failed to fetch achievements" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      date,
      icon = "award",
      display_order = 0,
    } = body;

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO achievements (title, description, date, icon, display_order)
      VALUES (${title}, ${description}, ${date}, ${icon}, ${display_order})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating achievement:", error);
    return Response.json(
      { error: "Failed to create achievement" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, description, date, icon, display_order } = body;

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (date !== undefined) {
      updates.push(`date = $${paramCount}`);
      values.push(date);
      paramCount++;
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount}`);
      values.push(icon);
      paramCount++;
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramCount}`);
      values.push(display_order);
      paramCount++;
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const result = await sql(
      `UPDATE achievements SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    if (result.length === 0) {
      return Response.json({ error: "Achievement not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating achievement:", error);
    return Response.json(
      { error: "Failed to update achievement" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await sql`DELETE FROM achievements WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return Response.json(
      { error: "Failed to delete achievement" },
      { status: 500 },
    );
  }
}
