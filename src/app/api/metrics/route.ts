import { NextResponse } from "next/server";
import { prometheusMetrics } from "@/lib/metrics/prometheus";

export async function GET() {
  try {
    const metrics = prometheusMetrics.generatePrometheusFormat();
    
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate metrics" },
      { status: 500 }
    );
  }
} 