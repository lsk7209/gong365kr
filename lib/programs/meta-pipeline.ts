import { extractPdfLinks, fetchBizinfoDetailHtml, fetchPdfBuffer } from "@/lib/bizinfo/detail";
import { extractPdfText } from "@/lib/pdf/extract-text";
import { createEmbeddingText, createGeminiEmbedding, generateProgramMetaWithGemini } from "@/lib/ai/gemini";
import type { GeneratedProgramMeta } from "./meta-types";
import type { PendingMetaProgram, ProgramMetaExtractionInput } from "./repository";

export type MetaProcessStatus = "processed" | "skipped" | "failed";

export type MetaProcessResult = {
  programId: number;
  status: MetaProcessStatus;
  detailPdfUrl: string | null;
  extractedTextLength: number;
  reason: string | null;
};

export type MetaPipelineDeps = {
  fetchDetailHtml: (url: string) => Promise<string>;
  extractPdfLinks: (html: string, baseUrl: string) => string[];
  fetchPdfBuffer: (url: string) => Promise<Buffer>;
  extractPdfText: (buffer: Buffer) => Promise<{ text: string }>;
  structureProgramMeta: (input: {
    title: string;
    summaryShort: string | null;
    pdfText: string;
  }) => Promise<GeneratedProgramMeta>;
  createEmbedding: (text: string) => Promise<Buffer>;
  saveMetaExtraction: (input: ProgramMetaExtractionInput) => Promise<void>;
};

type ExtractedPdf = {
  detailPdfUrl: string;
  text: string;
};

export const defaultMetaPipelineDeps: Omit<MetaPipelineDeps, "saveMetaExtraction"> = {
  fetchDetailHtml: fetchBizinfoDetailHtml,
  extractPdfLinks,
  fetchPdfBuffer,
  extractPdfText,
  structureProgramMeta: generateProgramMetaWithGemini,
  createEmbedding: createGeminiEmbedding
};

export async function processProgramMetaBatch(
  programs: PendingMetaProgram[],
  deps: MetaPipelineDeps,
  now = new Date()
) {
  const results: MetaProcessResult[] = [];

  for (const program of programs) {
    results.push(await processProgramMeta(program, deps, now));
  }

  return summarizeMetaResults(results);
}

async function processProgramMeta(program: PendingMetaProgram, deps: MetaPipelineDeps, now: Date): Promise<MetaProcessResult> {
  try {
    const pdfUrls = await findPdfUrls(program, deps);

    if (pdfUrls.length === 0) {
      return createResult(program.id, "skipped", null, 0, "no_pdf_link");
    }

    const extracted = await extractFirstValidPdf(pdfUrls, deps);

    if (!extracted) {
      return createResult(program.id, "skipped", null, 0, "no_valid_pdf_text");
    }

    const generatedMeta = await deps.structureProgramMeta({
      title: program.title,
      summaryShort: program.summaryShort,
      pdfText: extracted.text
    });
    const similarityEmbedding = await deps.createEmbedding(
      createEmbeddingText({
        title: program.title,
        summaryShort: program.summaryShort,
        eligibilityStructured: generatedMeta.eligibilityStructured
      })
    );

    await deps.saveMetaExtraction({
      programId: program.id,
      detailPdfUrl: extracted.detailPdfUrl,
      eligibilityStructured: generatedMeta.eligibilityStructured,
      fitnessAxes: generatedMeta.fitnessAxes,
      similarityEmbedding,
      updatedAt: now
    });

    return createResult(program.id, "processed", extracted.detailPdfUrl, extracted.text.length, null);
  } catch (error) {
    return createResult(program.id, "failed", null, 0, error instanceof Error ? error.message : "unknown_error");
  }
}

async function findPdfUrls(program: PendingMetaProgram, deps: MetaPipelineDeps) {
  if (program.detailPdfUrl) {
    return [program.detailPdfUrl];
  }

  const detailHtml = await deps.fetchDetailHtml(program.rawUrl);

  return deps.extractPdfLinks(detailHtml, program.rawUrl);
}

async function extractFirstValidPdf(pdfUrls: string[], deps: MetaPipelineDeps): Promise<ExtractedPdf | null> {
  for (const detailPdfUrl of pdfUrls) {
    const extracted = await tryExtractPdf(detailPdfUrl, deps);

    if (extracted?.text.length) {
      return extracted;
    }
  }

  return null;
}

async function tryExtractPdf(detailPdfUrl: string, deps: MetaPipelineDeps): Promise<ExtractedPdf | null> {
  try {
    const pdfBuffer = await deps.fetchPdfBuffer(detailPdfUrl);
    const extracted = await deps.extractPdfText(pdfBuffer);
    const text = extracted.text.trim();

    return text ? { detailPdfUrl, text } : null;
  } catch {
    return null;
  }
}

function summarizeMetaResults(results: MetaProcessResult[]) {
  return {
    processed: results.filter((result) => result.status === "processed").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    failed: results.filter((result) => result.status === "failed").length,
    results
  };
}

function createResult(
  programId: number,
  status: MetaProcessStatus,
  detailPdfUrl: string | null,
  extractedTextLength: number,
  reason: string | null
): MetaProcessResult {
  return {
    programId,
    status,
    detailPdfUrl,
    extractedTextLength,
    reason
  };
}
