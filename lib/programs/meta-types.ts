import { z } from "zod";

export const genderEligibilitySchema = z.enum(["any", "female", "male"]);

export const eligibilityStructuredSchema = z.object({
  summary: z.string(),
  ageMax: z.number().int().nullable(),
  businessAgeMaxMonths: z.number().int().nullable(),
  regions: z.array(z.string()),
  industries: z.array(z.string()),
  gender: genderEligibilitySchema,
  targets: z.array(z.string()),
  requiredDocuments: z.array(z.string()),
  applicationMethod: z.string().nullable(),
  supportAmount: z.string().nullable(),
  cautions: z.array(z.string())
});

export const fitnessAxesSchema = z.object({
  stage: z.number().min(0).max(1),
  region: z.number().min(0).max(1),
  industry: z.number().min(0).max(1),
  age: z.number().min(0).max(1),
  businessAge: z.number().min(0).max(1),
  gender: z.number().min(0).max(1),
  documents: z.number().min(0).max(1)
});

export const generatedProgramMetaSchema = z.object({
  eligibilityStructured: eligibilityStructuredSchema,
  fitnessAxes: fitnessAxesSchema
});

export type EligibilityStructured = z.infer<typeof eligibilityStructuredSchema>;
export type FitnessAxes = z.infer<typeof fitnessAxesSchema>;
export type GeneratedProgramMeta = z.infer<typeof generatedProgramMetaSchema>;
