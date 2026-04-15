import React, { useState } from 'react';
import { ArrowDownCircle, Trash2 } from 'lucide-react';
import { formatCurrency, formatDateBR, meses, getTodayDate } from '../utils/formatters';

const Saidas = ({ lancamentos, categorias, onAdd, onDelete, selMonth, setSelMonth, selYear, setSelYear }) => {
  const catsSaida = categorias.filter(c => c.tipo === 'saida');
  const initForm = { data: getTodayDate(), descricao: '', valor: '', categoria: '', tipoLocal: 'saida' };
  const [form, setForm] = useState(initForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { tipoLocal, ...rest } = form;
    const finalCategoria = form.categoria || catsSaida[0]?.nome;
    if (!finalCategoria) return;
    const success = await onAdd({ ...rest, tipo: tipoLocal, categoria: finalCategoria });
    if(success) setForm(initForm);
  };

  const todasSaidas = lancamentos.filter(l => l.tipo === 'saida' || l.tipo === 'diario');
  const filtadas = todasSaidas.filter(l => {
     const [y, m] = l.data.split('-');
     return (!selYear || y === selYear) && (!selMonth || m === selMonth);
  });

  const totalNormal = filtadas.filter(l=>l.tipo === 'saida').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalDiario = filtadas.filter(l=>l.tipo === 'diario').reduce((acc, curr) => acc + Number(curr.valor), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <ArrowDownCircle className="w-5 h-5"/>
          </span>
          Despesas e Saídas
        </h1>
        <p className="text-sm text-gray-500 mt-1">Registre seus gastos normais e diários (avulsos)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide uppercase">Nova Despesa</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row flex-wrap gap-4 items-start md:items-end">
            <div className="w-full md:w-auto">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Gasto</label>
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                 <button type="button" onClick={()=>setForm({...form, tipoLocal:'saida'})} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${form.tipoLocal==='saida' ? 'bg-white shadow-sm text-red-700' : 'text-gray-500 hover:text-gray-700'}`}>Normal</button>
                 <button type="button" onClick={()=>setForm({...form, tipoLocal:'diario'})} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${form.tipoLocal==='diario' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}>Diário/Avulso</button>
              </div>
            </div>

            <div className="w-full md:w-32">
              <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
              <input type="date" required value={form.data} onChange={e => setForm({...form, data: e.target.value})} className={`w-full text-sm border-gray-200 rounded-lg shadow-sm focus:ring-1 py-2 border px-3 outline-none transition-shadow ${form.tipoLocal==='saida' ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-amber-500 focus:ring-amber-500'}`} />
            </div>
            
            <div className="w-full md:flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
              <input type="text" required placeholder="Ex: Conta de Luz" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className={`w-full text-sm border-gray-200 rounded-lg shadow-sm focus:ring-1 py-2 border px-3 outline-none transition-shadow ${form.tipoLocal==='saida' ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-amber-500 focus:ring-amber-500'}`} />
            </div>
            
            <div className="w-full md:w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
              <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className={`w-full text-sm border-gray-200 rounded-lg shadow-sm focus:ring-1 py-2 border px-3 flex-1 outline-none transition-shadow bg-white pb-2.5 ${form.tipoLocal==='saida' ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-amber-500 focus:ring-amber-500'}`}>
                <option value="" disabled>Selecione...</option>
                {catsSaida.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>
            
            <div className="w-full md:w-32">
              <label className="block text-xs font-medium text-gray-500 mb-1">Valor (R$)</label>
              <input type="number" step="0.01" min="0.01" required placeholder="0,00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className={`w-full text-sm border-gray-200 rounded-lg shadow-sm focus:ring-1 py-2 border px-3 outline-none transition-shadow ${form.tipoLocal==='saida' ? 'focus:border-red-500 focus:ring-red-500' : 'focus:border-amber-500 focus:ring-amber-500'}`} />
            </div>
            
            <button type="submit" className={`w-full md:w-auto px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:ring-4 ${form.tipoLocal==='saida' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-100' : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-100 text-amber-950'}`}>
              Adicionar
            </button>
          </form>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <select value={selMonth} onChange={e => setSelMonth(e.target.value)} className="text-sm border-gray-200 rounded-lg py-1.5 px-3 outline-none bg-white shadow-sm border focus:ring-gray-500 focus:border-gray-500">
                <option value="">Todos os Meses</option>
                {meses.map((m, i) => <option key={i} value={String(i+1).padStart(2,'0')}>{m}</option>)}
             </select>
             <select value={selYear} onChange={e => setSelYear(e.target.value)} className="text-sm border-gray-200 rounded-lg py-1.5 px-3 outline-none bg-white shadow-sm border focus:ring-gray-500 focus:border-gray-500">
                <option value="">Todo o Histórico</option>
                {['2023','2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
           </div>
           <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <div className="bg-white px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm text-xs whitespace-nowrap">
                Normal: <strong className="text-red-600 text-sm">{formatCurrency(totalNormal)}</strong>
              </div>
              <div className="bg-white px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm text-xs whitespace-nowrap">
                Diário: <strong className="text-amber-600 text-sm">{formatCurrency(totalDiario)}</strong>
              </div>
              <div className="bg-white px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm text-xs whitespace-nowrap">
                Total Saídas: <strong className="text-gray-900 text-sm">{formatCurrency(totalNormal + totalDiario)}</strong>
              </div>
           </div>
        </div>

        {filtadas.length === 0 ? (
           <div className="p-8 text-center text-gray-500 text-sm">Nenhuma saída encontrada para este período.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Categoria</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium text-right">Valor</th>
                <th className="px-6 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtadas.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="px-6 py-3 text-gray-500">{formatDateBR(item.data)}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{item.descricao}</td>
                  <td className="px-6 py-3 text-gray-500">{item.categoria}</td>
                  <td className="px-6 py-3">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${item.tipo === 'saida' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                       {item.tipo === 'saida' ? 'Normal' : 'Diário'}
                     </span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(item.valor)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default Saidas;
