export async function extractInvoiceFromText(env, text) {
  const result = await env.AI.run(
    "@cf/meta/llama-3.1-8b-fast-v2",
    {
      messages: [
        {
          role: "system",
          content: `
You are an invoice extraction system.

Extract these fields and return ONLY valid JSON.

{
  "vendor_name": "",
  "invoice_number": "",
  "invoice_date": "",
  "amount": 0,
  "vat": 0
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

  const content = result.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`AI returned invalid JSON: ${content}`);
  }
}