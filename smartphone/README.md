# 📱 Smartphone FiveM — Agência Soluções Digitais

**Versão:** 1.0.0 (Fase 1 — Infraestrutura)  
**Stack:** React 18 + Vite + Tailwind + Zustand + Node.js + oxmysql  
**Framework:** vRP

---

## ⚡ Instalação Rápida

### 1. Copiar o resource
```
Copie a pasta "smartphone" inteira para:
C:\GTA-RP-BASE-DE-DADOS\resources\[smartphone]\smartphone\
```

### 2. Build do front-end (só na primeira vez ou quando editar o React)
```bash
cd C:\GTA-RP-BASE-DE-DADOS\resources\[smartphone]\smartphone\web
npm install
npm run build
```

### 3. Adicionar no server.cfg
```
ensure oxmysql
ensure smartphone
```

### 4. Dar o item "celular" para o jogador (SQL)
```sql
UPDATE vrp_user_data 
SET dvalue = REPLACE(dvalue, '"inventory":{}', '"inventory":{"1":{"item":"celular","amount":1}}')
WHERE user_id = SEU_USER_ID AND dkey = 'vRP:datatable';
```

### 5. Testar
- Entrar no servidor
- Apertar **M** (ou digitar `/phone` no chat)
- O celular deve abrir com a tela inicial

---

## 🏗️ Estrutura do Projeto

```
smartphone/
├── fxmanifest.lua          ← Manifesto FiveM
├── client.lua              ← Bridge Lua (NUI ↔ Server)
├── config.json             ← Configurações
├── server/
│   ├── main.js             ← Backend (router + database + handlers)
│   └── modules/            ← 1 arquivo por app (futuro)
├── web/
│   ├── dist/               ← Build final (NUI carrega daqui)
│   ├── src/
│   │   ├── App.jsx         ← Root component
│   │   ├── main.jsx        ← Entry point
│   │   ├── index.css       ← Estilos + Tailwind
│   │   ├── store/
│   │   │   └── usePhone.js ← Estado global (Zustand)
│   │   ├── hooks/
│   │   │   ├── useNui.js   ← Comunicação NUI
│   │   │   └── usePusher.js← Eventos tempo real
│   │   ├── components/
│   │   │   ├── PhoneShell   ← Frame do celular
│   │   │   ├── HomeScreen   ← Grid de apps
│   │   │   ├── StatusBar    ← Barra superior
│   │   │   ├── AppHeader    ← Header dentro dos apps
│   │   │   └── AppRouter    ← Roteador de apps
│   │   └── apps/
│   │       ├── Calculator   ← ✅ Funcionando
│   │       └── PingTest     ← ✅ Teste de conexão
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── assets/                 ← Ícones, sons, wallpapers (futuro)
```

---

## 🔌 Pipeline de Comunicação

```
React (NUI) → fetch("http://smartphone/backend")
    → client.lua RegisterNUICallback('backend')
        → TriggerServerEvent('smartphone:backend:req')
            → server/main.js processa
                → oxmysql (banco de dados)
            → TriggerClientEvent('smartphone:backend:res')
        → callback retorna
    → React recebe resposta
```

---

## 🧪 Fase 1 — O que está pronto

- [x] React 18 + Vite + Tailwind + Zustand
- [x] client.lua com keybind M e bridge NUI
- [x] server/main.js com router de handlers
- [x] Criação automática de tabelas no banco
- [x] Hook useNui (comunicação React → server)
- [x] Hook usePusher (eventos tempo real)
- [x] PhoneShell com frame iPhone + Dynamic Island
- [x] HomeScreen com grid de 20 apps
- [x] StatusBar (relógio, bateria, sinal)
- [x] AppRouter com navegação e "voltar"
- [x] App Calculator (funcional, sem backend)
- [x] App PingTest (testa toda a pipeline)
- [x] Modo dev (funciona no browser com `npm run dev`)

---

## 🛠️ Desenvolvimento

### Rodar no browser (dev mode)
```bash
cd web
npm run dev
# Abre http://localhost:3000 — celular aparece automático
```

### Build para FiveM
```bash
cd web
npm run build
# Depois no F8: restart smartphone
```

### Adicionar novo app
1. Criar arquivo em `web/src/apps/MeuApp.jsx`
2. Registrar em `web/src/components/AppRouter.jsx`
3. (Opcional) Registrar handlers em `server/main.js`
4. Build + restart

---

## 📋 Próximas Fases

- **Fase 2:** Notes + Yellow Pages (CRUD simples com banco)
- **Fase 3:** Contacts + SMS (comunicação entre jogadores)
- **Fase 4:** Bank (saldo, PIX, transferência)
- **Fase 5:** WhatsApp (chat, grupos, mídia)
- **Fase 6:** Instagram + Twitter (redes sociais)
- **Fase 7:** Casino, Tinder, OLX, Tor, demais apps
- **Fase 8:** Polimento e lançamento

---

*Criado por BC — Agência Soluções Digitais — Fevereiro 2026*
