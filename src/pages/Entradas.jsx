import React, { useState } from 'react';
import { ArrowUpCircle, Trash2 } from 'lucide-react';
import { formatCurrency, formatDateBR, meses, getTodayDate } from '../utils/formatters';

const Entradas = ({ lancamentos, categorias, onAdd, onDelete, selMonth, setSelMonth, selYear, setSelYear }) => {
  const catsEntrada = categorias.filter(c => c.tipo === 'entrada');
  const initForm = { data: getTodayDate(), descricao: '', valor: '', categoria: '', recorrente: false, quantidade: 1 };
  const [form, setForm] = useState(initForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategoria = form.categoria || catsEntrada[0]?.nome;
    if (!finalCategoria) return;
    const success = await onAdd({ ...form, tipo: 'entrada', categoria: finalCategoria });
    if(success) setForm(initForm);
  };

  const entradas = lancamentos.filter(l => l.tipo === 'entrada');
  const filtadas = entradas.filter(l => {
     const [y, m] = l.data.split('-');
     return (!selYear || y === selYear) && (!selMonth || m === selMonth);
  });

  const totalFiltro = filtadas.reduce((acc, curr) => acc + Number(curr.valor), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <ArrowUpCircle className="w-5 h-5"/>
          </span>
          Receitas e Entradas
        </h1>
        <p className="text-sm text-gray-500 mt-1">Registre seus salários, rendimentos e freelas</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide uppercase">Nova Entrada</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="w-full md:w-32">
              <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
              <input type="date" required value={form.data} onChange={e => setForm({...form, data: e.target.value})} className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3 outline-none transition-shadow" />
            </div>
            <div className="w-full md:flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
              <input type="text" required placeholder="Ex: Salário Mensal" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3 outline-none transition-shadow" />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
              <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3 outline-none transition-shadow bg-white pb-2.5">
                <option value="" disabled>Selecione...</option>
                {catsEntrada.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>
            <div className="w-full md:w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Valor (R$)</label>
              <input type="number" step="0.01" min="0.01" required placeholder="0,00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3 outline-none transition-shadow" />
            </div>
            <div className="w-full md:w-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="recorrente"
                  checked={form.recorrente} 
                  onChange={e => setForm({...form, recorrente: e.target.checked})}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="recorrente" className="text-xs font-medium text-gray-700 cursor-pointer">Recorrente?</label>
              </div>
              
              {form.recorrente && (
                <div className="w-20">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meses</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="60"
                    required 
                    value={form.quantidade} 
                    onChange={e => setForm({...form, quantidade: parseInt(e.target.value) || 1})} 
                    className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:border-green-500 focus:ring-green-500 py-2 border px-3 outline-none transition-shadow" 
                  />
                </div>
              )}
            </div>

            <button type="submit" className="w-full md:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-100 text-white text-sm font-medium rounded-lg transition-colors shadow-sm self-end">
              Adicionar
            </button>
          </form>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <select value={selMonth} onChange={e => setSelMonth(e.target.value)} className="text-sm border-gray-200 rounded-lg py-1.5 px-3 outline-none bg-white shadow-sm border focus:ring-green-500 focus:border-green-500">
                <option value="">Todos os Meses</option>
                {meses.map((m, i) => <option key={i} value={String(i+1).padStart(2,'0')}>{m}</option>)}
             </select>
             <select value={selYear} onChange={e => setSelYear(e.target.value)} className="text-sm border-gray-200 rounded-lg py-1.5 px-3 outline-none bg-white shadow-sm border focus:ring-green-500 focus:border-green-500">
                <option value="">Todo o Histórico</option>
                {['2023','2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
           </div>
           <div className="bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm whitespace-nowrap">
             Total Período: <strong className="text-green-600 text-base">{formatCurrency(totalFiltro)}</strong>
           </div>
        </div>

        {filtadas.length === 0 ? (
           <div className="p-8 text-center text-gray-500 text-sm">Nenhuma entrada encontrada para este período.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Categoria</th>
                <th className="px-6 py-3 font-medium text-right">Valor</th>
                <th className="px-6 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtadas.map((item) => (
                <tr key={item.id} className="hover:bg-green-50/50 transition-colors group">
                  <td className="px-6 py-3 text-gray-500">{formatDateBR(item.data)}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{item.descricao}</td>
                  <td className="px-6 py-3 text-gray-500">{item.categoria}</td>
                  <td className="px-6 py-3 text-right font-medium text-green-600">{formatCurrency(item.valor)}</td>
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

export default Entradas;
