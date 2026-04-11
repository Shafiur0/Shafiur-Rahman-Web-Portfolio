import sql from "@/app/api/utils/sql";
import { createRouteHandlers } from "@/app/api/utils/react-router-method-adapter";

export async function GET() {
  try {
    const skills = await sql`
      SELECT * FROM skills 
      ORDER BY display_order ASC, created_at DESC
    `;
    return Response.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return Response.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, display_order = 0 } = body;

    if (!name || !category) {
      return Response.json(
        { error: "Name and category are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO skills (name, category, display_order)
      VALUES (${name}, ${category}, ${display_order})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating skill:", error);
    return Response.json({ error: "Failed to create skill" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, category, display_order } = body;

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount}`);
      values.push(category);
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
      `UPDATE skills SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    if (result.length === 0) {
      return Response.json({ error: "Skill not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating skill:", error);
    return Response.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await sql`DELETE FROM skills WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return Response.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}

const routeHandlers = createRouteHandlers({ GET, POST, PUT, DELETE });

export async function loader(args) {
  return routeHandlers.loader(args);
}

export async function action(args) {
  return routeHandlers.action(args);
}
