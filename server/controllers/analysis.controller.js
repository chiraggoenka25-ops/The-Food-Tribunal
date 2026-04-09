const supabase = require('../config/supabase');
const { calculateVerdictFromAI } = require('../services/verdictEngine');
const { analyzeIngredientsWithAI } = require('../services/ingredientIntelligence.service');

// Run analysis directly without scanning (or called by scanning)
const analyzeProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // 1. Fetch the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 2. Check if analysis already exists (Caching bypasses AI)
    const { data: existingAnalysis } = await supabase
      .from('analysis')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (existingAnalysis) {
      return res.status(200).json({
        message: 'Analysis already exists',
        analysis: existingAnalysis
      });
    }

    // 3. Run AI Intelligence Engine
    const aiData = await analyzeIngredientsWithAI(product.ingredients, product.nutrition);

    // 4. Run Advanced Verdict Scoring
    const results = calculateVerdictFromAI(aiData);

    // 5. Save Analysis to DB
    const { data: analysis, error: analysisError } = await supabase
      .from('analysis')
      .insert([{
        product_id: productId,
        score: results.score,
        verdict: results.verdict,
        risks: results.risks,
        additives: results.additives,
        ingredient_analysis: results.ingredient_analysis,
        processing_level: results.processing_level,
        health_summary: results.health_summary
      }])
      .select()
      .single();

    if (analysisError) {
      return res.status(500).json({ error: analysisError.message });
    }

    res.status(201).json({
      message: 'Analysis generated successfully',
      analysis
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysisByProductId = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const { data: analysis, error } = await supabase
      .from('analysis')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found for this product' });
    }

    res.status(200).json({ analysis });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeProduct,
  getAnalysisByProductId
};
