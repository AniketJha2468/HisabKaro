import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import TransactionCard from '../components/TransactionCard';
import api from '../services/api';

const emptyForm = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ expense: [], income: [] });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchTransactions = async () => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const res = await api.transactions.getAll(params);
      setTransactions(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.transactions.getCategories();
        setCategories(catRes.data);
        await fetchTransactions();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) fetchTransactions();
  }, [filters.type, filters.category, filters.search]);

  const availableCategories = form.type === 'income' ? categories.income : categories.expense;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };
      if (editingId) {
        await api.transactions.update(editingId, payload);
      } else {
        await api.transactions.create(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await fetchTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.transactions.delete(id);
      await fetchTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
            <p className="text-slate-500">Manage your income and expenses</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(emptyForm);
            }}
            className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Add Transaction
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {[...categories.expense, ...categories.income].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 font-semibold text-slate-900">
              {editingId ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value, category: '' })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
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
                <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
        ) : transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">
            No transactions found. Add your first transaction to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <TransactionCard
                key={t._id}
                transaction={t}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Transactions;
