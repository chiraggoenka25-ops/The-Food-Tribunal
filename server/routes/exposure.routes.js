const express = require('express');
const {
  postReview, getReviews,
  postReport, getProductReportCount, getAdminReports, updateReportStatus,
  postDiscussion, getDiscussions, postReply,
  getTrending,
  publishTransparencyReport, getTransparencyReports, getTransparencyReportBySlug,
  updateModerationStatus
} = require('../controllers/exposure.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// --- PUBLIC (NO AUTH REQUIRED) ---
router.get('/reviews/:productId', getReviews);
router.get('/reports/count/:productId', getProductReportCount);
router.get('/discussions/:productId', getDiscussions);
router.get('/trending', getTrending);
router.get('/transparency', getTransparencyReports);
router.get('/transparency/:slug', getTransparencyReportBySlug);

// --- AUTH PROTECTED ROUTES ---
router.use(authMiddleware);

router.post('/reviews', postReview);
router.post('/reports', postReport);
router.post('/discussions', postDiscussion);
router.post('/discussions/:discussionId/replies', postReply);

// --- ADMIN PROTECTED ROUTES ---
router.post('/transparency', requireAdmin, publishTransparencyReport);
router.get('/admin/reports', requireAdmin, getAdminReports);
router.put('/admin/reports/:id/status', requireAdmin, updateReportStatus);
router.put('/admin/moderate/:type/:id', requireAdmin, updateModerationStatus);

module.exports = router;
