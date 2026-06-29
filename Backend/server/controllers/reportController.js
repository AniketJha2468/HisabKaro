const {
  getMonthlyReport,
  getCategoryReport,
  getSpendingTrends,
  getMonthlyTransactions,
} = require('../services/reportService');
const { generateSuggestions } = require('../services/aiSuggestionService');
const { generateMonthlyPDF } = require('../utils/pdfGenerator');
const { generateTransactionsCSV } = require('../utils/csvGenerator');

const parseMonthYear = (req) => {
  const now = new Date();
  const year = Number(req.query.year) || now.getFullYear();
  const month = Number(req.query.month) || now.getMonth() + 1;
  return { year, month };
};

const getMonthlyReportHandler = async (req, res, next) => {
  try {
    const { year, month } = parseMonthYear(req);
    const report = await getMonthlyReport(req.user._id, year, month);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryReportHandler = async (req, res, next) => {
  try {
    const { year, month } = parseMonthYear(req);
    const report = await getCategoryReport(req.user._id, year, month);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

const getTrendsHandler = async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6;
    const trends = await getSpendingTrends(req.user._id, months);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

const getSuggestionsHandler = async (req, res, next) => {
  try {
    const suggestions = await generateSuggestions(req.user._id);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

const exportPDFHandler = async (req, res, next) => {
  try {
    const { year, month } = parseMonthYear(req);
    const report = await getMonthlyReport(req.user._id, year, month);
    const pdfBuffer = await generateMonthlyPDF(report, req.user.name);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=hisabkaro-report-${year}-${String(month).padStart(2, '0')}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const exportCSVHandler = async (req, res, next) => {
  try {
    const { year, month } = parseMonthYear(req);
    const transactions = await getMonthlyTransactions(req.user._id, year, month);
    const csv = generateTransactionsCSV(transactions);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=hisabkaro-transactions-${year}-${String(month).padStart(2, '0')}.csv`
    );
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyReportHandler,
  getCategoryReportHandler,
  getTrendsHandler,
  getSuggestionsHandler,
  exportPDFHandler,
  exportCSVHandler,
};
