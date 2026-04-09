const openai = require('../utils/openaiClient');

/**
 * Analyzes ingredients and nutrition data using OpenAI, returning structured JSON.
 * Falls back to a rule-based engine if AI is unavailable.
 */
const analyzeIngredientsWithAI = async (ingredients, nutrition) => {
  const systemPrompt = `
You are an elite, strict food scientist and health analyst for "The Food Tribunal".
Thoroughly analyze ingredients and nutrition.
Return ONLY valid JSON.
`;

  const userPrompt = `
Analyze:
INGREDIENTS: ${ingredients}
NUTRITION: ${JSON.stringify(nutrition)}
`;

  try {
    if (!process.env.OPENAI_API_KEY) {
      return runFallbackEngine(ingredients, nutrition);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 1000, // Faster responses
    });

    const aiOutput = response.choices[0].message.content;
    const data = JSON.parse(aiOutput);
    
    return { ...data, analysis_source: 'openai' };
  } catch (error) {
    console.error("AI Error, triggering fallback:", error);
    return runFallbackEngine(ingredients, nutrition);
  }
};

/**
 * DETERMINISTIC RULE-BASED ENGINE
 * Used as fallback for Authority consistency.
 */
const runFallbackEngine = (ingredients, nutrition) => {
    const ing = ingredients.toLowerCase();
    const harmful = [];
    const health_risks = [];
    const indicators = [];
    
    if (ing.includes('sugar') || ing.includes('syrup') || ing.includes('fructose')) {
        harmful.push('Added Sugars');
        health_risks.push('Metabolic stress from refined sweeteners');
    }
    if (ing.includes('hydrogenated') || ing.includes('margarine')) {
        harmful.push('Trans Fats');
        health_risks.push('High cardiovascular risk (Trans Fats detected)');
        indicators.push('Hydrogenated Oils');
    }
    if (ing.includes('artificial color') || ing.includes('red 40') || ing.includes('yellow 5')) {
        harmful.push('Artificial Colors');
        health_risks.push('Potential behavioral and hypersensitivity issues');
        indicators.push('Industrial Pigments');
    }
    
    const processing = (harmful.length > 2 || ing.includes('preservative')) ? 'ULTRA_PROCESSED' : 'PROCESSED';
    
    return {
        analysis_source: 'fallback_rule_engine',
        harmful_ingredients: harmful,
        additives_detected: harmful,
        natural_ingredients: [],
        ultra_processed_indicators: indicators,
        sugar_level: (nutrition?.sugar > 15) ? 'HIGH' : 'MEDIUM',
        trans_fat_present: ing.includes('hydrogenated'),
        processing_level: processing,
        health_risks: health_risks.length > 0 ? health_risks : ['Generic processed food risks'],
        summary: "Preliminary assessment generated using rule-based analysis while advanced intelligence is temporarily unavailable."
    };
};

module.exports = { analyzeIngredientsWithAI };
