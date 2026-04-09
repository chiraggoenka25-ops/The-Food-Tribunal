const supabase = require('../config/supabase');

const getAllAdminProducts = async (req, res, next) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
};

const getAllAnalyses = async (req, res, next) => {
  try {
    const { data: analyses, error } = await supabase
      .from('analysis')
      .select('*, products(name, brand, barcode)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ analyses });
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*, users!actor_user_id(name, email)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.status(200).json({ logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAdminProducts,
  getAllAnalyses,
  getAuditLogs
};
