const supabase = require('../config/supabase');
const { calculateVerdictFromAI } = require('../services/verdictEngine');
const { analyzeIngredientsWithAI } = require('../services/ingredientIntelligence.service');

const logScan = async (req, res, next) => {
  try {
    const { barcode } = req.body;
    const userId = req.user?.id; // from authMiddleware

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    if (productError || !product) {
      // DISCOVERY MODE: If product is not in database, create it using Simulation Intel
      // In a production app, we would fetch from a real UPC/GS1 API here.
      const { data: newProduct, error: createError } = await supabase
        .from('products')
        .insert([{
          name: `Unidentified Product (${barcode})`,
          brand: 'Generic / Discovery',
          barcode: barcode,
          ingredients: 'Simulated ingredients for analysis: Cane Sugar, Hydrogenated Soy Oil, Riboflavin, Artificial Flavoring, Enrichment powder.',
          nutrition: { calories: '250', sugar: '32g' }
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      product = newProduct;
    }

    // 2. Fetch or Generate Analysis
    let analysis;
    const { data: existingAnalysis } = await supabase
      .from('analysis')
      .select('*')
      .eq('product_id', product.id)
      .single();

    if (existingAnalysis) {
      analysis = existingAnalysis;
    } else {
      const aiData = await analyzeIngredientsWithAI(product.ingredients, product.nutrition);
      const results = calculateVerdictFromAI(aiData);
      const { data: newAnalysis, error: newAnalysisError } = await supabase
        .from('analysis')
        .insert([{
          product_id: product.id,
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
      
      if (newAnalysisError) throw newAnalysisError;
      analysis = newAnalysis;
    }

    // 3. Log into scan_history if user is logged in
    if (userId) {
      const { error: scanError } = await supabase
        .from('scan_history')
        .insert([{ user_id: userId, product_id: product.id }]);
        
      if (scanError) {
        console.error("Failed to log scan history:", scanError);
        // We can swallow this error because the analysis itself completed
      }
    }

    res.status(200).json({
      message: 'Product scanned successfully',
      product,
      analysis
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  logScan
};
