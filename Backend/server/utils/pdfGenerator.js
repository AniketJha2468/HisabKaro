const PDFDocument = require('pdfkit');

const generateMonthlyPDF = (report, userName) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).text('HisabKaro - Monthly Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`User: ${userName}`);
    doc.text(`Period: ${report.year}-${String(report.month).padStart(2, '0')}`);
    doc.moveDown();

    doc.fontSize(16).text('Financial Overview');
    doc.fontSize(12);
    doc.text(`Total Income: ₹${report.totalIncome.toFixed(2)}`);
    doc.text(`Total Expense: ₹${report.totalExpense.toFixed(2)}`);
    doc.text(`Total Savings: ₹${report.totalSavings.toFixed(2)}`);
    doc.moveDown();

    if (report.highestSpendingCategory) {
      doc.text(
        `Highest Spending Category: ${report.highestSpendingCategory.category} (₹${report.highestSpendingCategory.amount.toFixed(2)})`
      );
      doc.moveDown();
    }

    doc.fontSize(16).text('Income Details');
    doc.fontSize(12);
    if (report.incomeTransactions.length === 0) {
      doc.text('No income transactions this month.');
    } else {
      report.incomeTransactions.forEach((t) => {
        doc.text(
          `${new Date(t.date).toLocaleDateString()} | ${t.category} | ₹${t.amount.toFixed(2)} | ${t.description || '-'}`
        );
      });
    }
    doc.moveDown();

    doc.fontSize(16).text('Expense Details');
    doc.fontSize(12);
    if (report.expenseTransactions.length === 0) {
      doc.text('No expense transactions this month.');
    } else {
      report.expenseTransactions.forEach((t) => {
        doc.text(
          `${new Date(t.date).toLocaleDateString()} | ${t.category} | ₹${t.amount.toFixed(2)} | ${t.description || '-'}`
        );
      });
    }
    doc.moveDown();

    doc.fontSize(16).text('Category Breakdown');
    doc.fontSize(12);
    report.categoryBreakdown.forEach((c) => {
      doc.text(`${c.category}: ₹${c.amount.toFixed(2)} (${c.percentage}%)`);
    });

    doc.end();
  });
};

module.exports = { generateMonthlyPDF };
