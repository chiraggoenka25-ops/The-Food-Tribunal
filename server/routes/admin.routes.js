const express = require('express');
const { getAllAdminProducts, getAllAnalyses, getAuditLogs } = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply admin protection to all routes here
router.use(authMiddleware);
router.use(requireAdmin);

router.get('/products', getAllAdminProducts);
router.get('/analyses', getAllAnalyses);
router.get('/audit', getAuditLogs);

module.exports = router;
