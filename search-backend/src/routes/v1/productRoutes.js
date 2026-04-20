const router = require('express').Router();
const productController = require('../../controllers/productController');

// GET /api/v1/products?brandName=YELLOW&minPrice=500&maxPrice=3000&page=1&limit=20
router.get('/', productController.listProducts);

// GET /api/v1/products/featured
router.get('/featured', productController.getFeatured);

// GET /api/v1/products/brands
router.get('/brands', productController.getBrands);

// GET /api/v1/products/:slug   (slug = last segment of product URL)
// e.g. GET /api/v1/products/w-ethnic-2-pcs-98
// Must be LAST to avoid shadowing the named routes above
router.get('/:slug', productController.getProduct);

module.exports = router;
