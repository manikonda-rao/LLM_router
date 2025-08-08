import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { routePrompt } from "@/lib/router";
import { z } from "zod";

const logger = new Logger("API:Route");

// Request schema
const routeRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  preferences: z.object({
    costWeight: z.number().min(0).max(1).optional(),
    latencyWeight: z.number().min(0).max(1).optional(),
    qualityWeight: z.number().min(0).max(1).optional(),
    maxCostPer1kTokens: z.number().positive().optional(),
    maxLatency: z.number().positive().optional(),
    minQuality: z.number().min(0).max(1).optional(),
    preferredProviders: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    logger.info("POST /api/route - Request started");

    const body = await request.json();
    const validatedData = routeRequestSchema.parse(body);

    const { prompt, preferences } = validatedData;

    // Route the prompt - convert preferences to proper format
    const routingPreferences = preferences ? {
      costWeight: preferences.costWeight ?? 0.3,
      latencyWeight: preferences.latencyWeight ?? 0.3,
      qualityWeight: preferences.qualityWeight ?? 0.4,
      maxCostPer1kTokens: preferences.maxCostPer1kTokens,
      maxLatency: preferences.maxLatency,
      minQuality: preferences.minQuality,
      preferredProviders: preferences.preferredProviders,
    } : undefined;

    const result = await routePrompt(prompt, routingPreferences);

    logger.info("POST /api/route - Request completed successfully", {
      promptLength: prompt.length,
      selectedModel: result.selectedModel.id,
      score: result.score.score,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("POST /api/route - Request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid request data",
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal Server Error" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "LLM Router API - Use POST to route prompts",
    endpoints: {
      route: "/api/route",
      models: "/api/models",
      eval: "/api/eval",
      feedback: "/api/feedback",
    },
  });
} 