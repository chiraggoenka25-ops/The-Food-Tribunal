const supabase = require('../config/supabase');
const { logAction } = require('../services/audit.service');

// User Role function
const applyForCertification = async (req, res, next) => {
  try {
    const { product_id, brand_name } = req.body;

    if (!product_id || !brand_name) {
      return res.status(400).json({ error: 'product_id and brand_name required' });
    }

    // 1. Check if product is already certified
    const { data: product } = await supabase
        .from('products')
        .select('verdict_certified')
        .eq('id', product_id)
        .single();
    
    if (product?.verdict_certified) {
        return res.status(400).json({ error: 'Product is already APPROVED and Certified.' });
    }

    // 2. Check if pending or active already exists
    const { data: existing } = await supabase
      .from('certifications')
      .select('status')
      .eq('product_id', product_id)
      .in('status', ['PENDING', 'ASSIGNED', 'INSPECTED'])
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'There is already an active certification workflow for this product.' });
    }

    const { data: cert, error } = await supabase
      .from('certifications')
      .insert([{ product_id, brand_name, status: 'PENDING' }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Certification application submitted', cert });
  } catch (error) {
    next(error);
  }
};

// Admin list all
const getCertifications = async (req, res, next) => {
  try {
    const { status, priority_only } = req.query;
    let query = supabase.from('certifications').select('*, products(name, barcode)');
    
    if (status) query = query.eq('status', status);
    if (priority_only === 'true') query = query.eq('status', 'PENDING'); // Unassigned queue
    
    const { data: certs, error } = await query.order('applied_at', { ascending: true }); // OLDEST FIRST for priority

    if (error) throw error;
    res.status(200).json({ certs });
  } catch (error) {
    next(error);
  }
};

// Admin assign inspector
const assignInspector = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inspector_id } = req.body;
    const admin_id = req.user.id;
    const admin_role = req.user.role;

    if (!inspector_id) return res.status(400).json({ error: 'inspector_id required' });

    const { data: cert, error } = await supabase
      .from('certifications')
      .update({ inspector_id, status: 'ASSIGNED' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      userId: admin_id, role: admin_role,
      actionType: 'CERT_ASSIGN', targetType: 'certification', targetId: id,
      metadata: { inspector_id }
    });

    res.status(200).json({ message: 'Inspector assigned', cert });
  } catch (error) {
    next(error);
  }
};

// Inspector submit review
const submitReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inspector_notes } = req.body;
    const inspector_id = req.user.id;
    const inspector_role = req.user.role;

    const { data: cert, error } = await supabase
      .from('certifications')
      .update({ inspector_notes, status: 'INSPECTED', reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('inspector_id', inspector_id) 
      .select().single();

    if (error || !cert) return res.status(403).json({ error: 'Denied: Not assigned to this case.' });

    await logAction({
      userId: inspector_id, role: inspector_role,
      actionType: 'CERT_REVIEW', targetType: 'certification', targetId: id,
      metadata: { notes_preview: inspector_notes.substring(0, 50) }
    });

    res.status(200).json({ message: 'Review submitted', cert });
  } catch (error) {
    next(error);
  }
};

// Admin final approval
const finalDecision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) return res.status(400).json({ error: 'Invalid action' });

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    let certificate_id = null;
    
    if (newStatus === 'APPROVED') {
       certificate_id = `VC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const { data: cert, error: certError } = await supabase
      .from('certifications')
      .update({ status: newStatus, admin_id: req.user.id, certificate_id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select().single();

    if (certError) throw certError;

    if (newStatus === 'APPROVED') {
       await supabase.from('products').update({ verdict_certified: true }).eq('id', cert.product_id);
    }

    await logAction({
      userId: req.user.id, role: req.user.role,
      actionType: `CERT_${action}`, targetType: 'certification', targetId: id,
      metadata: { certificate_id }
    });

    res.status(200).json({ message: `Certification ${newStatus.toLowerCase()}`, cert });
  } catch (error) {
    next(error);
  }
};

const getInspectors = async (req, res, next) => {
    try {
        const { data: inspectors, error } = await supabase.from('users').select('id, name, email').eq('role', 'INSPECTOR');
        if (error) throw error;
        res.status(200).json({ inspectors });
    } catch (error) {
        next(error);
    }
}

const getAssignedCertifications = async (req, res, next) => {
    try {
        const { data: certs, error } = await supabase.from('certifications').select('*, products(name, barcode)').eq('inspector_id', req.user.id).in('status', ['ASSIGNED', 'INSPECTED']).order('applied_at', { ascending: false });
        if (error) throw error;
        res.status(200).json({ certs });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  applyForCertification, getCertifications, assignInspector, submitReview, finalDecision, getInspectors, getAssignedCertifications
};
