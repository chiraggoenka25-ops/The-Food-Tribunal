const express = require('express');
const { 
  applyForCertification, 
  getCertifications, 
  assignInspector, 
  submitReview, 
  finalDecision, 
  getInspectors, 
  getAssignedCertifications 
} = require('../controllers/certification.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin, requireInspector, requireUserOrAbove } = require('../middleware/roleMiddleware');

const router = express.Router();

// Required to log in at all
router.use(authMiddleware);

// Brands / Users
router.post('/apply', requireUserOrAbove, applyForCertification);

// Inspector Routes
router.get('/assigned', requireInspector, getAssignedCertifications);
router.put('/:id/review', requireInspector, submitReview);

// Admin Routes
router.get('/', requireAdmin, getCertifications);
router.get('/inspectors', requireAdmin, getInspectors);
router.put('/:id/assign', requireAdmin, assignInspector);
router.put('/:id/decision', requireAdmin, finalDecision);

module.exports = router;
