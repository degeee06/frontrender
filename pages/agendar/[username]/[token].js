import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// 🔥 AJUSTE: URL do seu backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://agendamento-ynxr.onrender.com';

export default function AgendamentoConvidado() {
  const router = useRouter();
  const { username, token } = router.query;
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (username && token) {
      carregarDadosLink();
    }
  }, [username, token]);

  async function carregarDadosLink() {
    try {
      // 🔥 AJUSTE: Chamar SEU backend
      const response = await fetch(`${BACKEND_URL}/api/agendar-convidado/${username}/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setDados(data.dados_predefinidos);
        setForm({
          nome: data.dados_predefinidos.nome,
          email: data.dados_predefinidos.email,
          telefone: data.dados_predefinidos.telefone
        });
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function confirmarAgendamento() {
    try {
      // 🔥 AJUSTE: Chamar SEU backend
      const response = await fetch(`${BACKEND_URL}/api/confirmar-agendamento-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          ...form
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Agendamento confirmado!');
        router.push('/sucesso'); // Ou página de sucesso
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (!dados) return <div>Link inválido ou expirado</div>;

  return (
    <div className="container">
      <h1>Confirmar Agendamento</h1>
      <div className="dados-predefinidos">
        <p><strong>Data:</strong> {dados.data}</p>
        <p><strong>Horário:</strong> {dados.horario}</p>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); confirmarAgendamento(); }}>
        <input
          type="text"
          placeholder="Seu nome"
          value={form.nome}
          onChange={(e) => setForm({...form, nome: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Seu email"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
        />
        <input
          type="tel"
          placeholder="Seu telefone"
          value={form.telefone}
          onChange={(e) => setForm({...form, telefone: e.target.value})}
          required
        />
        
        <button type="submit">
          Confirmar Agendamento
        </button>
      </form>
    </div>
  );

}
