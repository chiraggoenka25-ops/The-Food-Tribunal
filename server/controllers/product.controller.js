const supabase = require('../config/supabase');

const addProduct = async (req, res, next) => {
  try {
    const { name, brand, barcode, ingredients, nutrition } = req.body;

    if (!name || !barcode || !ingredients) {
      return res.status(400).json({ error: 'Name, barcode, and ingredients are required' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, brand, barcode, ingredients, nutrition: nutrition || {} }])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation for barcode
      if (error.code === '23505') {
         return res.status(409).json({ error: 'Product with this barcode already exists' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Product added successfully',
      product: data
    });
  } catch (error) {
    next(error);
  }
};

const getProductByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (productError && productError.code !== 'PGRST116') {
      return res.status(500).json({ error: productError.message });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  getProductByBarcode,
  getAllProducts
};
