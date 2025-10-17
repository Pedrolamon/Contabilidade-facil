import { useEffect, useState } from 'react';
import api from '../api';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  description: string;
  type: string;
  status: string;
  account: { name: string };
  category?: { name: string };
  supplier?: { name: string };
  receiptNote?: string;
}

interface Account {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

interface Supplier {
  id: number;
  name: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState({
    date: '',
    amount: 0,
    description: '',
    type: 'income',
    accountId: 0,
    categoryId: 0,
    supplierId: 0,
    receiptNote: '',
  });

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchTransactions = async () => {
    const res = await api.get('/transactions');
    setTransactions(res.data);
  };

  const fetchAccounts = async () => {
    const res = await api.get('/accounts');
    setAccounts(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
  };

  const fetchSuppliers = async () => {
    const res = await api.get('/suppliers');
    setSuppliers(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/transactions', form);
    setForm({
      date: '',
      amount: 0,
      description: '',
      type: 'income',
      accountId: 0,
      categoryId: 0,
      supplierId: 0,
      receiptNote: '',
    });
    fetchTransactions();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Transações</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <input
          type="number"
          placeholder="Valor"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
          className="border p-2 mr-2"
          required
        />
        <input
          type="text"
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>
        <select
          value={form.accountId}
          onChange={(e) => setForm({ ...form, accountId: parseInt(e.target.value) })}
          className="border p-2 mr-2"
          required
        >
          <option value={0}>Selecione Conta</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: parseInt(e.target.value) })}
          className="border p-2 mr-2"
        >
          <option value={0}>Selecione Categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {form.type === 'expense' && (
          <>
            <select
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: parseInt(e.target.value) })}
              className="border p-2 mr-2"
            >
              <option value={0}>Selecione Fornecedor</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nota do Recibo"
              value={form.receiptNote}
              onChange={(e) => setForm({ ...form, receiptNote: e.target.value })}
              className="border p-2 mr-2"
            />
          </>
        )}
        <button type="submit" className="bg-blue-500 text-white p-2">Adicionar</button>
      </form>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id} className="border p-2 mb-2">
            {transaction.date} - {transaction.description} - R$ {transaction.amount} - {transaction.type} - Conta: {transaction.account.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Transactions;
