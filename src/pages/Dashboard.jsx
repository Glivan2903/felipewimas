import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet, DollarSign, PieChart, LayoutDashboard } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDateBR, mesesAbbr, getTodayDate, getDateRange } from '../utils/formatters';

const Dashboard = ({ lancamentos }) => {
  const now = new Date();
  const [filterType, setFilterType] = React.useState('mes'); // dia, semana, mes, ano, periodo, tudo
  const [filterValue, setFilterValue] = React.useState({
    dia: getTodayDate(),
    semana: getTodayDate(),
    mes: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    ano: String(now.getFullYear()),
    start: getTodayDate(),
    end: getTodayDate()
  });

  const filteredLancamentos = useMemo(() => {
    if (filterType === 'tudo') return lancamentos;

    let start, end;
    if (filterType === 'periodo') {
      start = filterValue.start;
      end = filterValue.end;
    } else {
      const val = filterValue[filterType];
      const range = getDateRange(filterType, val);
      start = range.start;
      end = range.end;
    }

    return lancamentos.filter(l => l.data >= start && l.data <= end);
  }, [lancamentos, filterType, filterValue]);

  const dashboardTotals = useMemo(() => {
    const t = { entrada: 0, saida: 0, diario: 0, saldo: 0 };
    filteredLancamentos.forEach(l => {
      t[l.tipo] += Number(l.valor);
    });
    t.saldo = t.entrada - t.saida - t.diario;
    return t;
  }, [filteredLancamentos]);

  const barData = useMemo(() => {
    const today = new Date();
    const dataMap = {};
    
    let baseYear = today.getFullYear();
    if (filterType === 'ano') baseYear = parseInt(filterValue.ano);
    else if (filterType === 'mes') baseYear = parseInt(filterValue.mes.split('-')[0]);

    for(let i=5; i>=0; i--) {
      const d = new Date(baseYear, today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      dataMap[key] = {
        name: mesesAbbr[d.getMonth()],
        sortKey: key,
        Entradas: 0,
        Saídas: 0,
        Diário: 0
      };
    }

    lancamentos.forEach(l => {
      const [y, m] = l.data.split('-');
      const key = `${y}-${m}`;
      if (dataMap[key]) {
         if(l.tipo === 'entrada') dataMap[key].Entradas += Number(l.valor);
         if(l.tipo === 'saida') dataMap[key].Saídas += Number(l.valor);
         if(l.tipo === 'diario') dataMap[key].Diário += Number(l.valor);
      }
    });

    return Object.values(dataMap).sort((a,b) => a.sortKey.localeCompare(b.sortKey));
  }, [lancamentos, filterType, filterValue]);

  const lineData = useMemo(() => {
    if (filteredLancamentos.length === 0) return [];
    const sorted = [...filteredLancamentos].sort((a, b) => a.data.localeCompare(b.data));
    const dailyData = {};
    let accumulated = 0;

    let start;
    if (filterType === 'periodo') start = filterValue.start;
    else if (filterType === 'tudo') start = '1900-01-01';
    else start = getDateRange(filterType, filterValue[filterType]).start;

    lancamentos.forEach(l => {
      if (l.data < start) {
        const val = Number(l.valor);
        accumulated += l.tipo === 'entrada' ? val : -val;
      }
    });

    sorted.forEach(l => {
      const val = Number(l.valor);
      accumulated += l.tipo === 'entrada' ? val : -val;
      dailyData[l.data] = { dia: formatDateBR(l.data).split('/')[0], fullDate: l.data, Saldo: accumulated };
    });
    
    return Object.values(dailyData).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [filteredLancamentos, lancamentos, filterType, filterValue]);

  const recentes = filteredLancamentos.slice(0, 5);

  const handleFilterChange = (key, value) => {
    setFilterValue(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
           <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral</h1>
           <p className="text-sm text-gray-500">Acompanhe o resumo das suas finanças</p>
         </div>

         <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
           <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-semibold uppercase tracking-wider bg-gray-50 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
           >
             <option value="dia">Dia</option>
             <option value="semana">Semana</option>
             <option value="mes">Mês</option>
             <option value="ano">Ano</option>
             <option value="periodo">Período</option>
             <option value="tudo">Tudo</option>
           </select>

           <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

           {filterType === 'dia' && (
             <input type="date" value={filterValue.dia} onChange={(e) => handleFilterChange('dia', e.target.value)} className="text-sm border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-300" />
           )}
           {filterType === 'semana' && (
             <input type="date" value={filterValue.semana} onChange={(e) => handleFilterChange('semana', e.target.value)} className="text-sm border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-300" />
           )}
           {filterType === 'mes' && (
             <input type="month" value={filterValue.mes} onChange={(e) => handleFilterChange('mes', e.target.value)} className="text-sm border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-300" />
           )}
           {filterType === 'ano' && (
             <select value={filterValue.ano} onChange={(e) => handleFilterChange('ano', e.target.value)} className="text-sm border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-300">
               {['2023', '2024', '2025', '2026'].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
           )}
           {filterType === 'periodo' && (
             <div className="flex items-center gap-2">
               <input type="date" value={filterValue.start} onChange={(e) => handleFilterChange('start', e.target.value)} className="text-sm border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-300" />
               <span className="text-gray-400 text-xs">até</span>
               <input type="date" value={filterValue.end} onChange={(e) => handleFilterChange('end', e.target.value)} className="text-sm border-gray-100 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-300" />
             </div>
           )}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Entradas" value={dashboardTotals.entrada} icon={<ArrowUpCircle className="w-5 h-5"/>} type="entrada" />
        <MetricCard title="Saídas" value={dashboardTotals.saida} icon={<ArrowDownCircle className="w-5 h-5"/>} type="saida" />
        <MetricCard title="Diário/Avulso" value={dashboardTotals.diario} icon={<Wallet className="w-5 h-5"/>} type="diario" />
        <MetricCard title="Saldo Período" value={dashboardTotals.saldo} icon={<DollarSign className="w-5 h-5"/>} type="saldo" />
      </div>

      {filteredLancamentos.length === 0 ? (
        <EmptyState 
           message="Nenhum dado encontrado para os filtros selecionados." 
           actionText="Limpar Filtros"
           onAction={() => setFilterType('tudo')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500"/> Comparativo Mensal
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
              <LayoutDashboard className="w-5 h-5 text-blue-500"/> Evolução do Saldo
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => value !== 0 ? `R$${(value/1000).toFixed(1)}k` : '0'} />
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
          <h3 className="text-base font-semibold text-gray-900">Lançamentos no Período</h3>
        </div>
        {recentes.length === 0 ? (
           <div className="p-6 text-center text-sm text-gray-500">Nenhum lançamento encontrado para estes filtros.</div>
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
