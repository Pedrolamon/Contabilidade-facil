import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Basic routes
app.get('/', (req: Request, res: Response) => {
  res.send('Contabilidade Facil API');
});

// Accounts routes
app.get('/accounts', async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.account.findMany();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

app.post('/accounts', async (req: Request, res: Response) => {
  try {
    const { name, type, balance } = req.body;
    const account = await prisma.account.create({
      data: { name, type, balance: balance || 0 },
    });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

export default app
