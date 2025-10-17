import { useEffect, useState } from 'react';
import api from '../api';

interface Customer {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Invoice {
  id: number;
  number: string;
  date: string;
  total: number;
  tax: number;
  status: string;
  type: string;
  customer: Customer;
  items: { product: Product; quantity: number; price: number }[];
}

interface InvoiceItem {
  productId: number;
  quantity: number;
  price: number;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    customerId: 0,
    type: 'NF-e',
    dueDate: '',
    items: [] as InvoiceItem[],
  });
  const [itemForm, setItemForm] = useState({ productId: 0, quantity: 1 });

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    const res = await api.get('/invoices');
    setInvoices(res.data);
  };

  const fetchCustomers = async () => {
    const res = await api.get('/customers');
    setCustomers(res.data);
  };

  const fetchProducts = async () => {
    const res = await api.get('/products');
    setProducts(res.data);
  };

  const addItem = () => {
    const product = products.find(p => p.id === itemForm.productId);
    if (product) {
      setForm({
        ...form,
        items: [...form.items, { ...itemForm, price: product.price }],
      });
      setItemForm({ productId: 0, quantity: 1 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/invoices', form);
    setForm({
      customerId: 0,
      type: 'NF-e',
      dueDate: '',
      items: [],
    });
    fetchInvoices();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Notas Fiscais</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <select
          value={form.customerId}
          onChange={(e) => setForm({ ...form, customerId: parseInt(e.target.value) })}
          className="border p-2 mr-2"
          required
        >
          <option value={0}>Selecione Cliente</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="NF-e">NF-e (Produtos)</option>
          <option value="NFS-e">NFS-e (Serviços)</option>
        </select>
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          className="border p-2 mr-2"
        />
        <div className="mb-2">
          <h3>Adicionar Item</h3>
          <select
            value={itemForm.productId}
            onChange={(e) => setItemForm({ ...itemForm, productId: parseInt(e.target.value) })}
            className="border p-2 mr-2"
          >
            <option value={0}>Selecione Produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - R$ {p.price}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantidade"
            value={itemForm.quantity}
            onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) })}
            className="border p-2 mr-2"
            min="1"
          />
          <button type="button" onClick={addItem} className="bg-green-500 text-white p-2">
            Adicionar Item
          </button>
        </div>
        <ul>
          {form.items.map((item, index) => (
            <li key={index}>
              Produto {item.productId} - Qtd: {item.quantity} - R$ {item.price * item.quantity}
            </li>
          ))}
        </ul>
        <button type="submit" className="bg-blue-500 text-white p-2">Emitir Nota</button>
      </form>
      <h3>Notas Emitidas</h3>
      <ul>
        {invoices.map((invoice) => (
          <li key={invoice.id} className="border p-2 mb-2">
            {invoice.number} - {invoice.customer.name} - Total: R$ {invoice.total} - Imposto: R$ {invoice.tax}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Invoices;
