import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const projects = await sql`
      SELECT * FROM projects 
      ORDER BY featured DESC, display_order ASC, created_at DESC
    `;
    return Response.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return Response.json(
      { error: "Failed to fetch projects" },
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
      image_url,
      project_url,
      github_url,
      technologies = [],
      featured = false,
      display_order = 0,
    } = body;

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO projects (title, description, image_url, project_url, github_url, technologies, featured, display_order)
      VALUES (${title}, ${description}, ${image_url}, ${project_url}, ${github_url}, ${technologies}, ${featured}, ${display_order})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating project:", error);
    return Response.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      image_url,
      project_url,
      github_url,
      technologies,
      featured,
      display_order,
    } = body;

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
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount}`);
      values.push(image_url);
      paramCount++;
    }
    if (project_url !== undefined) {
      updates.push(`project_url = $${paramCount}`);
      values.push(project_url);
      paramCount++;
    }
    if (github_url !== undefined) {
      updates.push(`github_url = $${paramCount}`);
      values.push(github_url);
      paramCount++;
    }
    if (technologies !== undefined) {
      updates.push(`technologies = $${paramCount}`);
      values.push(technologies);
      paramCount++;
    }
    if (featured !== undefined) {
      updates.push(`featured = $${paramCount}`);
      values.push(featured);
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
      `UPDATE projects SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    if (result.length === 0) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating project:", error);
    return Response.json(
      { error: "Failed to update project" },
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

    await sql`DELETE FROM projects WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return Response.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
