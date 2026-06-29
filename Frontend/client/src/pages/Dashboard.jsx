import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { formatCurrency, getCurrentMonthYear } from '../utils/helpers';
import {
  IncomeExpenseChart,
  SpendingTrendChart,
  CategoryPieChart,
  SavingsChart,
} from '../components/Charts';

const StatCard = ({ label, value, subtext, color }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className={`mt-2 text-2xl font-bold ${color || 'text-slate-900'}`}>{value}</p>
    {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
  </div>
);

const Dashboard = () => {
  const { month, year } = getCurrentMonthYear();
  const [report, setReport] = useState(null);
  const [trends, setTrends] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, trendsRes, suggestionsRes] = await Promise.all([
          api.reports.getMonthly({ month, year }),
          api.reports.getTrends(6),
          api.reports.getSuggestions(),
        ]);
        setReport(reportRes.data);
        setTrends(trendsRes.data);
        setSuggestions(suggestionsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const changeText = report?.expenseComparison?.change
    ? `${report.expenseComparison.change > 0 ? '+' : ''}${report.expenseComparison.change}% vs last month`
    : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            Financial overview for {year}-{String(month).padStart(2, '0')}
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Income" value={formatCurrency(report?.totalIncome)} color="text-emerald-600" />
          <StatCard
            label="Total Expenses"
            value={formatCurrency(report?.totalExpense)}
            color="text-red-600"
            subtext={changeText}
          />
          <StatCard
            label="Total Savings"
            value={formatCurrency(report?.totalSavings)}
            color={report?.totalSavings >= 0 ? 'text-emerald-600' : 'text-red-600'}
          />
          <StatCard
            label="Top Category"
            value={report?.highestSpendingCategory?.category || '—'}
            subtext={
              report?.highestSpendingCategory
                ? formatCurrency(report.highestSpendingCategory.amount)
                : 'No expenses yet'
            }
          />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Income vs Expense</h2>
            <IncomeExpenseChart data={report} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Monthly Spending Trend</h2>
            <SpendingTrendChart trends={trends} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Category Distribution</h2>
            <CategoryPieChart categories={report?.categoryBreakdown} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Savings Overview</h2>
            <SavingsChart trends={trends} />
          </div>
        </div>

        {suggestions?.suggestions?.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-slate-900">AI Spending Suggestions</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestions.suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 ${
                    s.priority === 'high'
                      ? 'border-red-200 bg-red-50'
                      : s.priority === 'medium'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-emerald-200 bg-emerald-50'
                  }`}
                >
                  <p className="font-medium text-slate-900">{s.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{s.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
