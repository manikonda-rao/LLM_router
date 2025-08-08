import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { modelRegistry } from "@/config/registry";

const logger = new Logger("API:Models");

export async function GET(request: NextRequest) {
  try {
    logger.info("GET /api/models - Request started");

    const url = new URL(request.url);
    const provider = url.searchParams.get("provider");
    const promptType = url.searchParams.get("promptType");

    let models = modelRegistry.getActiveModels();

    // Filter by provider if specified
    if (provider) {
      models = models.filter(m => m.provider.toLowerCase() === provider.toLowerCase());
      logger.debug("Filtered models by provider", { provider, count: models.length });
    }

    // Filter by prompt type if specified
    if (promptType) {
      models = models.filter(m => m.supportedPromptTypes.includes(promptType as 'summarization' | 'code_generation' | 'translation' | 'question_answering' | 'creative_writing' | 'analysis' | 'general'));
      logger.debug("Filtered models by prompt type", { promptType, count: models.length });
    }

    // Transform models to include additional metadata
    const modelsWithMetadata = models.map(model => ({
      ...model,
      metadata: {
        isAvailable: true, // TODO: Check availability from provider
        lastUpdated: new Date().toISOString(),
        usageStats: {
          totalRequests: 0, // TODO: Get from metrics
          averageLatency: model.averageLatency,
          successRate: 0.99, // TODO: Get from metrics
        },
      },
    }));

    logger.info("GET /api/models - Request completed successfully", {
      totalModels: modelsWithMetadata.length,
      filters: { provider, promptType },
    });

    return NextResponse.json({
      success: true,
      data: {
        models: modelsWithMetadata,
        total: modelsWithMetadata.length,
        filters: { provider, promptType },
      },
    });
  } catch (error) {
    logger.error("GET /api/models - Request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal Server Error" 
      },
      { status: 500 }
    );
  }
} 