import { PromptType, PromptAnalysis } from '@/types';

// Keywords and patterns for prompt classification
const CLASSIFICATION_RULES = {
  summarization: {
    keywords: ['summarize', 'summary', 'summarise', 'brief', 'overview', 'recap', 'condense', 'shorten'],
    patterns: [/summarize.*text/i, /provide.*summary/i, /give.*overview/i]
  },
  code_generation: {
    keywords: ['write code', 'generate code', 'create function', 'implement', 'program', 'script', 'algorithm', 'function', 'class', 'method'],
    patterns: [/write.*code/i, /generate.*function/i, /create.*script/i, /implement.*algorithm/i]
  },
  translation: {
    keywords: ['translate', 'translation', 'convert to', 'in french', 'in spanish', 'in german', 'in chinese', 'in japanese'],
    patterns: [/translate.*to/i, /convert.*language/i, /in \w+$/i]
  },
  question_answering: {
    keywords: ['what is', 'how to', 'why', 'when', 'where', 'who', 'which', 'explain', 'describe', 'tell me'],
    patterns: [/^what is/i, /^how to/i, /^why/i, /^when/i, /^where/i, /^who/i, /^which/i, /explain.*/i]
  },
  creative_writing: {
    keywords: ['write a story', 'create a poem', 'compose', 'imagine', 'creative', 'fiction', 'narrative', 'tale', 'poem', 'song'],
    patterns: [/write.*story/i, /create.*poem/i, /imagine.*/i, /creative.*/i]
  },
  analysis: {
    keywords: ['analyze', 'analysis', 'compare', 'contrast', 'evaluate', 'assess', 'examine', 'study', 'research', 'investigate'],
    patterns: [/analyze.*/i, /compare.*/i, /evaluate.*/i, /examine.*/i]
  }
};

// Tool usage indicators
const TOOL_INDICATORS = [
  'search', 'lookup', 'find', 'calculate', 'compute', 'fetch', 'retrieve', 'get data',
  'web search', 'current', 'latest', 'real-time', 'live', 'weather', 'stock', 'price'
];

// Function calling indicators
const FUNCTION_CALLING_INDICATORS = [
  'call function', 'execute', 'run', 'trigger', 'invoke', 'api', 'endpoint', 'webhook',
  'send email', 'create file', 'save', 'update', 'delete', 'insert'
];

export function classifyPrompt(prompt: string): PromptAnalysis {
  const lowerPrompt = prompt.toLowerCase();
  
  // Calculate token estimate (rough approximation: 1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil(prompt.length / 4);
  
  // Check for tool usage
  const requiresTools = TOOL_INDICATORS.some(indicator => 
    lowerPrompt.includes(indicator.toLowerCase())
  );
  
  // Check for function calling
  const requiresFunctionCalling = FUNCTION_CALLING_INDICATORS.some(indicator => 
    lowerPrompt.includes(indicator.toLowerCase())
  );
  
  // Score each prompt type
  const scores: Record<PromptType, number> = {
    summarization: 0,
    code_generation: 0,
    translation: 0,
    question_answering: 0,
    creative_writing: 0,
    analysis: 0,
    general: 0
  };
  
  // Apply keyword matching
  for (const [type, rules] of Object.entries(CLASSIFICATION_RULES)) {
    const promptType = type as PromptType;
    
    // Keyword matching
    const keywordMatches = rules.keywords.filter(keyword => 
      lowerPrompt.includes(keyword.toLowerCase())
    ).length;
    
    // Pattern matching
    const patternMatches = rules.patterns.filter(pattern => 
      pattern.test(prompt)
    ).length;
    
    scores[promptType] = keywordMatches * 2 + patternMatches * 3;
  }
  
  // Special case for question answering (very common)
  if (lowerPrompt.includes('?') && scores.question_answering === 0) {
    scores.question_answering = 1;
  }
  
  // Find the highest scoring type
  let bestType: PromptType = 'general';
  let bestScore = 0;
  
  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type as PromptType;
    }
  }
  
  // Calculate confidence based on score difference
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const confidence = totalScore > 0 ? bestScore / totalScore : 0.3;
  
  return {
    type: bestType,
    confidence: Math.min(confidence, 0.95), // Cap at 95%
    estimatedTokens,
    requiresTools,
    requiresFunctionCalling
  };
}

export function getPromptTypeDisplayName(type: PromptType): string {
  const displayNames: Record<PromptType, string> = {
    summarization: 'Summarization',
    code_generation: 'Code Generation',
    translation: 'Translation',
    question_answering: 'Question Answering',
    creative_writing: 'Creative Writing',
    analysis: 'Analysis',
    general: 'General'
  };
  
  return displayNames[type];
} 