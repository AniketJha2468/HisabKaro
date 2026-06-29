const express = require('express');
const {
  getMonthlyReportHandler,
  getCategoryReportHandler,
  getTrendsHandler,
  getSuggestionsHandler,
  exportPDFHandler,
  exportCSVHandler,
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/monthly', getMonthlyReportHandler);
router.get('/category', getCategoryReportHandler);
router.get('/trends', getTrendsHandler);
router.get('/suggestions', getSuggestionsHandler);
router.get('/export/pdf', exportPDFHandler);
router.get('/export/csv', exportCSVHandler);

module.exports = router;
