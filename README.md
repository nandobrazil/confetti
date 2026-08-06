# 🎉 Confetti

Site de confirmação de presença (RSVP) para festa de aniversário. Landing page animada com contagem regressiva, formulário de RSVP com acompanhantes e painel administrativo completo.

**Stack**: SvelteKit 2 (Svelte 5) · TypeScript · TailwindCSS 4 · SQLite + Drizzle ORM · Docker

## Funcionalidades

- **Landing page** — hero animado, contagem regressiva, cards do evento (quando/onde/dress code/observações), FAQ, copy divertida. Tudo editável pelo painel.
- **RSVP** — nome, sim/não, acompanhantes (com limite configurável e nome de cada um), restrições alimentares, comentários. Animação de confete no sucesso.
- **Painel admin** (`/admin`) — dashboard com totais e gráfico de confirmações acumuladas; lista de convidados com busca, filtro, ordenação, edição e exclusão; exportação CSV e Excel; edição de todos os dados do evento; limite de acompanhantes; encerrar confirmações.
- **Segurança** — senha com Argon2id, sessões com token hasheado (SHA-256) e cookie httpOnly, área admin responde 404 para não autenticados, validação backend com Zod, rate limit em POSTs, CSRF via checagem de origin do SvelteKit, SQL parametrizado via Drizzle.

## Desenvolvimento local

```bash
npm install
npm run db:migrate
ADMIN_PASSWORD=minha-senha npm run db:seed   # cria o usuário admin
npm run dev
```

- Site: http://localhost:5173
- Admin: http://localhost:5173/admin/login (usuário `admin`, senha a do seed)

O banco fica em `./data/confetti.db` (gitignored). `DATABASE_URL` muda o caminho.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | não | Caminho do arquivo SQLite (padrão `./data/confetti.db`) |
| `ORIGIN` | produção | URL pública (ex.: `https://festa.oconde.dev`) — necessária para o CSRF check |
| `ADMIN_USERNAME` | não | Usuário admin criado pelo seed (padrão `admin`) |
| `ADMIN_PASSWORD` | produção | Senha do admin; o seed roda a cada boot e só cria se não existir |

## Deploy na VPS (k3s, padrão titan/europa)

1. **DNS**: aponte `festa.oconde.dev` para a VPS (proxy Cloudflare como nos outros sites).
2. **Secret** (uma vez, na VPS):
   ```bash
   kubectl create namespace confetti --dry-run=client -o yaml | kubectl apply -f -
   kubectl create secret generic confetti-env -n confetti \
     --from-literal=ORIGIN=https://festa.oconde.dev \
     --from-literal=ADMIN_USERNAME=admin \
     --from-literal=ADMIN_PASSWORD='uma-senha-forte'
   ```
3. **Sync + deploy** (da máquina local):
   ```bash
   rsync -az --delete --exclude node_modules --exclude .svelte-kit --exclude data --exclude build \
     ./ vps:/opt/confetti/src/
   ssh vps 'bash /opt/confetti/src/infra/deploy.sh'
   ```

O `deploy.sh` builda a imagem na própria VPS, importa no k3s e aplica `infra/confetti.yaml` (Deployment + Service + Ingress com TLS via cert-manager). O banco fica no PVC `confetti-data`.

### Alternativa: Docker Compose

Para rodar fora do k3s: `cp .env.example .env`, edite, e `docker compose up -d` (porta `127.0.0.1:3018`).

## Backup

O banco é um único arquivo SQLite:

```bash
kubectl exec -n confetti deploy/app -- sh -c 'sqlite3 /app/data/confetti.db ".backup /app/data/backup.db"' \
  && kubectl cp confetti/$(kubectl get pod -n confetti -l app=app -o name | cut -d/ -f2):/app/data/backup.db ./backup.db
```

## Estrutura

```
src/
  lib/
    actions/reveal.ts        # scroll-reveal (IntersectionObserver)
    components/              # Countdown, Confetti, FaqItem, TrendChart
    server/
      db/                    # conexão + schema Drizzle (event, guests, companions, admins, sessions)
      auth.ts                # sessões (token hasheado, cookie httpOnly, sliding expiration)
      event.ts               # singleton de configuração do evento
      export.ts              # linhas compartilhadas por CSV/XLSX
      rate-limit.ts          # sliding window em memória
  routes/
    +page.svelte             # landing
    rsvp/                    # formulário + action
    admin/                   # login, dashboard, convidados, evento, exports, logout
  hooks.server.ts            # auth + gate do /admin (404) + rate limit
scripts/migrate.ts, seed.ts  # rodam no boot do container
infra/confetti.yaml, deploy.sh
```
