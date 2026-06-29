const Transaction = require('../models/Transaction');
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../models/Transaction');
const { syncBudgetUsage } = require('../services/reportService');

const validateCategory = (type, category) => {
  const allowed = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return allowed.includes(category);
};

const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Type, amount, category, and date are required',
      });
    }

    if (!validateCategory(type, category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category for ${type}`,
      });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type,
      amount: Number(amount),
      category,
      description,
      date: new Date(date),
    });

    const txDate = new Date(date);
    await syncBudgetUsage(req.user._id, txDate.getFullYear(), txDate.getMonth() + 1);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const { type, category, search, startDate, endDate, month, year } = req.query;
    const filter = { userId: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (month && year) {
      const y = Number(year);
      const m = Number(month);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (category) {
      const txType = type || transaction.type;
      if (!validateCategory(txType, category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category for ${txType}`,
        });
      }
      transaction.category = category;
    }
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);

    await transaction.save();

    const txDate = transaction.date;
    await syncBudgetUsage(req.user._id, txDate.getFullYear(), txDate.getMonth() + 1);

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const txDate = transaction.date;
    await syncBudgetUsage(req.user._id, txDate.getFullYear(), txDate.getMonth() + 1);

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res) => {
  res.json({
    success: true,
    data: {
      expense: EXPENSE_CATEGORIES,
      income: INCOME_CATEGORIES,
    },
  });
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getCategories,
};
