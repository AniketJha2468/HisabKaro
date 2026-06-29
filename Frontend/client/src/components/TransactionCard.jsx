import { formatCurrency, formatDate } from '../utils/helpers';

const TransactionCard = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
            isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {isIncome ? '+' : '−'}
        </div>
        <div>
          <p className="font-medium text-slate-900">{transaction.category}</p>
          <p className="text-sm text-slate-500">
            {formatDate(transaction.date)}
            {transaction.description && ` · ${transaction.description}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
        </span>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(transaction._id)}
            className="rounded-lg px-2 py-1 text-sm text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionCard;
