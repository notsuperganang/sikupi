import { z } from 'zod'

// Zod schema definitions
const ZVisionFindings = z.object({
  moisture_visual: z.enum(["low","medium","high"]),
  particle_size: z.enum(["halus","sedang","kasar"]),
  contaminants: z.array(z.string()).default([]),
  mold_suspect: z.boolean()
})

const ZSuitability = z.object({
  briket: z.object({ score: z.number().int().min(0).max(100), why: z.string().max(120) }),
  pulp: z.object({ score: z.number().int().min(0).max(100), why: z.string().max(120) }),
  scrub: z.object({ score: z.number().int().min(0).max(100), why: z.string().max(120) }),
  pupuk: z.object({ score: z.number().int().min(0).max(100), why: z.string().max(120) }),
  pakan_ternak: z.object({ score: z.number().int().min(0).max(100), why: z.string().max(120) })
})

export const ZAmpasAnalysis = z.object({
  analysis_id: z.string(),
  input: z.object({
    jenis_kopi: z.enum(["arabika","robusta","mix","unknown"]),
    grind_level: z.enum(["halus","sedang","kasar","unknown"]),
    condition: z.enum(["basah","kering","unknown"])
  }),
  vision_findings: ZVisionFindings,
  price_estimate_idr: z.object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
    confidence: z.number().min(0).max(1),
    factors: z.array(z.string()).default([])
  }),
  suitability: ZSuitability,
  process_plan: z.array(z.string()).min(1).max(5),
  eco: z.object({
    sikupi_score: z.number().int().min(0).max(100),
    co2_saved_kg: z.number().nonnegative(),
    badges: z.array(z.string()).default([])
  }),
  ui_copy: z.object({
    title: z.string().max(80),
    tagline: z.string().max(80),
    cta: z.string().max(60)
  }),
  red_flags: z.array(z.string()).default([]),
  meta: z.object({
    model: z.string(),
    latency_ms: z.number().int().nonnegative(),
    image_quality_note: z.string().optional()
  })
})

export type AmpasAnalysis = z.infer<typeof ZAmpasAnalysis>
export type VisionFindings = z.infer<typeof ZVisionFindings>
export type Suitability = z.infer<typeof ZSuitability>

// JSON Schema for OpenAI structured outputs (strict mode)
export const AmpasAnalysisSchema = {
  name: "AmpasAnalysis",
  schema: {
    type: "object",
    properties: {
      analysis_id: { type: "string" },
      input: {
        type: "object",
        properties: {
          jenis_kopi: { type: "string", enum: ["arabika","robusta","mix","unknown"] },
          grind_level: { type: "string", enum: ["halus","sedang","kasar","unknown"] },
          condition: { type: "string", enum: ["basah","kering","unknown"] }
        },
        required: ["jenis_kopi", "grind_level", "condition"],
        additionalProperties: false
      },
      vision_findings: {
        type: "object",
        properties: {
          moisture_visual: { type: "string", enum: ["low","medium","high"] },
          particle_size: { type: "string", enum: ["halus","sedang","kasar"] },
          contaminants: { type: "array", items: { type: "string" } },
          mold_suspect: { type: "boolean" }
        },
        required: ["moisture_visual", "particle_size", "contaminants", "mold_suspect"],
        additionalProperties: false
      },
      price_estimate_idr: {
        type: "object",
        properties: {
          min: { type: "integer", minimum: 0 },
          max: { type: "integer", minimum: 0 },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          factors: { type: "array", items: { type: "string" } }
        },
        required: ["min", "max", "confidence", "factors"],
        additionalProperties: false
      },
      suitability: {
        type: "object",
        properties: {
          briket: {
            type: "object",
            properties: {
              score: { type: "integer", minimum: 0, maximum: 100 },
              why: { type: "string", maxLength: 120 }
            },
            required: ["score", "why"],
            additionalProperties: false
          },
          pulp: {
            type: "object",
            properties: {
              score: { type: "integer", minimum: 0, maximum: 100 },
              why: { type: "string", maxLength: 120 }
            },
            required: ["score", "why"],
            additionalProperties: false
          },
          scrub: {
            type: "object",
            properties: {
              score: { type: "integer", minimum: 0, maximum: 100 },
              why: { type: "string", maxLength: 120 }
            },
            required: ["score", "why"],
            additionalProperties: false
          },
          pupuk: {
            type: "object",
            properties: {
              score: { type: "integer", minimum: 0, maximum: 100 },
              why: { type: "string", maxLength: 120 }
            },
            required: ["score", "why"],
            additionalProperties: false
          },
          pakan_ternak: {
            type: "object",
            properties: {
              score: { type: "integer", minimum: 0, maximum: 100 },
              why: { type: "string", maxLength: 120 }
            },
            required: ["score", "why"],
            additionalProperties: false
          }
        },
        required: ["briket", "pulp", "scrub", "pupuk", "pakan_ternak"],
        additionalProperties: false
      },
      process_plan: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        maxItems: 5
      },
      eco: {
        type: "object",
        properties: {
          sikupi_score: { type: "integer", minimum: 0, maximum: 100 },
          co2_saved_kg: { type: "number", minimum: 0 },
          badges: { type: "array", items: { type: "string" } }
        },
        required: ["sikupi_score", "co2_saved_kg", "badges"],
        additionalProperties: false
      },
      ui_copy: {
        type: "object",
        properties: {
          title: { type: "string", maxLength: 80 },
          tagline: { type: "string", maxLength: 80 },
          cta: { type: "string", maxLength: 60 }
        },
        required: ["title", "tagline", "cta"],
        additionalProperties: false
      },
      red_flags: {
        type: "array",
        items: { type: "string" }
      },
      meta: {
        type: "object",
        properties: {
          model: { type: "string" },
          latency_ms: { type: "integer", minimum: 0 },
          image_quality_note: { type: "string" }
        },
        required: ["model", "latency_ms", "image_quality_note"],
        additionalProperties: false
      }
    },
    required: [
      "analysis_id", "input", "vision_findings", "price_estimate_idr", 
      "suitability", "process_plan", "eco", "ui_copy", "red_flags", "meta"
    ],
    additionalProperties: false
  },
  strict: true
} as const

// Chat schemas
export const ZChatMessage = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string()
})

export const ZChatRequest = z.object({
  messages: z.array(ZChatMessage),
  toolsEnabled: z.boolean().default(false)
})

export const ZChatResponse = z.object({
  reply: z.string(),
  usedTools: z.array(z.string()).optional(),
  meta: z.object({
    model: z.string(),
    latency_ms: z.number().int().nonnegative()
  })
})

export type ChatMessage = z.infer<typeof ZChatMessage>
export type ChatRequest = z.infer<typeof ZChatRequest>
export type ChatResponse = z.infer<typeof ZChatResponse>