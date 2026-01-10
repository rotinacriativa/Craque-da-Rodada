---
description: Refatoração das Telas do Usuário Player
---

# Plano de Refatoração - Telas do Usuário Player

## Contexto
Refatoração focada EXCLUSIVAMENTE nas telas do usuário normal (player), sem alterar funcionalidades, regras de negócio ou telas administrativas.

## Escopo

### Telas Incluídas
1. **Dashboard do Usuário** (`/app/dashboard/page.tsx`)
2. **Perfil do Usuário** (`/app/dashboard/perfil/page.tsx`)
3. **Lista de Grupos** (`/app/dashboard/grupos/page.tsx`)
4. **Página do Grupo (modo player)** (`/app/dashboard/grupos/[id]/page.tsx`)
5. **Detalhe da Partida (modo player)** (`/app/dashboard/partidas/[id]/page.tsx`)

### Telas EXCLUÍDAS (não mexer)
- Telas de administrador de grupo (`/app/dashboard/grupos/[id]/admin/*`)
- Telas de criação/edição de grupo e partida
- Telas de administrador geral
- Qualquer funcionalidade administrativa

## Objetivos Técnicos

### 1. Separação de Responsabilidades
- **Componentes de UI**: Componentes reutilizáveis e isolados
- **Hooks de Dados**: Custom hooks para busca e manipulação de dados
- **Lógica de Estado**: Gerenciamento de estado local e compartilhado
- **Utilitários**: Funções auxiliares reutilizáveis

### 2. Estrutura de Pastas Proposta

```
src/
├── hooks/
│   ├── player/
│   │   ├── useDashboardData.ts       # Dados do dashboard
│   │   ├── useUserProfile.ts         # Dados e ações do perfil
│   │   ├── useUserGroups.ts          # Lista de grupos do usuário
│   │   ├── useGroupDetails.ts        # Detalhes de um grupo (modo player)
│   │   └── useMatchDetails.ts        # Detalhes de uma partida (modo player)
│   └── shared/
│       ├── useAuth.ts                # Autenticação reutilizável
│       └── useToast.ts               # Notificações reutilizáveis
│
├── components/
│   ├── player/
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── NextMatchCard.tsx
│   │   │   ├── EmptyMatchState.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── CraqueCard.tsx
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── PersonalInfoForm.tsx
│   │   │   ├── PlayerStatsForm.tsx
│   │   │   ├── BioSection.tsx
│   │   │   └── DangerZone.tsx
│   │   ├── groups/
│   │   │   ├── GroupCard.tsx
│   │   │   ├── EmptyGroupsState.tsx
│   │   │   ├── GroupHeader.tsx
│   │   │   ├── MatchList.tsx
│   │   │   ├── MembersList.tsx
│   │   │   └── AboutSection.tsx
│   │   └── matches/
│   │       ├── MatchHeader.tsx
│   │       ├── LocationCard.tsx
│   │       ├── ParticipantsList.tsx
│   │       ├── ActionCard.tsx
│   │       ├── VotingSection.tsx
│   │       └── EmptyParticipantsState.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorState.tsx
│       └── Breadcrumbs.tsx
│
└── lib/
    ├── api/
    │   └── player/
    │       ├── dashboard.ts          # API calls para dashboard
    │       ├── profile.ts            # API calls para perfil
    │       ├── groups.ts             # API calls para grupos
    │       └── matches.ts            # API calls para partidas
    └── types/
        └── player.ts                 # TypeScript interfaces

```

### 3. Padrões de Código

#### Custom Hooks Pattern
```typescript
// Exemplo: useDashboardData.ts
export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Lógica de busca
  };

  return { data, loading, error, refetch: fetchDashboardData };
}
```

#### Component Pattern
```typescript
// Exemplo: StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  loading?: boolean;
}

export function StatsCard({ title, value, icon, loading }: StatsCardProps) {
  if (loading) return <StatsCardSkeleton />;
  
  return (
    <div className="...">
      {/* UI */}
    </div>
  );
}
```

### 4. Estados Visuais Padronizados

Cada tela/componente deve ter estados claros:
- **Loading**: Skeleton ou spinner
- **Empty**: Estado vazio com call-to-action
- **Error**: Mensagem de erro com ação de retry
- **Success**: Conteúdo normal

### 5. Preparação para Supabase

- Usar variáveis de ambiente para configuração
- Funções de API isoladas e reutilizáveis
- Tratamento de erros consistente
- Tipagem forte para respostas da API

## Plano de Execução

### Fase 1: Estrutura Base
1. Criar estrutura de pastas
2. Criar tipos TypeScript compartilhados
3. Criar componentes base (Loading, Error, etc.)

### Fase 2: Dashboard
1. Extrair lógica para `useDashboardData`
2. Criar componentes:
   - `StatsCard`
   - `NextMatchCard`
   - `EmptyMatchState`
   - `CraqueCard`
3. Refatorar `dashboard/page.tsx`

### Fase 3: Perfil
1. Extrair lógica para `useUserProfile`
2. Criar componentes:
   - `ProfileHeader`
   - `PersonalInfoForm`
   - `PlayerStatsForm`
   - `BioSection`
   - `DangerZone`
3. Refatorar `perfil/page.tsx`

### Fase 4: Grupos (Lista)
1. Extrair lógica para `useUserGroups`
2. Criar componentes:
   - `GroupCard`
   - `EmptyGroupsState`
3. Refatorar `grupos/page.tsx`

### Fase 5: Grupo (Detalhes - Modo Player)
1. Extrair lógica para `useGroupDetails`
2. Criar componentes:
   - `GroupHeader`
   - `MatchList`
   - `MembersList`
   - `AboutSection`
3. Refatorar `grupos/[id]/page.tsx` (APENAS visualização player)

### Fase 6: Partida (Detalhes - Modo Player)
1. Extrair lógica para `useMatchDetails`
2. Criar componentes:
   - `MatchHeader`
   - `LocationCard`
   - `ParticipantsList`
   - `ActionCard`
   - `VotingSection`
3. Refatorar `partidas/[id]/page.tsx` (APENAS ações de player)

### Fase 7: Testes e Ajustes
1. Testar todas as telas refatoradas
2. Verificar que nenhuma funcionalidade foi alterada
3. Garantir que estados vazios/loading/erro funcionam
4. Validar responsividade

## Restrições

### O que NÃO fazer:
- ❌ Alterar layout visual
- ❌ Criar novas rotas
- ❌ Alterar estrutura do banco
- ❌ Modificar funcionalidades administrativas
- ❌ Antecipar features futuras (Pacote 3 ou 4)
- ❌ Alterar regras de negócio
- ❌ Conectar novas tabelas

### O que FAZER:
- ✅ Separar componentes de UI
- ✅ Extrair lógica para hooks
- ✅ Padronizar estados (loading, empty, error)
- ✅ Melhorar organização do código
- ✅ Adicionar tipagem TypeScript
- ✅ Preparar para integração Supabase
- ✅ Manter exatamente a mesma funcionalidade

## Checklist de Qualidade

Para cada tela refatorada:
- [ ] Código dividido em componentes reutilizáveis
- [ ] Lógica de dados em custom hooks
- [ ] Estados de loading, empty e error implementados
- [ ] Tipagem TypeScript completa
- [ ] Nenhuma alteração visual perceptível
- [ ] Todas as funcionalidades funcionando
- [ ] Código mais fácil de manter
- [ ] Preparado para integração Supabase

## Entrega Esperada

- Código mais limpo e organizado
- Componentes reutilizáveis
- Hooks de dados isolados
- Estados visuais claros
- Tipagem forte
- Nenhuma mudança funcional para o usuário final
- Base sólida para futuras integrações
