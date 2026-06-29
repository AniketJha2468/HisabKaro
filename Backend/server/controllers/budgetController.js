const Budget = require('../models/Budget');
const { syncBudgetUsage } = require('../services/reportService');

const getBudgetStatus = (budget) => {
  const usagePercent = budget.monthlyLimit > 0
    ? Math.round((budget.currentUsage / budget.monthlyLimit) * 100)
    : 0;

  let status = 'safe';
  if (usagePercent >= 100) status = 'exceeded';
  else if (usagePercent >= 80) status = 'warning';

  return {
    ...budget.toObject(),
    usagePercent,
    status,
    remaining: Math.max(0, budget.monthlyLimit - budget.currentUsage),
  };
};

const createBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit } = req.body;

    if (!category || !monthlyLimit) {
      return res.status(400).json({
        success: false,
        message: 'Category and monthly limit are required',
      });
    }

    const existing = await Budget.findOne({
      userId: req.user._id,
      category,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category',
      });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category,
      monthlyLimit: Number(monthlyLimit),
    });

    const now = new Date();
    await syncBudgetUsage(req.user._id, now.getFullYear(), now.getMonth() + 1);
    const updated = await Budget.findById(budget._id);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: getBudgetStatus(updated),
    });
  } catch (error) {
    next(error);
  }
};

const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    await syncBudgetUsage(req.user._id, now.getFullYear(), now.getMonth() + 1);

    const budgets = await Budget.find({ userId: req.user._id });
    const alerts = [];

    const data = budgets.map((budget) => {
      const status = getBudgetStatus(budget);
      if (status.status === 'warning') {
        alerts.push({
          type: 'warning',
          category: budget.category,
          message: `You have used ${status.usagePercent}% of your ${budget.category} budget`,
        });
      }
      if (status.status === 'exceeded') {
        alerts.push({
          type: 'exceeded',
          category: budget.category,
          message: `Budget exceeded for ${budget.category} by ₹${(budget.currentUsage - budget.monthlyLimit).toFixed(2)}`,
        });
      }
      return status;
    });

    res.json({
      success: true,
      count: data.length,
      alerts,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const { monthlyLimit } = req.body;
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (monthlyLimit !== undefined) {
      budget.monthlyLimit = Number(monthlyLimit);
    }

    await budget.save();

    const now = new Date();
    await syncBudgetUsage(req.user._id, now.getFullYear(), now.getMonth() + 1);
    const updated = await Budget.findById(budget._id);

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: getBudgetStatus(updated),
    });
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};
