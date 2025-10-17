import dotenv from "dotenv";
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

//Routes
import auth from "./routes/auth"
import account  from './routes/accounts';
import categories from "./routes/categories"
import customers from "./routes/customers"
import dashboard from "./routes/dashboard"
import invoices from "./routes/invoices"
import products from "./routes/products"
import reports from "./routes/reports"
import suppliers  from "./routes/suppliers"
import taxes from "./routes/taxes"
import transaction from "./routes/transactions"

dotenv.config();

const PORT = process.env.PORT || 3001;

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", auth)
app.use("/api/account", account)
app.use("/api/categories", categories)
app.use("/api/customers", customers)
app.use("/api/dashboard ", dashboard )
app.use("/api/invoices", invoices)
app.use("/api/products", products)
app.use("/api/reports", reports)
app.use("/api/suppliers", suppliers)
app.use("/api/taxes", taxes)
app.use("/api/transaction", transaction)



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


