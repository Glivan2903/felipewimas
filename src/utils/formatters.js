export const formatCurrency = (value) => {
  const num = Number(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(num) ? 0 : num);
};

export const formatDateBR = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const mesesAbbr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const getDateRange = (type, value) => {
  let start, end;
  
  if (type === 'dia') {
    start = end = value;
  } else if (type === 'semana') {
    const d = new Date(value + 'T12:00:00');
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1); // Adjust to Monday
    const s = new Date(d.setDate(diff));
    const e = new Date(d.setDate(s.getDate() + 6));
    start = s.toISOString().split('T')[0];
    end = e.toISOString().split('T')[0];
  } else if (type === 'mes') {
    const [y, m] = value.split('-');
    start = `${y}-${m}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    end = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
  } else if (type === 'ano') {
    start = `${value}-01-01`;
    end = `${value}-12-31`;
  }
  return { start, end };
};
