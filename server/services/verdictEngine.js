/**
 * New Advanced VERDICT Engine
 * Takes input from the ingredientIntelligence.service.js (AI Output) array.
 * Output: { score, verdict, risks, additives, health_summary, processing_level, ingredient_analysis }
 */

const calculateVerdictFromAI = (aiAnalysis) => {
  let score = 100;
  
  // We will accumulate specific, human-readable risk flags for the UI
  let generatedRisks = [];

  // If AI failed, return fallback
  if (aiAnalysis.error) {
    return {
      score: 50,
      verdict: 'CAUTION',
      risks: aiAnalysis.health_risks,
      additives: aiAnalysis.additives_detected,
      health_summary: aiAnalysis.summary,
      processing_level: aiAnalysis.processing_level,
      ingredient_analysis: aiAnalysis
    };
  }

  // Deductions from AI classification
  if (aiAnalysis.sugar_level === "HIGH") {
    score -= 20;
    generatedRisks.push("High Sugar Content");
  } else if (aiAnalysis.sugar_level === "MEDIUM") {
    score -= 5;
  }

  if (aiAnalysis.additives_detected && aiAnalysis.additives_detected.length > 0) {
    score -= 15;
    generatedRisks.push("Contains Artificial Additives/Preservatives");
  }

  if (aiAnalysis.processing_level === "ULTRA_PROCESSED") {
    score -= 25;
    generatedRisks.push("Ultra-Processed Product");
  } else if (aiAnalysis.processing_level === "PROCESSED") {
    score -= 10;
  }

  if (aiAnalysis.trans_fat_present) {
    score -= 20;
    generatedRisks.push("Contains Trans Fats / Hydrogenated Oils");
  }

  // Refined oils check (can be found in ultra_processed_indicators or harmful_ingredients by AI)
  const allFlags = [...(aiAnalysis.harmful_ingredients || []), ...(aiAnalysis.ultra_processed_indicators || [])].join(" ").toLowerCase();
  if (allFlags.includes("refined oil") || allFlags.includes("seed oil") || allFlags.includes("canola") || allFlags.includes("soybean oil")) {
    score -= 10;
    if (!generatedRisks.includes("Contains Refined Oils")) {
      generatedRisks.push("Contains Refined Oils");
    }
  }

  // Additions
  if (aiAnalysis.processing_level === "WHOLE") {
    score += 10;
  }
  
  if (aiAnalysis.natural_ingredients && aiAnalysis.natural_ingredients.length > 3 && aiAnalysis.processing_level !== "ULTRA_PROCESSED") {
    score += 10;
  }

  // Ensure score stays clamped between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Verdict Logic
  let verdict = 'CLEAN';
  if (score < 50) {
    verdict = 'RISK';
    // Append a final strict warning if the AI flagged heavy risks
    if (aiAnalysis.health_risks && aiAnalysis.health_risks.length > 0) {
       if (!generatedRisks.includes("Potential Long-Term Health Risk")) {
          generatedRisks.push("Potential Long-Term Health Risk");
       }
    }
  } else if (score < 80) {
    verdict = 'CAUTION';
  }

  return {
    score,
    verdict,
    risks: Array.from(new Set([...generatedRisks, ...(aiAnalysis.health_risks || [])])), // Merge generated logic risks + AI specific risks
    additives: aiAnalysis.additives_detected || [],
    health_summary: aiAnalysis.summary || "No summary provided.",
    processing_level: aiAnalysis.processing_level || "UNKNOWN",
    ingredient_analysis: aiAnalysis
  };
};

module.exports = { calculateVerdictFromAI };
