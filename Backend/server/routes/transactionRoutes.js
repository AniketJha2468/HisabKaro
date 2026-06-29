const express = require('express');
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getCategories,
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/categories', getCategories);
router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
