import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());


// Dashboard summary
app.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const totalIncome = await prisma.transaction.aggregate({
      where: { type: 'income' },
      _sum: { amount: true },
    });
    const totalExpense = await prisma.transaction.aggregate({
      where: { type: 'expense' },
      _sum: { amount: true },
    });
    const accounts = await prisma.account.findMany();
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalSales = await prisma.invoice.aggregate({
      _sum: { total: true },
    });
    res.json({
      totalIncome: totalIncome._sum.amount || 0,
      totalExpense: totalExpense._sum.amount || 0,
      netProfit: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
      totalBalance,
      totalSales: totalSales._sum.total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default app