-- Cole isso inteiro no SQL Editor do Supabase (painel do projeto > SQL Editor > New query > Run)
-- Usa o MESMO projeto Supabase do identidade-visual/ — só cria tabelas novas.

-- Votos: cada linha é um toque de um participante numa categoria.
create table public.pos_ifood_move_votos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in ('recorrencia','margem','aquisicao','delivery','gestao','dados')),
  created_at timestamptz not null default now()
);

-- Segurança: ativação pública sem login. Qualquer pessoa com o link do QR code
-- consegue votar (insert) e o totem consegue ler os resultados (select) em tempo real.
alter table public.pos_ifood_move_votos enable row level security;

create policy "public insert" on public.pos_ifood_move_votos for insert with check (true);
create policy "public read" on public.pos_ifood_move_votos for select using (true);

-- Habilita atualização em tempo real (o totem vê o voto aparecer na hora, sem recarregar)
alter publication supabase_realtime add table public.pos_ifood_move_votos;
