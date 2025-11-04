import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import UserForm from '../components/UserForm';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function Users() {
  const qc = useQueryClient();

  const usersQuery = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users', { headers: authHeader() })).data
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<User, 'id'>) => (await api.post('/users', data, { headers: authHeader() })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/users/${id}`, { headers: authHeader() })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });

  return (
    <div>
      <h2>Usuários</h2>
      <TokenTip />
      <UserForm onSubmit={(d) => createMutation.mutate(d)} />
      {usersQuery.isLoading && <div>Carregando...</div>}
      {usersQuery.error && <div>Erro ao carregar.</div>}
      <ul>
        {usersQuery.data?.map((u) => (
          <li key={u.id}>
            {u.name} — {u.email} ({u.role}){' '}
            <button onClick={() => deleteMutation.mutate(u.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function authHeader() {
  const token = localStorage.getItem('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function TokenTip() {
  return (
    <p style={{ fontSize: 12, opacity: 0.8 }}>
      Dica: Gere um Access Token via Hosted UI do Cognito (veja README) e aplique em <code>localStorage.setItem('token','SEU_TOKEN')</code>. Somente tokens com a role <code>admin</code> conseguem criar/listar usuários.
    </p>
  );
}
