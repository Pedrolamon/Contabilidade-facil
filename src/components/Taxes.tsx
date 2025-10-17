import { useEffect, useState } from 'react';
import api from '../api';

interface Tax {
  id: number;
  type: string;
  period: string;
  revenue: number;
  taxAmount: number;
  status: string;
  dueDate: string;
}

const Taxes = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [reminders, setReminders] = useState<Tax[]>([]);
  const [form, setForm] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });

  useEffect(() => {
    fetchTaxes();
    fetchReminders();
  }, []);

  const fetchTaxes = async () => {
    const res = await api.get('/taxes');
    setTaxes(res.data);
  };

  const fetchReminders = async () => {
    const res = await api.get('/taxes/reminders');
    setReminders(res.data);
  };

  const calculateDAS = async () => {
    await api.post('/taxes/calculate-das', form);
    fetchTaxes();
  };

  const calculateMEI = async () => {
    await api.post('/taxes/calculate-mei', { year: form.year });
    fetchTaxes();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Impostos e Obrigações Fiscais</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Calcular Impostos</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            placeholder="Ano"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
            className="border p-2"
          />
          <input
            type="number"
            placeholder="Mês"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
            className="border p-2"
            min="1"
            max="12"
          />
        </div>
        <div className="flex gap-4">
          <button onClick={calculateDAS} className="bg-blue-500 text-white p-2">Calcular DAS</button>
          <button onClick={calculateMEI} className="bg-green-500 text-white p-2">Calcular MEI</button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Lembretes de Vencimento</h3>
        {reminders.length > 0 ? (
          <ul>
            {reminders.map((reminder) => (
              <li key={reminder.id} className="border p-2 mb-2 bg-yellow-100">
                {reminder.type} - Período: {reminder.period} - Valor: R$ {reminder.taxAmount} - Vence em: {new Date(reminder.dueDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum lembrete pendente.</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Histórico de Impostos</h3>
        <ul>
          {taxes.map((tax) => (
            <li key={tax.id} className="border p-2 mb-2">
              {tax.type} - Período: {tax.period} - Receita: R$ {tax.revenue} - Imposto: R$ {tax.taxAmount} - Status: {tax.status} - Vencimento: {new Date(tax.dueDate).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Taxes;
