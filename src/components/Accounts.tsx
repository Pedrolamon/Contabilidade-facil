import { useEffect, useState } from 'react';
import api from '../api';

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({ name: '', type: 'checking', balance: 0 });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const res = await api.get('/accounts');
    setAccounts(res.data);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await api.post('/accounts', form);
    setForm({ name: '', type: 'checking', balance: 0 });
    fetchAccounts();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Contas</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Nome da Conta"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="checking">Corrente</option>
          <option value="savings">Poupança</option>
        </select>
        <input
          type="number"
          placeholder="Saldo Inicial"
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) })}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">Adicionar</button>
      </form>
      <ul>
        {accounts.map((account) => (
          <li key={account.id} className="border p-2 mb-2">
            {account.name} - {account.type} - Saldo: R$ {account.balance}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Accounts;
