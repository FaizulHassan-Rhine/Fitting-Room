const router = require('express').Router();
const searchRoutes  = require('./v1/searchRoutes');
const productRoutes = require('./v1/productRoutes');

router.use('/search',   searchRoutes);
router.use('/products', productRoutes);

module.exports = router;
