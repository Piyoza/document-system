import { verifyToken } from "./auth.js";
import { extractInvoiceFromText } from "./ai.js";
import { extractTextFromDocument } from "./ocr.js";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export async function uploadDocument(request, env) {
  const user = await verifyToken(request, env);

  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return jsonResponse({ message: "No file uploaded" }, 400);
  }

  // Convert file to Base64
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64File = btoa(binary);

  /*
   Temporary placeholder.
   In the next step we will replace this with
   real PDF/Image text extraction.
  */
console.log("========== FILE INFO ==========");
console.log("Name:", file.name);
console.log("Type:", file.type);
console.log("Size:", file.size);
console.log("===============================");
 const extractedText = await extractTextFromDocument(env, file);

console.log("========== OCR TEXT ==========");
console.log(extractedText);
console.log("==============================");

  let invoice;

  try {
    invoice = await extractInvoiceFromText(env, extractedText);
    /*
========================================
CHECK FOR DUPLICATE INVOICE
========================================
*/

const duplicate = await env.DB.prepare(`
SELECT id
FROM documents
WHERE invoice_number = ?
AND vendor_name = ?
LIMIT 1
`)
.bind(
  invoice.invoice_number,
  invoice.vendor_name
)
.first();

if (duplicate) {
  return jsonResponse({
    success: false,
    duplicate: true,
    message: "Duplicate invoice detected."
  }, 409);
}
  } catch (err) {
    console.error(err);

    invoice = {
      vendor_name: "Unknown",
      invoice_number: "Unknown",
      invoice_date: new Date().toISOString(),
      amount: 0,
      vat: 0
    };
  }
  

  await env.DB.prepare(`
    
    INSERT INTO documents (
      vendor_name,
      invoice_number,
      invoice_date,
      amount,
      vat,
      status,
      file_url,
      file_data,
      uploaded_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  .bind(
  invoice.vendor_name || "Unknown Vendor",
  invoice.invoice_number || "N/A",
  invoice.invoice_date || null,
  Number(invoice.amount) || 0,
  Number(invoice.vat) || 0,
    "Pending",
    file.name,
    base64File,
    user.id
  )
  .run();

  return jsonResponse({
    success: true,
    invoice
  });
}