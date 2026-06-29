const { Parser } = require('json2csv');

const generateTransactionsCSV = (transactions) => {
  const rows = transactions.map((t) => ({
    date: new Date(t.date).toISOString().split('T')[0],
    type: t.type,
    category: t.category,
    amount: t.amount,
    description: t.description || '',
  }));

  const parser = new Parser({
    fields: ['date', 'type', 'category', 'amount', 'description'],
  });

  return parser.parse(rows);
};

module.exports = { generateTransactionsCSV };
