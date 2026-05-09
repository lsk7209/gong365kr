import { z } from "zod";
import { generatedProgramMetaSchema, type GeneratedProgramMeta } from "@/lib/programs/meta-types";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_FLASH_MODEL = "gemini-2.0-flash";
const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-2";
const MAX_SOURCE_TEXT_LENGTH = 12000;

const geminiTextPartSchema = z.object({
  text: z.string()
});

const geminiGenerateResponseSchema = z.object({
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(geminiTextPartSchema)
      })
    })
  )
});

const geminiEmbeddingResponseSchema = z
  .object({
    embedding: z
      .object({
        values: z.array(z.number())
      })
      .optional(),
    embeddings: z
      .array(
        z.object({
          values: z.array(z.number())
        })
      )
      .optional()
  })
  .refine((value) => value.embedding?.values.length || value.embeddings?.[0]?.values.length, {
    message: "Gemini embedding response did not include values"
  });

export type ProgramMetaAiInput = {
  title: string;
  summaryShort: string | null;
  pdfText: string;
};

export async function generateProgramMetaWithGemini(input: ProgramMetaAiInput): Promise<GeneratedProgramMeta> {
  const apiKey = getGeminiApiKey();
  const model = process.env.GEMINI_MODEL_FLASH ?? DEFAULT_FLASH_MODEL;
  const prompt = createProgramMetaPrompt(input);
  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: programMetaResponseSchema
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini structured generation failed: ${response.status}`);
  }

  const parsedResponse = geminiGenerateResponseSchema.parse(await response.json());
  const text = parsedResponse.candidates[0]?.content.parts[0]?.text;

  if (!text) {
    throw new Error("Gemini structured generation returned empty text");
  }

  return generatedProgramMetaSchema.parse(JSON.parse(text));
}

export async function createGeminiEmbedding(text: string) {
  const apiKey = getGeminiApiKey();
  const model = process.env.GEMINI_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL;
  const response = await fetch(`${GEMINI_API_BASE}/${model}:embedContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: `models/${model}`,
      content: {
        parts: [{ text }]
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini embedding failed: ${response.status}`);
  }

  const parsedResponse = geminiEmbeddingResponseSchema.parse(await response.json());
  const values = parsedResponse.embedding?.values ?? parsedResponse.embeddings?.[0]?.values ?? [];
  const vector = new Float32Array(values);

  return Buffer.from(vector.buffer, vector.byteOffset, vector.byteLength);
}

export function createEmbeddingText(input: {
  title: string;
  summaryShort: string | null;
  eligibilityStructured: GeneratedProgramMeta["eligibilityStructured"];
}) {
  return [input.title, input.summaryShort, JSON.stringify(input.eligibilityStructured)].filter(Boolean).join("\n");
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required");
  }

  return apiKey;
}

function createProgramMetaPrompt(input: ProgramMetaAiInput) {
  const sourceText = input.pdfText.slice(0, MAX_SOURCE_TEXT_LENGTH);

  return `Extract structured eligibility and matching criteria from this Korean startup support notice.
Do not infer values that are not present in the source. Use null or empty arrays for missing values.
Summarize support amount, ratios, and limits as close to the source wording as possible.
Return only JSON matching the response schema.

Program title:
${input.title}

Short summary:
${input.summaryShort ?? "none"}

Notice text:
${sourceText}`;
}

const nullableStringSchema = {
  type: ["string", "null"]
};

const nullableIntegerSchema = {
  type: ["integer", "null"]
};

const stringArraySchema = {
  type: "array",
  items: { type: "string" }
};

const weightSchema = {
  type: "number",
  minimum: 0,
  maximum: 1
};

const programMetaResponseSchema = {
  type: "object",
  propertyOrdering: ["eligibilityStructured", "fitnessAxes"],
  properties: {
    eligibilityStructured: {
      type: "object",
      propertyOrdering: [
        "summary",
        "ageMax",
        "businessAgeMaxMonths",
        "regions",
        "industries",
        "gender",
        "targets",
        "requiredDocuments",
        "applicationMethod",
        "supportAmount",
        "cautions"
      ],
      properties: {
        summary: { type: "string" },
        ageMax: nullableIntegerSchema,
        businessAgeMaxMonths: nullableIntegerSchema,
        regions: stringArraySchema,
        industries: stringArraySchema,
        gender: {
          type: "string",
          enum: ["any", "female", "male"]
        },
        targets: stringArraySchema,
        requiredDocuments: stringArraySchema,
        applicationMethod: nullableStringSchema,
        supportAmount: nullableStringSchema,
        cautions: stringArraySchema
      },
      required: [
        "summary",
        "ageMax",
        "businessAgeMaxMonths",
        "regions",
        "industries",
        "gender",
        "targets",
        "requiredDocuments",
        "applicationMethod",
        "supportAmount",
        "cautions"
      ]
    },
    fitnessAxes: {
      type: "object",
      propertyOrdering: ["stage", "region", "industry", "age", "businessAge", "gender", "documents"],
      properties: {
        stage: weightSchema,
        region: weightSchema,
        industry: weightSchema,
        age: weightSchema,
        businessAge: weightSchema,
        gender: weightSchema,
        documents: weightSchema
      },
      required: ["stage", "region", "industry", "age", "businessAge", "gender", "documents"]
    }
  },
  required: ["eligibilityStructured", "fitnessAxes"]
};
