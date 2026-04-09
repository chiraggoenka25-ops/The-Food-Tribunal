const express = require('express');
const { analyzeProduct, getAnalysisByProductId } = require('../controllers/analysis.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, analyzeProduct);
router.get('/:productId', getAnalysisByProductId);

module.exports = router;
