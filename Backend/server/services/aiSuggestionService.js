/**
 * AI Suggestion Service
 * Rule-based analysis with architecture ready for external AI API integration.
 * Replace generateSuggestions body with API calls when integrating OpenAI etc.
 */

const { getMonthlyReport, getSpendingTrends } = require('./reportService');

const SUGGESTION_TYPES = {
  REDUCE_SPENDING: 'reduce_spending',
  IMPROVE_SAVINGS: 'improve_savings',
  BUDGET_PLANNING: 'budget_planning',
  CATEGORY_ALERT: 'category_alert',
};

const buildSuggestion = (type, title, message, priority = 'medium') => ({
  type,
  title,
  message,
  priority,
});

const generateSuggestions = async (userId) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const report = await getMonthlyReport(userId, year, month);
  const trends = await getSpendingTrends(userId, 3);
  const suggestions = [];

  if (report.totalExpense > report.totalIncome && report.totalIncome > 0) {
    suggestions.push(
      buildSuggestion(
        SUGGESTION_TYPES.REDUCE_SPENDING,
        'Spending exceeds income',
        `Your expenses (₹${report.totalExpense.toFixed(2)}) exceed income (₹${report.totalIncome.toFixed(2)}) this month. Review discretionary spending in top categories.`,
        'high'
      )
    );
  }

  if (report.totalSavings < 0) {
    suggestions.push(
      buildSuggestion(
        SUGGESTION_TYPES.IMPROVE_SAVINGS,
        'Negative savings detected',
        'You are spending more than you earn. Set a weekly spending cap and track daily expenses to regain control.',
        'high'
      )
    );
  } else if (report.totalIncome > 0 && report.totalSavings / report.totalIncome < 0.1) {
    suggestions.push(
      buildSuggestion(
        SUGGESTION_TYPES.IMPROVE_SAVINGS,
        'Low savings rate',
        'Your savings rate is below 10%. Consider allocating 20% of income to savings before spending.',
        'medium'
      )
    );
  }

  if (report.highestSpendingCategory) {
    const { category, amount, percentage } = report.highestSpendingCategory;
    if (percentage >= 40) {
      suggestions.push(
        buildSuggestion(
          SUGGESTION_TYPES.CATEGORY_ALERT,
          `High spending on ${category}`,
          `${category} accounts for ${percentage}% (₹${amount.toFixed(2)}) of your expenses. Look for ways to reduce costs in this category.`,
          'medium'
        )
      );
    }
  }

  if (report.expenseComparison.change > 15) {
    suggestions.push(
      buildSuggestion(
        SUGGESTION_TYPES.REDUCE_SPENDING,
        'Rising expenses',
        `Expenses increased ${report.expenseComparison.change}% compared to last month. Identify new or increased spending habits.`,
        'medium'
      )
    );
  }

  if (trends.length >= 2) {
    const recent = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    if (recent.expense > previous.expense * 1.2) {
      suggestions.push(
        buildSuggestion(
          SUGGESTION_TYPES.BUDGET_PLANNING,
          'Expense spike trend',
          'Expenses have risen sharply over recent months. Create category budgets to prevent overspending.',
          'medium'
        )
      );
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      buildSuggestion(
        SUGGESTION_TYPES.IMPROVE_SAVINGS,
        'Healthy financial habits',
        'Your spending patterns look balanced. Keep monitoring budgets and maintain consistent savings.',
        'low'
      )
    );
  }

  return {
    generatedAt: new Date(),
    month: { year, month },
    summary: {
      totalIncome: report.totalIncome,
      totalExpense: report.totalExpense,
      totalSavings: report.totalSavings,
    },
    suggestions,
  };
};

module.exports = {
  generateSuggestions,
  SUGGESTION_TYPES,
};
