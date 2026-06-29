import { formatCurrency } from '../utils/helpers';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const statusColors = {
    safe: 'bg-emerald-500',
    warning: 'bg-amber-500',
    exceeded: 'bg-red-500',
  };

  const statusLabels = {
    safe: 'On track',
    warning: 'Approaching limit',
    exceeded: 'Exceeded',
  };

  const progressWidth = Math.min(budget.usagePercent, 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{budget.category}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatCurrency(budget.currentUsage)} of {formatCurrency(budget.monthlyLimit)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${statusColors[budget.status]}`}
        >
          {statusLabels[budget.status]}
        </span>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${statusColors[budget.status]}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>{budget.usagePercent}% used</span>
          <span>{formatCurrency(budget.remaining)} remaining</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Edit limit
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(budget._id)}
            className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
