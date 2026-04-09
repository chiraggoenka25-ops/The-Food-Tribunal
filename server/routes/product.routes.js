const express = require('express');
const { addProduct, getProductByBarcode, getAllProducts } = require('../controllers/product.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes or protected based on requirements, assuming adding requires auth but viewing is public
router.get('/', getAllProducts);
router.get('/:barcode', getProductByBarcode);

// Protected routes
router.post('/', authMiddleware, addProduct);

module.exports = router;
