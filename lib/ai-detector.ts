export interface AIAnalysis {
  score: number; // 0-100, higher = more likely AI
  burstiness: number;
  perplexity: number;
  hedgingRatio: number;
  sentenceLengthVariance: number;
  flags: string[];
}

export interface DetectAIOptions {
  threshold?: number; // Score above this = fail
}

const AI_INDICATORS = [
  'delve into',
  'leverage',
  "it's important to note",
  'furthermore',
  'moreover',
  'in conclusion',
  'to summarize',
];

const HEDGING_PHRASES = [
  'i think',
  'in my experience',
  'honestly',
  'perhaps',
  'might be',
  'could be',
  'seems to',
  'appears to',
];

export async function detectAI(
  content: string,
  options: DetectAIOptions = {}
): Promise<AIAnalysis> {
  const { threshold = 30 } = options;

  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/);

  // Calculate metrics
  const burstiness = calculateBurstiness(sentences);
  const perplexity = calculatePerplexity(content);
  const hedgingRatio = calculateHedgingRatio(content);
  const sentenceLengthVariance = calculateSentenceLengthVariance(sentences);
  const flags = detectFlags(content, sentences);

  // Calculate overall AI score (weighted)
  let score = 0;

  // Low burstiness = AI (AI uses uniform sentence lengths)
  if (burstiness < 0.3) score += 30;
  else if (burstiness < 0.5) score += 15;

  // Low perplexity variance = AI
  if (perplexity < 0.4) score += 25;
  else if (perplexity < 0.6) score += 10;

  // Low hedging = AI (AI states things with confidence)
  if (hedgingRatio < 0.02) score += 20;
  else if (hedgingRatio < 0.05) score += 10;

  // Flag-based scoring
  score += flags.length * 5;

  // Normalize to 0-100
  score = Math.min(100, score);

  return {
    score,
    burstiness,
    perplexity,
    hedgingRatio,
    sentenceLengthVariance,
    flags,
  };
}

function calculateBurstiness(sentences: string[]): number {
  if (sentences.length < 2) return 1;

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation
  const cv = mean > 0 ? stdDev / mean : 0;

  // Burstiness: high CV = bursty (human), low CV = uniform (AI)
  return Math.min(1, cv);
}

function calculatePerplexity(content: string): number {
  // Simplified perplexity: measure of word predictability
  const words = content.toLowerCase().split(/\s+/);
  if (words.length < 10) return 0.5;

  // Count unique bigrams
  const bigrams = new Set<string>();
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.add(`${words[i]} ${words[i + 1]}`);
  }

  // High bigram diversity = higher perplexity (human)
  const diversity = bigrams.size / (words.length - 1);
  return Math.min(1, diversity);
}

function calculateHedgingRatio(content: string): number {
  const lowerContent = content.toLowerCase();
  const words = content.split(/\s+/).length;

  let hedgeCount = 0;
  for (const phrase of HEDGING_PHRASES) {
    const regex = new RegExp(phrase, 'gi');
    const matches = lowerContent.match(regex);
    if (matches) {
      hedgeCount += matches.length;
    }
  }

  return hedgeCount / words;
}

function calculateSentenceLengthVariance(sentences: string[]): number {
  if (sentences.length < 2) return 0;

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;

  return Math.min(1, variance / 100); // Normalize
}

function detectFlags(content: string, sentences: string[]): string[] {
  const flags: string[] = [];
  const lowerContent = content.toLowerCase();

  // Check for AI indicator phrases
  for (const indicator of AI_INDICATORS) {
    if (lowerContent.includes(indicator.toLowerCase())) {
      flags.push(`AI phrase: "${indicator}"`);
    }
  }

  // Check for uniform paragraph structure
  const paragraphs = content.split(/\n\n+/);
  if (paragraphs.length >= 3) {
    const paraLengths = paragraphs.map(p => p.split(/\s+/).length);
    const variance = calculateSentenceLengthVariance(paragraphs.map(p => ({ length: p.split(/\s+/).length } as unknown as string)));
    if (variance < 0.2) {
      flags.push('Uniform paragraph structure');
    }
  }

  return flags;
}