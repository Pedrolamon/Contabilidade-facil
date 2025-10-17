import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Reports routes
app.get('/reports/revenue-expense', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    // Revenue from transactions and invoices
    const revenueTransactions = await prisma.transaction.aggregate({
      where: {
        type: 'income',
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const revenueInvoices = await prisma.invoice.aggregate({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: { total: true },
    });

    const totalRevenue = (revenueTransactions._sum.amount || 0) + (revenueInvoices._sum.total || 0);

    // Expenses from transactions
    const expenses = await prisma.transaction.aggregate({
      where: {
        type: 'expense',
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const totalExpenses = expenses._sum.amount || 0;

    // Revenue by source
    const revenueByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        type: 'income',
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    // Expenses by category
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        type: 'expense',
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    // Fetch category names
    const categoryIds = [...new Set([...revenueByCategory.map(r => r.categoryId), ...expensesByCategory.map(e => e.categoryId)].filter(id => id !== null))] as number[];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = categories.reduce((map, cat) => ({ ...map, [cat.id]: cat.name }), {});

    res.json({
      period: { start, end },
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      },
      revenueByCategory,
      expensesByCategory,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate revenue-expense report' });
  }
});

app.get('/reports/cash-flow', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    // Get all transactions in period
    const transactions = await prisma.transaction.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
      include: { account: true },
    });

    // Calculate running balance
    let runningBalance = 0;
    const cashFlow = transactions.map((transaction) => {
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      return {
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        balance: runningBalance,
        account: transaction.account.name,
      };
    });

    res.json({
      period: { start, end },
      cashFlow,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate cash flow report' });
  }
});

app.get('/reports/sales', async (req: Request, res: Response) => {
  try {
    const { start, end, groupBy } = req.query;
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    let salesData;

    if (groupBy === 'customer') {
      salesData = await prisma.invoice.groupBy({
        by: ['customerId'],
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _sum: { total: true },
        _count: { id: true },
       
      });
    } else if (groupBy === 'product') {
      salesData = await prisma.invoiceItem.groupBy({
        by: ['productId'],
        where: {
          invoice: {
            date: { gte: startDate, lte: endDate },
          },
        },
        _sum: { price: true, quantity: true },
      });
    } else {
      // Group by month
      const monthlySales = await prisma.$queryRaw`
        SELECT
          strftime('%Y-%m', date) as period,
          SUM(total) as total,
          COUNT(*) as count
        FROM Invoice
        WHERE date >= ${startDate} AND date <= ${endDate}
        GROUP BY strftime('%Y-%m', date)
        ORDER BY period
      `;
      salesData = monthlySales;
    }

    res.json({
      period: { start, end },
      groupBy,
      data: salesData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

app.get('/reports/expenses', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        type: 'expense',
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + (cat._sum.amount || 0), 0);

    res.json({
      period: { start, end },
      totalExpenses,
      expensesByCategory,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate expenses report' });
  }
});

// Cash Flow Projection
app.get('/reports/cash-flow-projection', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const daysAhead = parseInt(days as string);
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // Get all future transactions (projected and regular)
    const futureTransactions = await prisma.transaction.findMany({
      where: {
        date: { gte: today, lte: futureDate },
        OR: [
          { isProjected: true },
          { status: 'pending' }
        ]
      },
      orderBy: { date: 'asc' },
      include: { account: true },
    });

    // Calculate projected balance
    let projectedBalance = 0;
    const projection = futureTransactions.map((transaction) => {
      if (transaction.type === 'income') {
        projectedBalance += transaction.amount;
      } else {
        projectedBalance -= transaction.amount;
      }
      return {
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        projectedBalance,
        isProjected: transaction.isProjected,
        account: transaction.account.name,
      };
    });

    res.json({
      period: { start: today.toISOString(), end: futureDate.toISOString(), days: daysAhead },
      projection,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate cash flow projection' });
  }
});

export default app