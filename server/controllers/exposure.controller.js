const supabase = require('../config/supabase');
const { logAction } = require('../services/audit.service');

// UTILITY: CHECK COOLDOWNS & CAPS
const checkLimits = async (userId, table, timeWindowMs, maxInWindow, dailyMax) => {
    const now = Date.now();
    const windowStart = new Date(now - timeWindowMs).toISOString();
    const dayStart = new Date(now - 24 * 60 * 60 * 1000).toISOString();

    // 1. Check strict window (cooldown)
    const { count: windowCount, error: windowError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gt('created_at', windowStart);
    
    if (windowError) throw windowError;
    if (windowCount >= maxInWindow) return { limited: true, type: 'COOLDOWN' };

    // 2. Check daily cap
    const { count: dailyCount, error: dailyError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gt('created_at', dayStart);

    if (dailyError) throw dailyError;
    if (dailyCount >= dailyMax) return { limited: true, type: 'DAILY_CAP' };

    return { limited: false };
};

// --- REVIEWS ---
const postReview = async (req, res, next) => {
  try {
    const { product_id, rating, title, comment } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating) return res.status(400).json({ error: 'product_id and rating required' });
    
    // Limits: 15m cooldown, 20/day
    const limit = await checkLimits(user_id, 'product_reviews', 15 * 60 * 1000, 1, 20);
    if (limit.limited) return res.status(429).json({ error: `Security Limit: ${limit.type} active. Status: 429` });

    // Duplicate content check
    const { data: existing } = await supabase
        .from('product_reviews')
        .select('comment')
        .eq('user_id', user_id)
        .eq('comment', comment)
        .single();
    if (existing) return res.status(400).json({ error: 'Duplicate review content detected.' });

    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert([{ 
        product_id, user_id, rating, 
        title: title?.substring(0, 100), 
        comment, moderation_status: 'VISIBLE' 
      }])
      .select().single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'You already reviewed this product' });
      throw error;
    }
    res.status(201).json({ message: 'Review posted', review });
  } catch (error) {
    next(error);
  }
};

// --- REPORTS ---
const postReport = async (req, res, next) => {
  try {
    const { product_id, report_type, description } = req.body;
    const user_id = req.user.id;

    if (!product_id || !report_type) return res.status(400).json({ error: 'product_id and report_type required' });

    // Limits: 30m cooldown, 10/day
    const limit = await checkLimits(user_id, 'product_reports', 30 * 60 * 1000, 1, 10);
    if (limit.limited) return res.status(429).json({ error: `Security Limit: ${limit.type} active. Status: 429` });

    // Duplicate check: Prevent same type unless previous resolved
    const { data: dupReport } = await supabase
        .from('product_reports')
        .select('status')
        .eq('user_id', user_id)
        .eq('product_id', product_id)
        .eq('report_type', report_type)
        .in('status', ['OPEN', 'UNDER_REVIEW'])
        .limit(1);
    
    if (dupReport && dupReport.length > 0) {
        return res.status(400).json({ error: 'You have an active report of this type already open.' });
    }

    const { data: report, error } = await supabase
      .from('product_reports')
      .insert([{ product_id, user_id, report_type, description: description?.substring(0, 1000) }])
      .select().single();

    if (error) throw error;
    res.status(201).json({ message: 'Report submitted', report });
  } catch (error) {
    next(error);
  }
};

// --- DISCUSSIONS & REPLIES ---
const postDiscussion = async (req, res, next) => {
  try {
    const { product_id, title, content } = req.body;
    const user_id = req.user.id;

    const limit = await checkLimits(user_id, 'product_discussions', 5 * 60 * 1000, 1, 50);
    if (limit.limited) return res.status(429).json({ error: `Security Limit: ${limit.type} active. Status: 429` });

    const { data: discussion, error } = await supabase
      .from('product_discussions')
      .insert([{ product_id, user_id, title, content, moderation_status: 'VISIBLE' }])
      .select().single();

    if (error) throw error;
    res.status(201).json({ message: 'Discussion started', discussion });
  } catch (error) {
    next(error);
  }
};

const postReply = async (req, res, next) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    const limit = await checkLimits(user_id, 'product_discussion_replies', 2 * 60 * 1000, 1, 50);
    if (limit.limited) return res.status(429).json({ error: `Security Limit: ${limit.type} active. Status: 429` });

    const { data: reply, error } = await supabase
      .from('product_discussion_replies')
      .insert([{ discussion_id: discussionId, user_id, content, moderation_status: 'VISIBLE' }])
      .select().single();

    if (error) throw error;
    res.status(201).json({ message: 'Reply posted', reply });
  } catch (error) {
    next(error);
  }
};

// Rest of the methods (getReviews, getTrending, etc.) remain standard...
// [Truncated for brevity in tool call, will preserve original logic in final file]
const getReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('*, users(name)')
      .eq('product_id', productId)
      .eq('moderation_status', 'VISIBLE')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / total).toFixed(1) : 0;
    res.status(200).json({ reviews, aggregate: { total, average: avg } });
  } catch (error) {
    next(error);
  }
};

const getProductReportCount = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { count, error } = await supabase.from('product_reports').select('*', { count: 'exact', head: true }).eq('product_id', productId);
    if (error) throw error;
    res.status(200).json({ count: count || 0 });
  } catch (error) {
    next(error);
  }
};

const getAdminReports = async (req, res, next) => {
  try {
    const { data: reports, error } = await supabase.from('product_reports').select('*, products(name, brand), users(name, email)').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};

const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, is_flagged } = req.body;
    const { data: report, error } = await supabase.from('product_reports').update({ status, is_flagged }).eq('id', id).select().single();
    if (error) throw error;
    await logAction({ userId: req.user.id, role: req.user.role, actionType: 'REPORT_MODERATE', targetType: 'report', targetId: id, metadata: { new_status: status, flagged: is_flagged } });
    res.status(200).json({ message: 'Status updated', report });
  } catch (error) {
    next(error);
  }
};

const getDiscussions = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { data: discussions, error } = await supabase.from('product_discussions').select('*, users(name)').eq('product_id', productId).eq('moderation_status', 'VISIBLE').order('created_at', { ascending: false });
    if (error) throw error;
    const discussionIds = discussions.map(d => d.id);
    let replies = [];
    if (discussionIds.length > 0) {
      const { data: rps, error: replyErr } = await supabase.from('product_discussion_replies').select('*, users(name)').in('discussion_id', discussionIds).eq('moderation_status', 'VISIBLE').order('created_at', { ascending: true });
      if (!replyErr) replies = rps;
    }
    const mapped = discussions.map(d => ({ ...d, replies: replies.filter(r => r.discussion_id === d.id) }));
    res.status(200).json({ discussions: mapped });
  } catch (error) {
    next(error);
  }
};

const getTrending = async (req, res, next) => {
  try {
     const { data: risky } = await supabase.from('analysis').select('*, products(name, brand, barcode)').eq('verdict', 'RISK').order('score', { ascending: true }).limit(5);
     const { data: clean } = await supabase.from('products').select('*').eq('verdict_certified', true).order('created_at', { ascending: false }).limit(5);
     res.status(200).json({ riskyProducts: risky || [], certifiedProducts: clean || [] });
  } catch (error) {
    next(error);
  }
};

const publishTransparencyReport = async (req, res, next) => {
  try {
    const { title, slug, summary, content } = req.body;
    const { data: report, error } = await supabase.from('transparency_reports').insert([{ title, slug, summary, content, created_by: req.user.id }]).select().single();
    if (error) throw error;
    res.status(201).json({ message: 'Report published', report });
  } catch (error) {
    next(error);
  }
};

const getTransparencyReports = async (req, res, next) => {
  try {
    const { data: reports, error } = await supabase.from('transparency_reports').select('id, title, slug, summary, published_at').order('published_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ reports });
  } catch (error) {
    next(error);
  }
};

const getTransparencyReportBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { data: report, error } = await supabase.from('transparency_reports').select('*, users(name)').eq('slug', slug).single();
    if (error || !report) return res.status(404).json({ error: 'Report not found' });
    res.status(200).json({ report });
  } catch (error) {
    next(error);
  }
};

const updateModerationStatus = async (req, res, next) => {
  try {
      const { type, id } = req.params;
      const { moderation_status } = req.body;
      let table = '';
      if (type === 'review') table = 'product_reviews';
      else if (type === 'discussion') table = 'product_discussions';
      else if (type === 'reply') table = 'product_discussion_replies';
      else return res.status(400).json({ error: 'Invalid moderation target' });
      const { data: resource, error } = await supabase.from(table).update({ moderation_status }).eq('id', id).select().single();
      if (error) throw error;
      await logAction({ userId: req.user.id, role: req.user.role, actionType: 'CONTENT_MODERATE', targetType: type, targetId: id, metadata: { moderation_status } });
      res.status(200).json({ message: 'Moderation status updated', resource });
  } catch (error) {
      next(error);
  }
};

module.exports = {
  postReview, getReviews,
  postReport, getProductReportCount, getAdminReports, updateReportStatus,
  postDiscussion, getDiscussions, postReply,
  getTrending,
  publishTransparencyReport, getTransparencyReports, getTransparencyReportBySlug,
  updateModerationStatus
};
