import { useState } from 'react';
import api from '../api';

const Reports = () => {
  const [reportType, setReportType] = useState('revenue-expense');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('period');
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    try {
      let url = `/reports/${reportType}?start=${startDate}&end=${endDate}`;
      if (reportType === 'sales') {
        url += `&groupBy=${groupBy}`;
      }
      const res = await api.get(url);
      setReportData(res.data);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Relatórios Financeiros</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Configurar Relatório</h3>
        <div className="flex gap-4 mb-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border p-2"
          >
            <option value="revenue-expense">Receita vs Despesa</option>
            <option value="cash-flow">Fluxo de Caixa</option>
            <option value="cash-flow-projection">Projeção de Fluxo de Caixa</option>
            <option value="sales">Vendas</option>
            <option value="expenses">Despesas</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2"
          />
          {reportType === 'sales' && (
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="border p-2"
            >
              <option value="period">Por Período</option>
              <option value="customer">Por Cliente</option>
              <option value="product">Por Produto</option>
            </select>
          )}
          <button onClick={generateReport} className="bg-blue-500 text-white p-2">
            Gerar Relatório
          </button>
        </div>
      </div>

      {reportData && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Resultado do Relatório</h3>
          {reportType === 'revenue-expense' && (
            <div>
              <h4>Resumo</h4>
              <p>Receita Total: R$ {reportData.summary.totalRevenue}</p>
              <p>Despesas Totais: R$ {reportData.summary.totalExpenses}</p>
              <p>Lucro Líquido: R$ {reportData.summary.netProfit}</p>
            </div>
          )}
          {reportType === 'cash-flow' && (
            <div>
              <h4>Fluxo de Caixa</h4>
              <ul>
                {reportData.cashFlow.map((item: any, index: number) => (
                  <li key={index} className="border p-2 mb-2">
                    {item.date} - {item.description} - R$ {item.amount} - Saldo: R$ {item.balance}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reportType === 'cash-flow-projection' && (
            <div>
              <h4>Projeção de Fluxo de Caixa</h4>
              <p>Período: {reportData.period.start} até {reportData.period.end}</p>
              <ul>
                {reportData.projection.map((item: any, index: number) => (
                  <li key={index} className={`border p-2 mb-2 ${item.isProjected ? 'bg-blue-50' : ''}`}>
                    {new Date(item.date).toLocaleDateString()} - {item.description} - R$ {item.amount}
                    {item.isProjected && ' (Projetado)'} - Saldo Projetado: R$ {item.projectedBalance}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reportType === 'sales' && (
            <div>
              <h4>Vendas</h4>
              <ul>
                {reportData.data.map((item: any, index: number) => (
                  <li key={index} className="border p-2 mb-2">
                    {item.period || item.customer?.name || item.product?.name} - Total: R$ {item.total || item._sum?.total}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reportType === 'expenses' && (
            <div>
              <h4>Despesas por Categoria</h4>
              <p>Total: R$ {reportData.totalExpenses}</p>
              <ul>
                {reportData.expensesByCategory.map((item: any, index: number) => (
                  <li key={index} className="border p-2 mb-2">
                    Categoria {item.categoryId} - Total: R$ {item._sum.amount}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
