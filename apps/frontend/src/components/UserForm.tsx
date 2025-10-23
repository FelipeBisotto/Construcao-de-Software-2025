import { useState } from 'react';

type Props = {
  onSubmit: (data: { name: string; email: string; role?: 'user' | 'admin' }) => void;
};

export default function UserForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, email, role });
        setName('');
        setEmail('');
        setRole('user');
      }}
      style={{ display: 'flex', gap: 8, marginBottom: 16 }}
    >
      <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <select value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <button type="submit">Criar</button>
    </form>
  );
}

