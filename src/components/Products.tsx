import { useEffect, useState } from 'react';
import api from '../api';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  type: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: '', description: '', price: 0, type: 'product' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await api.get('/products');
    setProducts(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/products', form);
    setForm({ name: '', description: '', price: 0, type: 'product' });
    fetchProducts();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Produtos/Serviços</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <input
          type="text"
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Preço"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
          className="border p-2 mr-2"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 mr-2"
        >
          <option value="product">Produto</option>
          <option value="service">Serviço</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2">Adicionar</button>
      </form>
      <ul>
        {products.map((product) => (
          <li key={product.id} className="border p-2 mb-2">
            {product.name} - R$ {product.price} - {product.type}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
