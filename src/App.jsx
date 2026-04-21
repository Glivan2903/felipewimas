import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Wallet, Menu, X, AlertCircle, Loader2, FileText, CheckCircle2, AlertTriangle, Download, Calendar, Tags } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Entradas from './pages/Entradas';
import Saidas from './pages/Saidas';
import Relatorio from './pages/Relatorio';
import Categorias from './pages/Categorias';
import { getTodayDate } from './utils/formatters';

const NavItem = ({ icon, label, to, active, onClick, color="text-gray-500", activeColor="bg-indigo-50 text-indigo-700 border-indigo-200" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent ${
      active ? activeColor : `text-gray-600 hover:bg-gray-50 hover:text-gray-900`
    }`}
  >
    <span className={active ? '' : color}>{icon}</span>
    {label}
  </Link>
);

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lancamentos, setLancamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); 
  const location = useLocation();

  // Filtros Globais (estados partilhados para Entrada/Saida)
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchLancamentos();
      fetchCategorias();
    }
  }, []);

  const showToast = (type, message) => setToast({ type, message });

  const fetchLancamentos = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lancamentos')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setLancamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showToast('error', 'Falha ao carregar dados do Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategorias = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      showToast('error', 'Falha ao carregar categorias.');
    }
  };

  const handleAddLancamento = async (novoLancamento) => {
    if (!isSupabaseConfigured) {
      showToast('error', 'Supabase não configurado no .env');
      return false;
    }

    const { recorrente, quantidade, ...dados } = novoLancamento;

    if (!dados.descricao) {
      showToast('error', 'A descrição é obrigatória.');
      return false;
    }
    if (!dados.valor || parseFloat(dados.valor) <= 0) {
      showToast('error', 'O valor deve ser maior que zero.');
      return false;
    }

    const entriesToInsert = [];
    const baseDate = dados.data || getTodayDate();
    const numVezes = recorrente ? Math.max(1, parseInt(quantidade) || 1) : 1;

    for (let i = 0; i < numVezes; i++) {
      // Calcular data para o mês seguinte
      const d = new Date(baseDate + 'T12:00:00');
      const originalDay = d.getDate();
      d.setMonth(d.getMonth() + i);
      
      // Ajuste para meses com menos dias (ex: 31 Jan -> 28 Fev)
      if (d.getDate() !== originalDay) {
        d.setDate(0); // Volta para o último dia do mês anterior
      }

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      entriesToInsert.push({
        ...dados,
        data: `${year}-${month}-${day}`,
        valor: parseFloat(dados.valor),
        descricao: numVezes > 1 ? `${dados.descricao} (${i + 1}/${numVezes})` : dados.descricao
      });
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('lancamentos')
        .insert(entriesToInsert);

      if (error) throw error;

      showToast('success', numVezes > 1 ? `${numVezes} lançamentos adicionados!` : 'Lançamento adicionado!');
      fetchLancamentos();
      return true;
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showToast('error', 'Erro ao salvar o lançamento.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLancamento = async (id) => {
    if (!supabase) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('lancamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('success', 'Lançamento excluído.');
      fetchLancamentos();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showToast('error', 'Erro ao excluir o lançamento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategoria = async (novaCategoria) => {
    if (!supabase) return false;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('categorias')
        .insert([novaCategoria]);
      if (error) throw error;
      showToast('success', 'Categoria adicionada!');
      fetchCategorias();
      return true;
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      showToast('error', 'Erro ao salvar categoria.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
      if (error) throw error;
      showToast('success', 'Categoria excluída.');
      fetchCategorias();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      showToast('error', 'Erro ao excluir categoria.');
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => {
    const t = { entrada: 0, saida: 0, diario: 0, saldo: 0 };
    lancamentos.forEach(l => {
      t[l.tipo] += Number(l.valor);
    });
    t.saldo = t.entrada - t.saida - t.diario;
    return t;
  }, [lancamentos]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <span className="text-sm font-medium text-gray-600">Sincronizando...</span>
          </div>
        </div>
      )}
      
      {toast && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-xl z-50 flex items-center gap-3 transition-all transform duration-300 ease-out border ${
          toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {isMobileMenuOpen && (
         <div className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Menu Lateral */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}>
        
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Wallet className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-gray-900">Finanças</span>
          </div>
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" active={location.pathname === '/'} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/entradas" icon={<ArrowUpCircle />} label="Entradas" active={location.pathname === '/entradas'} onClick={() => setIsMobileMenuOpen(false)} color="text-green-600" activeColor="bg-green-50 text-green-700 border-green-200" />
          <NavItem to="/saidas" icon={<ArrowDownCircle />} label="Saídas" active={location.pathname === '/saidas'} onClick={() => setIsMobileMenuOpen(false)} color="text-red-600" activeColor="bg-red-50 text-red-700 border-red-200" />
          <NavItem to="/relatorio" icon={<FileText />} label="Relatório" active={location.pathname === '/relatorio'} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem to="/categorias" icon={<Tags />} label="Categorias" active={location.pathname === '/categorias'} onClick={() => setIsMobileMenuOpen(false)} />
        </nav>
        
        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          Sistema Financeiro v2.0
        </div>
      </aside>

      {/* Área Central / Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sm:px-6 justify-between lg:justify-end shrink-0">
          <button 
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
               <Calendar className="w-4 h-4 text-gray-500" />
               {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-6xl mx-auto">
            {!isSupabaseConfigured ? (
              <div className="flex flex-col items-center justify-center p-8 mt-12 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold mb-2 text-center">Supabase Não Configurado</h2>
                <p className="text-center max-w-lg mb-4 text-sm opacity-90">
                  Para o sistema funcionar, você precisa configurar as variáveis no arquivo <strong>.env</strong>.
                </p>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard lancamentos={lancamentos} totals={totals} />} />
                <Route path="/entradas" element={<Entradas lancamentos={lancamentos} categorias={categorias} onAdd={handleAddLancamento} onDelete={handleDeleteLancamento} selMonth={selectedMonth} setSelMonth={setSelectedMonth} selYear={selectedYear} setSelYear={setSelectedYear} />} />
                <Route path="/saidas" element={<Saidas lancamentos={lancamentos} categorias={categorias} onAdd={handleAddLancamento} onDelete={handleDeleteLancamento} selMonth={selectedMonth} setSelMonth={setSelectedMonth} selYear={selectedYear} setSelYear={setSelectedYear} />} />
                <Route path="/relatorio" element={<Relatorio lancamentos={lancamentos} />} />
                <Route path="/categorias" element={<Categorias categorias={categorias} onAdd={handleAddCategoria} onDelete={handleDeleteCategoria} />} />
              </Routes>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
