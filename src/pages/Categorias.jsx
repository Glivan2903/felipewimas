import React, { useState } from 'react';
import { Tags, Trash2, Plus } from 'lucide-react';

const Categorias = ({ categorias, onAdd, onDelete }) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('saida');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome) return;
    const success = await onAdd({ nome, tipo });
    if (success) setNome('');
  };

  const entradas = categorias.filter(c => c.tipo === 'entrada');
  const saidas = categorias.filter(c => c.tipo === 'saida');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Tags className="w-5 h-5"/>
          </span>
          Gerenciar Categorias
        </h1>
        <p className="text-sm text-gray-500 mt-1">Personalize as categorias de suas entradas e saídas</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide uppercase">Nova Categoria</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1">Nome da Categoria</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: Aluguel, Projetos, etc." 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3 outline-none transition-shadow" 
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
              <select 
                value={tipo} 
                onChange={e => setTipo(e.target.value)} 
                className="w-full text-sm border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 border px-3 outline-none transition-shadow bg-white"
              >
                <option value="entrada">Entrada (Receita)</option>
                <option value="saida">Saída (Despesa)</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Coluna Entradas */}
          <div className="p-6">
            <h3 className="text-sm font-bold text-green-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Categorias de Entrada
            </h3>
            {entradas.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Nenhuma categoria de entrada cadastrada.</p>
            ) : (
              <ul className="space-y-2">
                {entradas.map(c => (
                  <li key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group transition-colors">
                    <span className="text-sm text-gray-700">{c.nome}</span>
                    <button 
                      onClick={() => onDelete(c.id)}
                      className="text-gray-300 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Coluna Saídas */}
          <div className="p-6">
            <h3 className="text-sm font-bold text-red-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Categorias de Saída
            </h3>
            {saidas.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Nenhuma categoria de saída cadastrada.</p>
            ) : (
              <ul className="space-y-2">
                {saidas.map(c => (
                  <li key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group transition-colors">
                    <span className="text-sm text-gray-700">{c.nome}</span>
                    <button 
                      onClick={() => onDelete(c.id)}
                      className="text-gray-300 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categorias;
