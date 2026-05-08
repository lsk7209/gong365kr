export type PdfTextResult = {
  text: string;
  pages: number;
  info: unknown;
};

export async function extractPdfText(buffer: Buffer): Promise<PdfTextResult> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const parsed = await parser.getText();

    return {
      text: normalizeExtractedText(parsed.text),
      pages: parsed.total,
      info: null
    };
  } finally {
    await parser.destroy();
  }
}

function normalizeExtractedText(text: string) {
  return text.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
