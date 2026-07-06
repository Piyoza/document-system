export async function extractInvoiceFromText(env, text) {
  const result = await env.AI.run(
    "@cf/meta/llama-3.1-8b-fast-v2",
    {
      messages: [
        {
          role: "system",
          content: `
You are an expert invoice data extraction system.

Extract information from invoices accurately.

Return ONLY valid JSON.
Do not include explanations, markdown or extra text.

Rules:
- vendor_name = company issuing the invoice
- invoice_number = invoice reference or invoice number
- invoice_date = invoice date in YYYY-MM-DD format if possible
- amount = total invoice amount including VAT
- vat = VAT or Tax amount. If not present return 0.
- If a value cannot be found, return null instead of guessing.

Return this exact JSON format:

{
  "vendor_name": null,
  "invoice_number": null,
  "invoice_date": null,
  "amount": null,
  "vat": null
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

  const content = result.choices[0].message.content.trim();

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("AI Response:", content);
    throw new Error(`AI returned invalid JSON: ${content}`);
  }
}