import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Router - Intelligent Model Selection",
  description: "Intelligent LLM routing system that classifies prompts and routes them to the most optimal language model based on cost, latency, and quality metrics",
  keywords: ["LLM", "router", "AI", "language models", "prompt classification", "model selection"],
  authors: [{ name: "Headstarter" }],
  openGraph: {
    title: "LLM Router - Intelligent Model Selection",
    description: "Route your prompts to the optimal LLM based on cost, latency, and quality",
    type: "website",
    url: "https://llm-router.vercel.app",
    siteName: "LLM Router",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
