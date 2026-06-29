const Transaction = require('../models/Transaction');

const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const sumByType = (transactions, type) =>
  transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);

const getMonthlyTransactions = async (userId, year, month) => {
  const { start, end } = getMonthRange(year, month);
  return Transaction.find({
    userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });
};

const getMonthlyReport = async (userId, year, month) => {
  const transactions = await getMonthlyTransactions(userId, year, month);
  const totalIncome = sumByType(transactions, 'income');
  const totalExpense = sumByType(transactions, 'expense');
  const totalSavings = totalIncome - totalExpense;

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const categoryMap = {};
  expenseTransactions.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const highestSpendingCategory = categoryBreakdown[0] || null;

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevTransactions = await getMonthlyTransactions(userId, prevYear, prevMonth);
  const prevTotalExpense = sumByType(prevTransactions, 'expense');
  const expenseComparison = {
    current: totalExpense,
    previous: prevTotalExpense,
    change: prevTotalExpense > 0
      ? Math.round(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100)
      : totalExpense > 0 ? 100 : 0,
  };

  return {
    year,
    month,
    totalIncome,
    totalExpense,
    totalSavings,
    expenseComparison,
    highestSpendingCategory,
    categoryBreakdown,
    incomeTransactions: transactions.filter((t) => t.type === 'income'),
    expenseTransactions,
    transactionCount: transactions.length,
  };
};

const getCategoryReport = async (userId, year, month) => {
  const transactions = await getMonthlyTransactions(userId, year, month);
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = sumByType(expenseTransactions, 'expense');

  const categoryMap = {};
  expenseTransactions.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categories = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const highestCategory = categories[0] || null;

  return {
    year,
    month,
    totalExpense,
    categories,
    highestCategory,
  };
};

const getSpendingTrends = async (userId, months = 6) => {
  const trends = [];
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  for (let i = 0; i < months; i++) {
    const transactions = await getMonthlyTransactions(userId, year, month);
    const income = sumByType(transactions, 'income');
    const expense = sumByType(transactions, 'expense');
    const savings = income - expense;

    trends.unshift({
      year,
      month,
      label: `${year}-${String(month).padStart(2, '0')}`,
      income,
      expense,
      savings,
    });

    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
  }

  return trends;
};

const syncBudgetUsage = async (userId, year, month) => {
  const Budget = require('../models/Budget');
  const { start, end } = getMonthRange(year, month);

  const expenseByCategory = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        type: 'expense',
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const usageMap = {};
  expenseByCategory.forEach((item) => {
    usageMap[item._id] = item.total;
  });

  const budgets = await Budget.find({ userId });
  const updates = budgets.map((budget) => {
    budget.currentUsage = usageMap[budget.category] || 0;
    return budget.save();
  });

  await Promise.all(updates);
  return Budget.find({ userId });
};

module.exports = {
  getMonthRange,
  getMonthlyTransactions,
  getMonthlyReport,
  getCategoryReport,
  getSpendingTrends,
  syncBudgetUsage,
};
