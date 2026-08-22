import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    return res.status(500).json({ error: "Database connection is not configured" });
  }

  try {
    const sql = neon(connectionString);
    const rows = await sql`
      UPDATE public.site_views
      SET count = count + 1
      WHERE id = 1
      RETURNING count;
    `;

    return res.status(200).json({ views: Number(rows[0]?.count || 0) });
  } catch (error) {
    console.error("View counter error:", error);
    return res.status(500).json({ error: "Unable to update view count" });
  }
}
