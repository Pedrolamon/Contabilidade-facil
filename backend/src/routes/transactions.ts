import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());


// Transactions routes
app.get('/transactions', async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { account: true, category: true, supplier: true },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/transactions', async (req: Request, res: Response) => {
  try {
    const { date, amount, description, type, accountId, categoryId, supplierId, receiptNote } = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        amount,
        description,
        type,
        accountId,
        categoryId,
        supplierId: supplierId || null,
        receiptNote,
      },
    });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

export default app
