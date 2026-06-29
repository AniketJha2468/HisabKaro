import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import BudgetCard from '../components/BudgetCard';
import api from '../services/api';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: '', monthlyLimit: '' });
  const [editingId, setEditingId] = useState(null);
  const [editLimit, setEditLimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchBudgets = async () => {
    try {
      const res = await api.budget.getAll();
      setBudgets(res.data);
      setAlerts(res.alerts || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.transactions.getCategories();
        setCategories(catRes.data.expense);
        await fetchBudgets();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const usedCategories = budgets.map((b) => b.category);
  const availableCategories = categories.filter((c) => !usedCategories.includes(c));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.budget.create({
        category: form.category,
        monthlyLimit: Number(form.monthlyLimit),
      });
      setForm({ category: '', monthlyLimit: '' });
      setShowForm(false);
      await fetchBudgets();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.budget.update(editingId, { monthlyLimit: Number(editLimit) });
      setEditingId(null);
      setEditLimit('');
      await fetchBudgets();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this budget?')) return;
    try {
      await api.budget.delete(id);
      await fetchBudgets();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Budget Management</h1>
            <p className="text-slate-500">Set limits and monitor your spending</p>
          </div>
          {availableCategories.length > 0 && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Add Budget
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`rounded-lg px-4 py-3 text-sm ${
                  alert.type === 'exceeded'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {alert.message}
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 font-semibold text-slate-900">New Category Budget</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="">Select category</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Monthly Limit (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.monthlyLimit}
                  onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Save Budget
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {editingId && (
          <form onSubmit={handleUpdate} className="mb-6 rounded-xl border border-primary-200 bg-primary-50 p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Update Monthly Limit</h2>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">New Limit (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => { setEditingId(null); setEditLimit(''); }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">
            No budgets set. Create category budgets to track your spending limits.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget._id}
                budget={budget}
                onEdit={(b) => {
                  setEditingId(b._id);
                  setEditLimit(b.monthlyLimit);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Budget;
