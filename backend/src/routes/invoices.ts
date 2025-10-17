import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());



// Invoices routes
app.get('/invoices', async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { customer: true, items: { include: { product: true } } },
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.post('/invoices', async (req: Request, res: Response) => {
  try {
    const { customerId, type, items, dueDate } = req.body;
    let total = 0;
    const invoiceItems = items.map((item: any) => {
      const itemTotal = item.quantity * item.price;
      total += itemTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      };
    });
    const taxRate = type === 'NF-e' ? 0.1 : 0.05; // Simples Nacional example
    const tax = total * taxRate;
    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}`,
        date: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        customerId,
        total,
        tax,
        type,
        items: {
          create: invoiceItems,
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Overdue invoices
app.get('/overdue-invoices', async (req: Request, res: Response) => {
  try {
    const overdue = await prisma.invoice.findMany({
      where: {
        status: 'pending',
        dueDate: {
          lt: new Date(),
        },
      },
      include: { customer: true },
    });
    res.json(overdue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch overdue invoices' });
  }
});

export default app