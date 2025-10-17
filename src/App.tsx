import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import Customers from './components/Customers';
import Products from './components/Products';
import Invoices from './components/Invoices';
import Suppliers from './components/Suppliers';
import Taxes from './components/Taxes';
import Reports from './components/Reports';
import Users from './components/Users';
import Onboarding from './components/Onboarding';
import Help from './components/Help';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (user: any, token: string) => {
    // Auth context handles this
  };

  const handleRegister = (user: any, token: string) => {
    // Auth context handles this
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold">Contabilidade Fácil</h1>
            <div className="flex items-center space-x-4">
              <div className="text-white">
                Olá, {user?.name} ({user?.role})
              </div>
              <div className="space-x-4 flex flex-wrap">
                <Link to="/" className="text-white hover:text-blue-200">Dashboard</Link>
                <Link to="/accounts" className="text-white hover:text-blue-200">Contas</Link>
                <Link to="/transactions" className="text-white hover:text-blue-200">Transações</Link>
                <Link to="/customers" className="text-white hover:text-blue-200">Clientes</Link>
                <Link to="/suppliers" className="text-white hover:text-blue-200">Fornecedores</Link>
                <Link to="/products" className="text-white hover:text-blue-200">Produtos</Link>
                <Link to="/invoices" className="text-white hover:text-blue-200">Notas Fiscais</Link>
                <Link to="/taxes" className="text-white hover:text-blue-200">Impostos</Link>
                <Link to="/reports" className="text-white hover:text-blue-200">Relatórios</Link>
                <Link to="/onboarding" className="text-white hover:text-blue-200">Configuração</Link>
                <Link to="/help" className="text-white hover:text-blue-200">Ajuda</Link>
                {isAdmin && (
                  <Link to="/users" className="text-white hover:text-blue-200">Usuários</Link>
                )}
              </div>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/taxes" element={<Taxes />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/help" element={<Help />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
