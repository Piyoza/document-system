import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { verifyToken } from "./auth.js";
import { uploadDocument } from "./upload.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

async function extractInvoice(env, text) {
  const result = await env.AI.run(
    "@cf/meta/llama-3.1-8b-fast-v2",
    {
      messages: [
        {
          role: "system",
          content: `
You are an invoice extraction system.

Return ONLY valid JSON.

Example:

{
  "vendor_name":"ABC",
  "invoice_number":"INV001",
  "invoice_date":"2026-07-01",
  "amount":1000,
  "vat":150
}
`
        },
        {
          role: "user",
          content: text
        }
      ]
    }
  );

  console.log("========== AI RAW RESPONSE ==========");
  console.log(result.choices[0].message.content);
  console.log("=====================================");

  return JSON.parse(result.choices[0].message.content);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    /* =========================
       🔥 TEST AI ROUTE
    ========================== */
    if (url.pathname === "/test-ai") {
  try {
    const result = await env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct-fast",
      {
        messages: [
          {
            role: "user",
            content: "Say: Cloudflare AI is working"
          }
        ]
      }
    );

    return Response.json({
      success: true,
      result
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message || String(error)
    }, { status: 500 });
  }
}
    /* =========================
       REGISTER
    ========================== */
   /* =========================
   REGISTER
========================= */
if (request.method === "POST" && url.pathname === "/api/register") {
  const { name, email, password, role } = await request.json();

  // Validate required fields
  if (!name || !email || !password) {
    return jsonResponse(
      { message: "Name, email and password are required." },
      400
    );
  }

  // Check if email already exists
  const existingUser = await env.DB.prepare(`
    SELECT id
    FROM users
    WHERE email = ?
  `)
    .bind(email)
    .first();

  if (existingUser) {
    return jsonResponse(
      { message: "Email already registered." },
      409
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Default role to "user" if none provided
  const userRole = role || "user";

  // Insert user
  await env.DB.prepare(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `)
    .bind(name, email, hashedPassword, userRole)
    .run();

  return jsonResponse({
    success: true,
    message: "User registered successfully."
  });
}
    /* =========================
       LOGIN
    ========================== */
    if (request.method === "POST" && url.pathname === "/api/login") {
      const { email, password } = await request.json();

      const user = await env.DB.prepare(
        `SELECT * FROM users WHERE email = ?`
      )
        .bind(email)
        .first();

      if (!user) return jsonResponse({ message: "Invalid email or password" }, 401);

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) return jsonResponse({ message: "Invalid email or password" }, 401);

      const secret = new TextEncoder().encode(env.JWT_SECRET);

      const token = await new SignJWT({
        id: user.id,
        email: user.email,
        role: user.role
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(secret);

      return jsonResponse({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    /* =========================
       PROFILE
    ========================== */
    if (request.method === "GET" && url.pathname === "/api/profile") {
      const user = await verifyToken(request, env);
      if (!user) return jsonResponse({ message: "Unauthorized" }, 401);

      return jsonResponse({ message: "Protected route accessed", user });
    }

    /* =========================
       UPLOAD DOCUMENT
    ========================== */
  if (request.method === "POST" && url.pathname === "/api/upload") {
  return uploadDocument(request, env);
}

    /* =========================
       GET MY DOCUMENTS
    ========================== */
    if (request.method === "GET" && url.pathname === "/api/my-documents") {
      const user = await verifyToken(request, env);
      if (!user) return jsonResponse({ message: "Unauthorized" }, 401);

      const { results } = await env.DB.prepare(`
        SELECT id, vendor_name, invoice_number, invoice_date, amount, vat, status, file_url
        FROM documents
        WHERE uploaded_by = ?
        ORDER BY id DESC
      `)
        .bind(user.id)
        .all();

      return jsonResponse({ documents: results });
    }
    /* =========================
   MANAGER - GET PENDING DOCUMENTS
========================= */
if (request.method === "GET" && url.pathname === "/api/manager/pending") {

  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  if (user.role !== "manager" && user.role !== "admin") {
    return jsonResponse(
      { message: "Access denied. Manager only." },
      403
    );
  }

  const { results } = await env.DB.prepare(`
    SELECT
      id,
      vendor_name,
      invoice_number,
      invoice_date,
      amount,
      vat,
      status,
      uploaded_by
    FROM documents
    WHERE status = 'Pending'
    ORDER BY id DESC
  `).all();

  return jsonResponse({
    documents: results
  });
}
    /* =========================
   MANAGER APPROVAL
========================= */
if (
  request.method === "PUT" &&
  url.pathname.startsWith("/api/manager/approve/")
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  // Only managers or admins may approve
  if (user.role !== "manager" && user.role !== "admin") {
    return jsonResponse(
      { message: "Access denied. Manager only." },
      403
    );
  }

  const documentId = url.pathname.split("/")[4];

const result = await env.DB.prepare(`
  UPDATE documents
  SET
    manager_approved = 1,
    status = 'Manager Approved'
  WHERE id = ?
`)
.bind(documentId)
.run();

console.log("Update result:", result);

const updated = await env.DB.prepare(`
  SELECT id, status, manager_approved
  FROM documents
  WHERE id = ?
`)
.bind(documentId)
.first();

console.log("Updated row:", updated);

return jsonResponse({
  success: true,
  message: "Manager approved invoice.",
  updated
});
}
/* =========================
   FINANCE - GET PENDING DOCUMENTS
========================= */
if (
  request.method === "GET" &&
  url.pathname === "/api/finance/pending"
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  // Only finance/admin users
  if (user.role !== "finance" && user.role !== "admin") {
    return jsonResponse(
      { message: "Access denied. Finance only." },
      403
    );
  }

  const { results } = await env.DB.prepare(`
    SELECT
      id,
      vendor_name,
      invoice_number,
      invoice_date,
      amount,
      vat,
      status,
      manager_approved,
      finance_approved
    FROM documents
    WHERE manager_approved = 1
      AND finance_approved = 0
    ORDER BY id DESC
  `).all();

  return jsonResponse({
    documents: results
  });
}

/* =========================
   FINANCE APPROVAL
========================= */
if (
  request.method === "PUT" &&
  url.pathname.startsWith("/api/finance/approve/")
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  // Only finance or admin users
  if (user.role !== "finance" && user.role !== "admin") {
    return jsonResponse(
      { message: "Access denied. Finance only." },
      403
    );
  }

  const documentId = url.pathname.split("/")[4];

  await env.DB.prepare(`
    UPDATE documents
    SET
      finance_approved = 1,
      status = 'Approved',
      approved_at = ?
    WHERE id = ?
  `)
  .bind(
    new Date().toISOString(),
    documentId
  )
  .run();

  return jsonResponse({
    success: true,
    message: "Finance approved invoice."
  });
}
/* =========================
   DASHBOARD SUMMARY
========================= */
if (
  request.method === "GET" &&
  url.pathname === "/api/dashboard"
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  const total = await env.DB.prepare(`
    SELECT COUNT(*) AS total
    FROM documents
  `).first();

  const pending = await env.DB.prepare(`
    SELECT COUNT(*) AS pending
    FROM documents
    WHERE status='Pending'
  `).first();

  const approved = await env.DB.prepare(`
    SELECT COUNT(*) AS approved
    FROM documents
    WHERE status='Approved'
  `).first();

  const amount = await env.DB.prepare(`
    SELECT SUM(amount) AS totalAmount
    FROM documents
    WHERE status='Approved'
  `).first();

  return jsonResponse({
    totalDocuments: total.total,
    pending: pending.pending,
    approved: approved.approved,
    totalApprovedAmount: amount.totalAmount || 0
  });
}
/* =========================
   ANALYTICS DASHBOARD
========================= */
if (
  request.method === "GET" &&
  url.pathname === "/api/analytics"
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  // Summary
  const summary = await env.DB.prepare(`
    SELECT
      COUNT(*) AS totalDocuments,
      SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) AS approved,
      SUM(amount) AS totalAmount,
      SUM(vat) AS totalVAT
    FROM documents
  `).first();

  // Status chart
  const statusChart = await env.DB.prepare(`
    SELECT
      status,
      COUNT(*) AS total
    FROM documents
    GROUP BY status
  `).all();

  // Top vendors
  const vendors = await env.DB.prepare(`
    SELECT
      vendor_name,
      COUNT(*) AS invoices,
      SUM(amount) AS totalAmount
    FROM documents
    GROUP BY vendor_name
    ORDER BY totalAmount DESC
    LIMIT 5
  `).all();

  // Monthly totals
  const monthly = await env.DB.prepare(`
    SELECT
      substr(invoice_date,1,7) AS month,
      SUM(amount) AS totalAmount,
      SUM(vat) AS totalVAT
    FROM documents
    GROUP BY month
    ORDER BY month
  `).all();

  return jsonResponse({
    summary,
    statusChart: statusChart.results,
    vendors: vendors.results,
    monthly: monthly.results
  });
}
/* =========================
   FINANCE - GET MANAGER APPROVED
========================= */
if (
  request.method === "GET" &&
  url.pathname === "/api/finance/pending"
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  if (user.role !== "finance" && user.role !== "admin") {
    return jsonResponse(
      { message: "Access denied. Finance only." },
      403
    );
  }

  const { results } = await env.DB.prepare(`
    SELECT
      id,
      vendor_name,
      invoice_number,
      invoice_date,
      amount,
      vat,
      status
    FROM documents
    WHERE status = 'Manager Approved'
    ORDER BY id DESC
  `).all();

  return jsonResponse({
    documents: results
  });
}
/* =========================
   MANAGER REJECT
========================= */
if (
  request.method === "PUT" &&
  url.pathname.startsWith("/api/manager/reject/")
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  if (user.role !== "manager" && user.role !== "admin") {
    return jsonResponse(
      { message: "Access denied. Manager only." },
      403
    );
  }

  const documentId = url.pathname.split("/")[4];

  await env.DB.prepare(`
    UPDATE documents
    SET
      manager_approved = 0,
      status = 'Rejected'
    WHERE id = ?
  `)
  .bind(documentId)
  .run();

  return jsonResponse({
    success: true,
    message: "Manager rejected invoice."
  });
}
/* =========================
   FINANCE APPROVAL
========================= */
if (
  request.method === "PUT" &&
  url.pathname.startsWith("/api/finance/approve/")
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  if (user.role !== "finance" && user.role !== "admin") {
    return jsonResponse(
      { message: "Access denied. Finance only." },
      403
    );
  }

  const documentId = url.pathname.split("/")[4];

  await env.DB.prepare(`
    UPDATE documents
    SET
      finance_approved = 1,
      status = 'Approved',
      approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  .bind(documentId)
  .run();

  return jsonResponse({
    success: true,
    message: "Finance approved invoice."
  });
}
/* =========================
   FINANCE REJECT
========================= */
if (
  request.method === "PUT" &&
  url.pathname.startsWith("/api/finance/reject/")
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  if (user.role !== "finance" && user.role !== "admin") {
    return jsonResponse(
      { message: "Access denied. Finance only." },
      403
    );
  }

  const documentId = url.pathname.split("/")[4];

  await env.DB.prepare(`
    UPDATE documents
    SET
      finance_approved = 0,
      status = 'Rejected'
    WHERE id = ?
  `)
  .bind(documentId)
  .run();

  return jsonResponse({
    success: true,
    message: "Finance rejected invoice."
  });
}
/* =========================
   ADMIN - GET ALL USERS
========================= */
if (
  request.method === "GET" &&
  url.pathname === "/api/admin/users"
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  if (user.role !== "admin") {
    return jsonResponse(
      { message: "Access denied. Admin only." },
      403
    );
  }

  const { results } = await env.DB.prepare(`
    SELECT
      id,
      name,
      email,
      role
    FROM users
    ORDER BY id ASC
  `).all();

  return jsonResponse({
    users: results
  });
}
/* =========================
   EXPORT REPORT DATA
========================= */
if (
  request.method === "GET" &&
  url.pathname === "/api/reports"
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  // Only admin, manager, finance can export
  if (!["admin", "manager", "finance"].includes(user.role)) {
    return jsonResponse(
      { message: "Access denied" },
      403
    );
  }

  const { results } = await env.DB.prepare(`
    SELECT
      id,
      vendor_name,
      invoice_number,
      invoice_date,
      amount,
      vat,
      status,
      manager_approved,
      finance_approved
    FROM documents
    ORDER BY id DESC
  `).all();

  return jsonResponse({
    success: true,
    data: results
  });
}
   /* =========================
   UPDATE DOCUMENT STATUS
========================= */
if (
  request.method === "PUT" &&
  /^\/api\/documents\/\d+\/status$/.test(url.pathname)
) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse(
      { message: "Unauthorized" },
      401
    );
  }

  const id = url.pathname.split("/")[3];

  const body = await request.json();

  await env.DB.prepare(`
    UPDATE documents
    SET status = ?
    WHERE id = ?
  `)
    .bind(body.status, id)
    .run();

  return jsonResponse({
    message: "Status updated successfully",
  });
}
    /* =========================
       DEFAULT
    ========================== */
    return new Response("Worker is running", {
      headers: corsHeaders
    });

  }
};