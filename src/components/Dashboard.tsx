import { useEffect, useState } from 'react';
import api from '../api';

interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  totalBalance: number;
  totalSales: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Receita Total</h3>
          <p className="text-2xl text-green-600">R$ {data.totalIncome}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Despesas Totais</h3>
          <p className="text-2xl text-red-600">R$ {data.totalExpense}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Lucro Líquido</h3>
          <p className="text-2xl text-blue-600">R$ {data.netProfit}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Saldo Total</h3>
          <p className="text-2xl text-purple-600">R$ {data.totalBalance}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Vendas Totais</h3>
          <p className="text-2xl text-indigo-600">R$ {data.totalSales}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
