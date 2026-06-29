import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { formatCurrency, downloadBlob, getCurrentMonthYear } from '../utils/helpers';
import { CategoryPieChart } from '../components/Charts';

const Reports = () => {
  const current = getCurrentMonthYear();
  const [month, setMonth] = useState(current.month);
  const [year, setYear] = useState(current.year);
  const [report, setReport] = useState(null);
  const [categoryReport, setCategoryReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [monthlyRes, categoryRes] = await Promise.all([
          api.reports.getMonthly({ month, year }),
          api.reports.getCategory({ month, year }),
        ]);
        setReport(monthlyRes.data);
        setCategoryReport(categoryRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [month, year]);

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      const blob = await api.reports.exportPDF({ month, year });
      downloadBlob(blob, `hisabkaro-report-${year}-${String(month).padStart(2, '0')}.pdf`);
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting('');
    }
  };

  const handleExportCSV = async () => {
    setExporting('csv');
    try {
      const blob = await api.reports.exportCSV({ month, year });
      downloadBlob(blob, `hisabkaro-transactions-${year}-${String(month).padStart(2, '0')}.csv`);
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting('');
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => current.year - i);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-500">Monthly financial analysis and exports</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('en', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={exporting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Monthly Income</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {formatCurrency(report?.totalIncome)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Monthly Expenses</p>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  {formatCurrency(report?.totalExpense)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Total Savings</p>
                <p
                  className={`mt-2 text-2xl font-bold ${
                    report?.totalSavings >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(report?.totalSavings)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Expense Change</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {report?.expenseComparison?.change > 0 ? '+' : ''}
                  {report?.expenseComparison?.change || 0}%
                </p>
                <p className="text-xs text-slate-500">vs previous month</p>
              </div>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 font-semibold text-slate-900">Category Spending</h2>
                <CategoryPieChart categories={categoryReport?.categories} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 font-semibold text-slate-900">Category Breakdown</h2>
                {categoryReport?.categories?.length > 0 ? (
                  <div className="space-y-3">
                    {categoryReport.categories.map((c) => (
                      <div key={c.category} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{c.category}</p>
                          <p className="text-sm text-slate-500">{c.percentage}% of expenses</p>
                        </div>
                        <p className="font-semibold text-slate-900">{formatCurrency(c.amount)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No expense data for this period</p>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 font-semibold text-slate-900">Income Details</h2>
                {report?.incomeTransactions?.length > 0 ? (
                  <div className="space-y-2">
                    {report.incomeTransactions.map((t) => (
                      <div key={t._id} className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {t.category} · {new Date(t.date).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No income this month</p>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 font-semibold text-slate-900">Expense Details</h2>
                {report?.expenseTransactions?.length > 0 ? (
                  <div className="space-y-2">
                    {report.expenseTransactions.map((t) => (
                      <div key={t._id} className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {t.category} · {new Date(t.date).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No expenses this month</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;
