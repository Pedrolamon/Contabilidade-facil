import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());


// Taxes routes
app.get('/taxes', async (req: Request, res: Response) => {
  try {
    const taxes = await prisma.tax.findMany();
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch taxes' });
  }
});

app.post('/taxes/calculate-das', async (req: Request, res: Response) => {
  try {
    const { year, month } = req.body;
    const period = `${year}-${String(month).padStart(2, '0')}`;
    
    // Calculate monthly revenue from transactions and invoices
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    
    const revenueTransactions = await prisma.transaction.aggregate({
      where: {
        type: 'income',
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { amount: true },
    });
    
    const revenueInvoices = await prisma.invoice.aggregate({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { total: true },
    });
    
    const totalRevenue = (revenueTransactions._sum.amount || 0) + (revenueInvoices._sum.total || 0);
    
    // Simples Nacional calculation (simplified)
    let taxAmount = 0;
    if (totalRevenue <= 180000) { // Microempresa
      taxAmount = totalRevenue * 0.06; // 6% for services, simplified
    } else if (totalRevenue <= 360000) { // Pequena empresa
      taxAmount = totalRevenue * 0.112; // 11.2%
    } else if (totalRevenue <= 720000) {
      taxAmount = totalRevenue * 0.135; // 13.5%
    } else if (totalRevenue <= 1800000) {
      taxAmount = totalRevenue * 0.16; // 16%
    } else if (totalRevenue <= 3600000) {
      taxAmount = totalRevenue * 0.21; // 21%
    } else {
      taxAmount = totalRevenue * 0.33; // 33%
    }
    
    // Create or update DAS
    const existing = await prisma.tax.findFirst({
      where: { type: 'DAS', period },
    });
    
    if (existing) {
      const updated = await prisma.tax.update({
        where: { id: existing.id },
        data: { revenue: totalRevenue, taxAmount },
      });
      res.json(updated);
    } else {
      const tax = await prisma.tax.create({
        data: {
          type: 'DAS',
          period,
          revenue: totalRevenue,
          taxAmount,
          dueDate: new Date(year, month, 20), // 20th of the month
        },
      });
      res.json(tax);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate DAS' });
  }
});

app.post('/taxes/calculate-mei', async (req: Request, res: Response) => {
  try {
    const { year } = req.body;
    const period = year.toString();
    
    // Calculate annual revenue
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    
    const revenueTransactions = await prisma.transaction.aggregate({
      where: {
        type: 'income',
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { amount: true },
    });
    
    const revenueInvoices = await prisma.invoice.aggregate({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { total: true },
    });
    
    const totalRevenue = (revenueTransactions._sum.amount || 0) + (revenueInvoices._sum.total || 0);
    
    // MEI annual tax (simplified)
    const taxAmount = Math.min(totalRevenue * 0.06, 60 * 12); // 6% or max R$720/year
    
    // Create or update MEI
    const existing = await prisma.tax.findFirst({
      where: { type: 'MEI', period },
    });
    
    if (existing) {
      const updated = await prisma.tax.update({
        where: { id: existing.id },
        data: { revenue: totalRevenue, taxAmount },
      });
      res.json(updated);
    } else {
      const tax = await prisma.tax.create({
        data: {
          type: 'MEI',
          period,
          revenue: totalRevenue,
          taxAmount,
          dueDate: new Date(year + 1, 5, 30), // June 30th of next year
        },
      });
      res.json(tax);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate MEI' });
  }
});

app.get('/taxes/reminders', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reminders = await prisma.tax.findMany({
      where: {
        status: 'pending',
        dueDate: {
          gte: today,
          lte: nextWeek,
        },
      },
    });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tax reminders' });
  }
});

export default app