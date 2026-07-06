export async function extractTextFromDocument(env, file) {
  if (!env.OCR_SPACE_API_KEY) {
    throw new Error("OCR_SPACE_API_KEY is missing.");
  }

  const formData = new FormData();

  formData.append("apikey", env.OCR_SPACE_API_KEY);
formData.append("language", "eng");
formData.append("scale", "true");
formData.append("OCREngine", "2");
  formData.append("isOverlayRequired", "false");
  const buffer = await file.arrayBuffer();

const blob = new Blob([buffer], {
  type: file.type
});

formData.append("file", blob, file.name);

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData
  });

  const responseText = await response.text();

  console.log("========== OCR RAW RESPONSE ==========");
  console.log(responseText);
  console.log("======================================");

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error("OCR returned invalid JSON.");
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  if (data.IsErroredOnProcessing) {
    throw new Error(
      data.ErrorMessage?.join(", ") || "OCR processing failed."
    );
  }

  if (!data.ParsedResults || data.ParsedResults.length === 0) {
    throw new Error("No text found in document.");
  }

 const text = data.ParsedResults
  .map(result => result.ParsedText)
  .join("\n")
  .replace(/\r/g, "")
  .replace(/\t/g, " ")
  .replace(/\n{2,}/g, "\n")
  .trim();

console.log("Clean OCR Text:");
console.log(text);

return text;
}