import React, { useState, useMemo } from 'react';
import { FileText, Download } from 'lucide-react';
import { formatCurrency, meses } from '../utils/formatters';

const Relatorio = ({ lancamentos }) => {
  const now = new Date();
  const [selYear, setSelYear] = useState(String(now.getFullYear()));

  const dadosAno = useMemo(() => {
    const dados = Array.from({length: 12}, (_, i) => ({
      mes: i,
      nomeMes: meses[i],
      entradas: 0,
      saidas: 0,
      diario: 0,
      saldo: 0,
      economia: 0
    }));

    lancamentos.forEach(l => {
      const dataL = new Date(l.data + 'T12:00:00Z');
      if (String(dataL.getFullYear()) === selYear) {
        const m = dataL.getMonth();
        const v = Number(l.valor);
        if(l.tipo === 'entrada') dados[m].entradas += v;
        if(l.tipo === 'saida') dados[m].saidas += v;
        if(l.tipo === 'diario') dados[m].diario += v;
      }
    });

    dados.forEach(d => {
      d.saldo = d.entradas - d.saidas - d.diario;
      d.economia = d.entradas > 0 ? (d.saldo / d.entradas) * 100 : 0;
    });

    return dados;
  }, [lancamentos, selYear]);

  const totaisAno = dadosAno.reduce((acc, curr) => {
    acc.entradas += curr.entradas;
    acc.saidas += curr.saidas;
    acc.diario += curr.diario;
    return acc;
  }, {entradas: 0, saidas: 0, diario: 0, saldo: 0, economia: 0});
  
  totaisAno.saldo = totaisAno.entradas - totaisAno.saidas - totaisAno.diario;
  totaisAno.economia = totaisAno.entradas > 0 ? (totaisAno.saldo / totaisAno.entradas) * 100 : 0;

  const exportarCSV = () => {
    const rows = [
      ['Mês', 'Entradas', 'Saídas Normais', 'Diário (Avulso)', 'Saldo Mensal', 'Economia (%)']
    ];
    
    dadosAno.forEach(d => {
       rows.push([
         d.nomeMes, 
         d.entradas.toFixed(2).replace('.',','), 
         d.saidas.toFixed(2).replace('.',','), 
         d.diario.toFixed(2).replace('.',','), 
         d.saldo.toFixed(2).replace('.',','), 
         d.economia.toFixed(2).replace('.',',') + '%'
       ]);
    });
    
    rows.push([
       'TOTAL', 
       totaisAno.entradas.toFixed(2).replace('.',','), 
       totaisAno.saidas.toFixed(2).replace('.',','), 
       totaisAno.diario.toFixed(2).replace('.',','), 
       totaisAno.saldo.toFixed(2).replace('.',','), 
       totaisAno.economia.toFixed(2).replace('.',',') + '%'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_financeiro_${selYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
           <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
             <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
               <FileText className="w-5 h-5"/>
             </span>
             Relatório Anual
           </h1>
           <p className="text-sm text-gray-500 mt-1">Visão consolidada mês a mês</p>
         </div>
         <div className="flex items-center gap-3">
            <select value={selYear} onChange={e => setSelYear(e.target.value)} className="text-sm border-gray-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-4 pr-10 outline-none">
              {['2023','2024','2025','2026', '2027'].map(y => <option key={y} value={y}>Ano {y}</option>)}
            </select>
            <button onClick={exportarCSV} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-sm font-medium rounded-lg transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Mês</th>
                <th className="px-6 py-4 font-semibold text-right">Entradas</th>
                <th className="px-6 py-4 font-semibold text-right">Saídas Normais</th>
                <th className="px-6 py-4 font-semibold text-right">Diário (Avulso)</th>
                <th className="px-6 py-4 font-semibold text-right">Saldo</th>
                <th className="px-6 py-4 font-semibold text-right">% Economia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dadosAno.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-gray-900">{d.nomeMes}</td>
                  <td className="px-6 py-3.5 text-right font-medium text-green-600">{d.entradas > 0 ? formatCurrency(d.entradas) : '-'}</td>
                  <td className="px-6 py-3.5 text-right text-gray-600">{d.saidas > 0 ? formatCurrency(d.saidas) : '-'}</td>
                  <td className="px-6 py-3.5 text-right text-amber-600">{d.diario > 0 ? formatCurrency(d.diario) : '-'}</td>
                  <td className={`px-6 py-3.5 text-right font-semibold ${d.saldo > 0 ? 'text-green-600' : d.saldo < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {formatCurrency(d.saldo)}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                     <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${d.economia >= 20 ? 'bg-green-100 text-green-800' : d.economia > 0 ? 'bg-blue-100 text-blue-800' : d.economia < 0 ? 'bg-red-100 text-red-800' : 'text-gray-400'}`}>
                       {d.economia.toFixed(1)}%
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-gray-900">
              <tr>
                <td className="px-6 py-4">TOTAL {selYear}</td>
                <td className="px-6 py-4 text-right text-green-700">{formatCurrency(totaisAno.entradas)}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(totaisAno.saidas)}</td>
                <td className="px-6 py-4 text-right text-amber-700">{formatCurrency(totaisAno.diario)}</td>
                <td className={`px-6 py-4 text-right ${totaisAno.saldo > 0 ? 'text-green-700' : totaisAno.saldo < 0 ? 'text-red-700' : ''}`}>{formatCurrency(totaisAno.saldo)}</td>
                <td className="px-6 py-4 text-right">{totaisAno.economia.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Relatorio;
