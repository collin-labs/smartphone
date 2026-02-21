# 📱 Smartphone FiveM — Agência Soluções Digitais

**Versão:** 2.0.0 (Fase 3B — Spotify com Áudio 3D)  
**Stack:** React 18 + Vite + Node.js + oxmysql  
**Framework:** vRP (compatível com outros)  
**Última atualização:** 21/02/2026

---

## ⚡ Instalação Rápida

### 1. Dependências obrigatórias
- **oxmysql** — Queries MySQL (todo servidor FiveM já tem)
- **MariaDB / MySQL** — Banco de dados

### 2. Dependências opcionais
- **xsound** — Áudio 3D: jogadores próximos ouvem música "vazando" do celular
  - Download: https://github.com/Xogy/xsound
  - Sem ele, o celular funciona normal (áudio só pro jogador)

### 3. Copiar o resource
```
Copie a pasta "smartphone" para:
resources/[smartphone]/smartphone/
```

### 4. Banco de dados
Rode o arquivo `smartphone.sql` no HeidiSQL (ou cliente MySQL de sua preferência).
Isso cria todas as tabelas + dados de exemplo.

### 5. server.cfg
```
ensure oxmysql
ensure xsound        # Opcional — áudio 3D
ensure smartphone
```

### 6. Dar o item "celular" para o jogador (SQL)
```sql
UPDATE vrp_user_data 
SET dvalue = REPLACE(dvalue, '"inventory":{}', '"inventory":{"1":{"item":"celular","amount":1}}')
WHERE user_id = SEU_USER_ID AND dkey = 'vRP:datatable';
```

### 7. Testar
- Entrar no servidor
- Apertar **M** (ou digitar `/phone` no chat)
- O celular deve abrir com a tela inicial

---

## 📱 Apps Disponíveis (34 apps)

### ✅ Funcionais com backend real (11 apps)
| App | Telas | Recurso Real |
|-----|-------|-------------|
| Instagram | 5 (feed, explore, reels, profile, post) | Posts, likes, comentários |
| WhatsApp | 4 (chats, chat, contacts, group) | Chat tempo real, grupos |
| TikTok | 4 (feed, discover, inbox, profile) | Vídeo real via iframe YouTube |
| YouTube | 5 (home, player, shorts, favorites, search) | Vídeo real via iframe YouTube |
| LinkedIn | 3 (feed, network, profile) | Posts, conexões, perfil profissional |
| Spotify | 5 (home, search, library, playlist, player) | Áudio real via YouTube + xSound 3D |
| iFood | 4 (restaurants, menu, cart, orders) | Pedidos, entregas, tracking |
| Calculator | 1 | Calculadora funcional |
| Minesweeper | 1 | Campo minado jogável |
| Truco | 1 | Truco paulista contra IA |
| Notes | 2 (list, editor) | Bloco de notas persistente |

### 🟡 Com layout V0 e handlers (prontos pra integração — 21 apps)
Bank, Blaze, Camera, Contacts, Discord, FleecaBank, Gallery, Grindr,
Marketplace, PayPal, Phone, Settings, SMS, Tinder, Tor, Twitter/X,
Uber, Waze, WeazelNews, YellowPages, AppStore

### 🔵 Layout V0 pronto (aguardando fase futura — 2 apps)
Chrome/Browser (769 linhas), Twitch (1003 linhas)

---

## 🏗️ Estrutura do Projeto

```
smartphone/
├── fxmanifest.lua              ← Manifesto FiveM
├── client.lua                  ← Bridge Lua (NUI ↔ Server) + xSound 3D
├── config.json                 ← Configurações (requireItem, etc)
├── smartphone.sql              ← Banco de dados completo
├── server/
│   └── main.js                 ← Backend: 157 handlers + cache + rate limit
├── web/
│   ├── dist/                   ← Build compilado (FiveM carrega DAQUI)
│   │   ├── index.html
│   │   └── assets/             ← JS + CSS minificados
│   ├── src/
│   │   ├── main.jsx            ← Entry point
│   │   ├── index.css           ← Estilos globais
│   │   ├── hooks/
│   │   │   └── useNui.js       ← fetchBackend + fetchClient + mocks
│   │   ├── components/
│   │   │   ├── PhoneShell.jsx  ← Frame do celular + imports + switch
│   │   │   ├── HomeScreen.jsx  ← Grid de apps + navegação por páginas
│   │   │   └── data.js         ← Lista de apps (ícones, IDs, cores)
│   │   └── apps/               ← 1 arquivo JSX por app (11 funcionais)
│   ├── package.json
│   └── vite.config.js
└── web/dist/apps/              ← Ícones dos apps (.webp/.png)
```

---

## 🔌 Pipeline de Comunicação

```
React (NUI) → fetchBackend('handler_name', { dados })
    → client.lua RegisterNUICallback('backend')
        → TriggerServerEvent('smartphone:backend:req')
            → server/main.js registerHandler() processa
                → oxmysql (MariaDB/MySQL)
            → TriggerClientEvent('smartphone:backend:res')
        → callback retorna
    → React recebe resposta
```

### Spotify 3D (xSound)
```
Jogador dá play no Spotify
    → fetchBackend('spotify_play', { youtube_id })
        → server/main.js emitNet('smartphone:spotify:play')
            → client.lua recebe → TriggerServerEvent('spotify:sync')
                → server broadcast → todos os clients recebem
                    → client.lua de jogadores próximos
                        → xSound:PlayUrlPos() (áudio 3D posicional)
```

---

## 🎵 Features de Destaque

### Vídeo Real no Celular
- **YouTube:** Jogador assiste vídeos de verdade dentro do GTA (iframe YouTube)
- **TikTok:** Feed com vídeos reais (YouTube Shorts embeddado)
- **Spotify:** Música real tocando (YouTube hidden iframe como fonte de áudio)

### Áudio 3D (xSound)
- Jogador ouvindo Spotify → jogadores próximos (até 30m) ouvem o som "vazando"
- Som diminui com a distância (3D posicional)
- Funciona com URLs do YouTube

### Conteúdo Curado
- Admin controla quais vídeos/músicas estão disponíveis (tabelas no banco)
- Thumbnails reais do YouTube: `https://img.youtube.com/vi/{ID}/mqdefault.jpg`
- Seeds com conteúdo brasileiro (Racionais, Anitta, Matuê, Legião Urbana, etc)

---

## 🛠️ Desenvolvimento

### Build para FiveM (OBRIGATÓRIO após editar JSX)
```bash
cd smartphone/web
npm install          # Só na primeira vez
npm run build        # Gera web/dist/
```
⚠️ **IMPORTANTE:** FiveM carrega `web/dist/`, NÃO `web/src/`. Se você editar algum `.jsx` e não rodar `npm run build`, as mudanças NÃO aparecem no jogo.

### Rodar no browser (dev mode)
```bash
cd smartphone/web
npm run dev
# Abre http://localhost:3000 — celular aparece com dados mock
```

### Adicionar novo app
1. Criar `web/src/apps/MeuApp.jsx`
2. Adicionar import + case no `web/src/components/PhoneShell.jsx`
3. Adicionar entrada no `web/src/components/data.js`
4. (Opcional) Registrar handlers no `server/main.js`
5. (Opcional) Adicionar mocks no `web/src/hooks/useNui.js`
6. `npm run build` → `ensure smartphone`

---

## 📊 Números do Projeto

| Métrica | Valor |
|---------|-------|
| Apps totais | 34 |
| Apps funcionais com backend | 11 |
| Handlers no server/main.js | 157 |
| Telas V0 pixel-perfect | 34 (15.737 linhas TSX) |
| Tabelas no banco | 50+ |
| Seeds de exemplo | 600+ registros |
| Playlists Spotify | 10 (57 músicas com youtube_id real) |

---

## 🗺️ Roadmap

```
FASE 1 ─── Fundação & Correções ────────────── ✅ CONCLUÍDA
FASE 2 ─── LinkedIn + YouTube + TikTok Real ─── ✅ CONCLUÍDA
FASE 3 ─── Spotify Real + Áudio 3D ─────────── ✅ CONCLUÍDA
FASE 4 ─── Mídia Social Avançada ───────────── 🔲 PLANEJADA
   │  Câmera real (screenshot-basic), Instagram/WhatsApp com fotos reais
FASE 5 ─── Cinema & Experiências Coletivas ─── 🔲 PLANEJADA
   │  Cinema RP (Hypnonema), TV em bares, telão de eventos
FASE 6 ─── Polimento & Features Premium ────── 🔲 PLANEJADA
   │  Chrome, Twitch, Maps real, Notificações push, Ringtones
```

---

## 📋 Solução de Problemas

### Celular não abre
- Verificar se o jogador tem o item "celular" no inventário
- Verificar `config.json` → `requireItem: true/false`
- F8: `ensure smartphone` para recarregar

### Apps não carregam dados do banco
- Verificar se rodou o `smartphone.sql` no banco
- Verificar se `oxmysql` está rodando (`ensure oxmysql`)
- F8: verificar erros no console do servidor

### Música do Spotify não toca
- YouTube iframes precisam de internet no servidor
- Verificar se o vídeo não foi removido do YouTube
- Áudio 3D requer xSound: `ensure xsound`

### Mudanças no JSX não aparecem
- Rodar `npm run build` dentro de `smartphone/web/`
- FiveM carrega `web/dist/`, NÃO `web/src/`

---

*Desenvolvido por BC — Agência Soluções Digitais — Fevereiro 2026*
