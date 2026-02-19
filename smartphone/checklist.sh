# CHECKLIST PRÉ-ENTREGA — Smartphone FiveM
# Rodar ANTES de empacotar qualquer fase.
# Se qualquer item falhar, NÃO ENTREGAR até corrigir.

echo "========================================="
echo "CHECKLIST PRÉ-ENTREGA"
echo "========================================="
echo ""

ERRORS=0

# 1. ZERO PENDÊNCIAS NO CÓDIGO
echo "--- 1. Zero pendências ---"
TODOS=$(grep -rn 'TODO\|FIXME\|HACK\|XXX' \
  /home/claude/smartphone/server/ \
  /home/claude/smartphone/client.lua \
  /home/claude/smartphone/web/src/ 2>/dev/null | grep -v node_modules | grep -v "placeholder=" | wc -l)
if [ "$TODOS" -gt 0 ]; then
  echo "  ❌ FALHOU: $TODOS pendências encontradas:"
  grep -rn 'TODO\|FIXME\|HACK\|XXX' \
    /home/claude/smartphone/server/ \
    /home/claude/smartphone/client.lua \
    /home/claude/smartphone/web/src/ 2>/dev/null | grep -v node_modules | grep -v "placeholder="
  ERRORS=$((ERRORS+1))
else
  echo "  ✅ Nenhuma pendência"
fi
echo ""

# 2. TODO APP COM BACKEND PERSISTE DADOS
echo "--- 2. Persistência de dados ---"
for app in /home/claude/smartphone/web/src/apps/*.jsx; do
  name=$(basename $app .jsx)
  # Calculator não precisa persistir
  if [ "$name" = "Calculator" ]; then continue; fi
  
  uses=$(grep -c "fetchBackend" "$app" 2>/dev/null || echo "0")
  if [ "$uses" -eq 0 ] 2>/dev/null; then
    echo "  ❌ FALHOU: $name.jsx NÃO usa fetchBackend (dados não persistem!)"
    ERRORS=$((ERRORS+1))
  else
    echo "  ✅ $name.jsx usa fetchBackend ($uses chamadas)"
  fi
done
echo ""

# 3. TODO PUSHER ENVIADO TEM LISTENER
echo "--- 3. Pusher events pareados ---"
SENT=$(grep -oP "pushToPlayer\(.*?,\s*'([A-Z_]+)'" /home/claude/smartphone/server/main.js | grep -oP "'[A-Z_]+'" | sort -u)
SENT2=$(grep -oP "pushToAll\(.*'([A-Z_]+)'" /home/claude/smartphone/server/main.js | grep -oP "'[A-Z_]+'" | sort -u)
ALL_SENT=$(echo -e "$SENT\n$SENT2" | sort -u)

for event in $ALL_SENT; do
  clean=$(echo $event | tr -d "'")
  listened=$(grep -r "usePusherEvent.*$clean\|onPusher.*$clean" /home/claude/smartphone/web/src/ 2>/dev/null | wc -l)
  if [ "$listened" -eq 0 ]; then
    # SERVICE_CALL é exceção (handled por scripts de job, não React)
    if [ "$clean" = "SERVICE_CALL" ]; then
      echo "  ⚠️  $clean enviado mas não escutado no React (OK - é pra scripts de job)"
    else
      echo "  ❌ FALHOU: $clean enviado mas NINGUÉM escuta no React!"
      ERRORS=$((ERRORS+1))
    fi
  else
    echo "  ✅ $clean: enviado e escutado"
  fi
done
echo ""

# 4. BUILD COMPILA SEM ERROS
echo "--- 4. Build ---"
BUILD=$(cd /home/claude/smartphone/web && npm run build 2>&1)
if echo "$BUILD" | grep -q "✓ built"; then
  SIZE=$(echo "$BUILD" | grep "index-.*\.js" | awk '{print $3, $4}')
  echo "  ✅ Build OK ($SIZE)"
else
  echo "  ❌ FALHOU: Build com erros"
  echo "$BUILD" | tail -10
  ERRORS=$((ERRORS+1))
fi
echo ""

# 5. SONS CONECTADOS
echo "--- 5. Sons ---"
SOUNDS_CLIENT=$(grep -c "PlaySoundFrontend" /home/claude/smartphone/client.lua 2>/dev/null)
SOUNDS_REACT=$(grep -r "playSound" /home/claude/smartphone/web/src/ 2>/dev/null | wc -l)
if [ "$SOUNDS_CLIENT" -gt 0 ] && [ "$SOUNDS_REACT" -gt 0 ]; then
  echo "  ✅ Sons: $SOUNDS_CLIENT no client, $SOUNDS_REACT chamadas no React"
else
  echo "  ❌ FALHOU: Sons desconectados (client=$SOUNDS_CLIENT, react=$SOUNDS_REACT)"
  ERRORS=$((ERRORS+1))
fi
echo ""

# 6. CROSS-APP NAVIGATION FUNCIONA
echo "--- 6. Navegação cross-app ---"
NAV=$(grep -r "onNavigate" /home/claude/smartphone/web/src/apps/ 2>/dev/null | wc -l)
HANDLE=$(grep -c "handleNavigate" /home/claude/smartphone/web/src/components/PhoneShell.jsx 2>/dev/null)
echo "  Apps usando onNavigate: $NAV refs"
echo "  PhoneShell handleNavigate: $HANDLE refs"
if [ "$NAV" -gt 0 ] && [ "$HANDLE" -gt 0 ]; then
  echo "  ✅ OK"
else
  echo "  ⚠️  Verificar manualmente"
fi
echo ""

# RESULTADO FINAL
echo "========================================="
if [ "$ERRORS" -eq 0 ]; then
  echo "✅ APROVADO — Pode entregar!"
else
  echo "❌ REPROVADO — $ERRORS problemas encontrados. CORRIGIR ANTES DE ENTREGAR."
fi
echo "========================================="
