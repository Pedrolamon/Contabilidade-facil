import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '../api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h2>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Função atual: <span className="font-semibold">{user.role}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Criado em: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  {user.role !== 'user' && (
                    <Button
                      onClick={() => updateUserRole(user.id, 'user')}
                      variant="outline"
                      size="sm"
                    >
                      Tornar Usuário
                    </Button>
                  )}
                  {user.role !== 'manager' && (
                    <Button
                      onClick={() => updateUserRole(user.id, 'manager')}
                      variant="outline"
                      size="sm"
                    >
                      Tornar Gerente
                    </Button>
                  )}
                  {user.role !== 'admin' && (
                    <Button
                      onClick={() => updateUserRole(user.id, 'admin')}
                      variant="outline"
                      size="sm"
                    >
                      Tornar Admin
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Users;
