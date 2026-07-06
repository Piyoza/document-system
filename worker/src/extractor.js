export async function extractDocumentText(file) {
  const fileType = file.type;

  if (fileType.startsWith("image/")) {
    throw new Error(
      "Image OCR is not implemented yet. This will be added in the next step."
    );
  }

  if (fileType === "application/pdf") {
    throw new Error(
      "PDF text extraction is not implemented yet. This will be added in the next step."
    );
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}