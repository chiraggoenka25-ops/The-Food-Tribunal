const express = require('express');
const { logScan } = require('../controllers/scan.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// It might be optional to log scan without auth, but applying authMiddleware to ensure user_id is mostly present
// However, I will use an optional auth middleware if scanning without logging in is allowed.
// For now, I'll restrict to authenticated users only.
router.post('/', authMiddleware, logScan);

module.exports = router;
