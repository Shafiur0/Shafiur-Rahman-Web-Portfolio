import sql from "@/app/api/utils/sql";
import { createRouteHandlers } from "@/app/api/utils/react-router-method-adapter";

async function ensureMessagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function GET() {
  try {
    await ensureMessagesTable();
    const messages = await sql`
      SELECT * FROM contact_messages
      ORDER BY created_at DESC
    `;
    return Response.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await ensureMessagesTable();
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return Response.json(
        { error: "Name, email and message are required" },
        { status: 400 },
      );
    }

    const created = await sql`
      INSERT INTO contact_messages (name, email, message)
      VALUES (${name}, ${email}, ${message})
      RETURNING *
    `;

    return Response.json(created[0]);
  } catch (error) {
    console.error("Error creating message:", error);
    return Response.json({ error: "Failed to create message" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await ensureMessagesTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await sql`DELETE FROM contact_messages WHERE id = ${id}`;
      return Response.json({ success: true, deleted: "one" });
    }

    await sql`DELETE FROM contact_messages`;
    return Response.json({ success: true, deleted: "all" });
  } catch (error) {
    console.error("Error deleting messages:", error);
    return Response.json({ error: "Failed to delete messages" }, { status: 500 });
  }
}

const routeHandlers = createRouteHandlers({ GET, POST, DELETE });

export async function loader(args) {
  return routeHandlers.loader(args);
}

export async function action(args) {
  return routeHandlers.action(args);
}
