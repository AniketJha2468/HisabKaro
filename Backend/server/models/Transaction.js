const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Business',
  'Investment',
  'Freelance',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
module.exports.INCOME_CATEGORIES = INCOME_CATEGORIES;
