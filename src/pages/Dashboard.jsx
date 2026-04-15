import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet, DollarSign, PieChart, LayoutDashboard } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDateBR, meses } from '../utils/formatters';

const Dashboard = ({ lancamentos, totals }) => {
  const barData = useMemo(() => {
    const today = new Date();
    const dataMap = {};
    
    for(let i=5; i>=0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      dataMap[key] = {
        name: meses[d.getMonth()],
        sortKey: key,
        Entradas: 0,
        Saídas: 0,
        Diário: 0
      };
    }

    lancamentos.forEach(l => {
      const dataL = new Date(l.data + 'T12:00:00Z');
      const key = `${dataL.getFullYear()}-${String(dataL.getMonth()+1).padStart(2,'0')}`;
      if (dataMap[key]) {
         if(l.tipo === 'entrada') dataMap[key].Entradas += Number(l.valor);
         if(l.tipo === 'saida') dataMap[key].Saídas += Number(l.valor);
         if(l.tipo === 'diario') dataMap[key].Diário += Number(l.valor);
      }
    });

    return Object.values(dataMap).sort((a,b) => a.sortKey.localeCompare(b.sortKey));
  }, [lancamentos]);

  const lineData = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let saldoAcumulado = 0;
    const currentMonthPrefix = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}`;
    const cronoLancamentos = [...lancamentos].sort((a,b) => a.data.localeCompare(b.data));
    
    cronoLancamentos.forEach(l => {
      if (l.data < `${currentMonthPrefix}-01`) {
        const val = Number(l.valor);
        saldoAcumulado += l.tipo === 'entrada' ? val : -val;
      }
    });

    const dailyData = {};
    for(let i=1; i<=daysInMonth; i++) {
      const dateStr = `${currentMonthPrefix}-${String(i).padStart(2,'0')}`;
      const docsDia = cronoLancamentos.filter(l => l.data === dateStr);
      docsDia.forEach(l => {
         const val = Number(l.valor);
         saldoAcumulado += l.tipo === 'entrada' ? val : -val;
      });
      
      if(i <= today.getDate() || docsDia.length > 0) {
        dailyData[i] = { dia: String(i), Saldo: saldoAcumulado };
      }
    }
    
    return Object.values(dailyData);
  }, [lancamentos]);

  const recentes = lancamentos.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
           <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral</h1>
           <p className="text-sm text-gray-500">Acompanhe o resumo das suas finanças</p>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Entradas" value={totals.entrada} icon={<ArrowUpCircle className="w-5 h-5"/>} type="entrada" />
        <MetricCard title="Total Saídas" value={totals.saida} icon={<ArrowDownCircle className="w-5 h-5"/>} type="saida" />
        <MetricCard title="Total Diário/Avulso" value={totals.diario} icon={<Wallet className="w-5 h-5"/>} type="diario" />
        <MetricCard title="Saldo Atual" value={totals.saldo} icon={<DollarSign className="w-5 h-5"/>} type="saldo" />
      </div>

      {lancamentos.length === 0 ? (
        <EmptyState 
           message="Você ainda não possui dados para exibir os gráficos. Cadastre um lançamento para visualizar a evolução do seu dinheiro." 
           actionText="Adicionar Lançamento"
           actionRoute="/entradas"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500"/> Entradas vs Saídas (6 Meses)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => value > 0 ? `R$${(value/1000).toFixed(0)}k` : '0'} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => formatCurrency(value)} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                  <Bar dataKey="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Diário" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-500"/> Evolução do Saldo (Mês Atual)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} />
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `Dia ${label}`} />
                  <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6, stroke: '#3b82f6', fill: '#3b82f6'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Últimos Lançamentos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Últimos Lançamentos</h3>
        </div>
        {recentes.length === 0 ? (
           <div className="p-6 text-center text-sm text-gray-500">Nenhum lançamento recente.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Categoria</th>
                <th className="px-6 py-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentes.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{formatDateBR(item.data)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                     {item.descricao}
                     <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                       item.tipo === 'entrada' ? 'bg-green-100 text-green-700' :
                       item.tipo === 'saida' ? 'bg-red-100 text-red-700' :
                       'bg-amber-100 text-amber-700'
                     }`}>
                       {item.tipo}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.categoria}</td>
                  <td className={`px-6 py-4 text-right font-medium ${item.tipo === 'entrada' ? 'text-green-600' : 'text-gray-900'}`}>
                    {item.tipo === 'entrada' ? '+' : '-'}{formatCurrency(item.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
