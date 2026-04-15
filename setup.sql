-- Tabela de lançamentos
CREATE TABLE IF NOT EXISTS lancamentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  data date NOT NULL,
  descricao text NOT NULL,
  valor numeric(10,2) NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'saida', 'diario')),
  categoria text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS no Supabase
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Criar policy pública para leitura e escrita durante desenvolvimento
CREATE POLICY "public_access_lancamentos" ON lancamentos FOR ALL USING (true);
CREATE POLICY "public_access_categorias" ON categorias FOR ALL USING (true);

-- Categorias Iniciais (Opcional - para facilitar o início)
INSERT INTO categorias (nome, tipo) VALUES 
('Salário', 'entrada'),
('Freelance', 'entrada'),
('Investimento', 'entrada'),
('Outros', 'entrada'),
('Alimentação', 'saida'),
('Transporte', 'saida'),
('Saúde', 'saida'),
('Lazer', 'saida'),
('Fixas', 'saida'),
('Outros', 'saida')
ON CONFLICT DO NOTHING;
