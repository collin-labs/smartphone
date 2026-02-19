--[[
    Smartphone - Client Bridge
    Agência Soluções Digitais
    
    Responsabilidades:
    1. Keybind M para abrir/fechar celular
    2. Bridge NUI ↔ Server (backend:req / backend:res)
    3. Listener de pusher (server → client → NUI)
    4. Verificação de item no inventário
]]

local isOpen = false
local pendingCallbacks = {}
local callbackId = 0

-- ============================================
-- KEYBIND: Abrir/Fechar celular com M
-- ============================================

RegisterCommand('smartphone:toggle', function()
    if isOpen then
        closePhone()
    else
        openPhone()
    end
end, false)

RegisterKeyMapping('smartphone:toggle', 'Abrir/Fechar Celular', 'keyboard', 'M')

function openPhone()
    if isOpen then return end
    -- TODO: Verificar se jogador tem item "celular" via vRP
    -- Por enquanto, abre direto para testes
    isOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = 'phone:open'
    })
    print('[SMARTPHONE] Celular aberto')
end

function closePhone()
    if not isOpen then return end
    isOpen = false
    -- Primeiro avisa o React (enquanto NUI ainda tem foco)
    SendNUIMessage({
        type = 'phone:close'
    })
    -- Depois tira o foco do NUI
    SetNuiFocus(false, false)
    print('[SMARTPHONE] Celular fechado')
end

-- ============================================
-- NUI CALLBACK: Fechar celular pelo botão
-- ============================================

RegisterNUICallback('phone:close', function(data, cb)
    closePhone()
    cb({ ok = true })
end)

-- ============================================
-- NUI CALLBACK: Backend proxy (NUI → Server)
-- ============================================
-- O React chama fetch("http://smartphone/backend", { body: { member, args } })
-- Este callback recebe, gera um ID, manda pro server, e espera a resposta

RegisterNUICallback('backend', function(data, cb)
    callbackId = callbackId + 1
    local id = callbackId
    local member = data.member
    local args = data.args or {}

    -- Guardar callback pendente
    pendingCallbacks[id] = cb

    -- Enviar pro server
    TriggerServerEvent('smartphone:backend:req', id, member, args)
end)

-- ============================================
-- SERVER → CLIENT: Resposta do backend
-- ============================================

RegisterNetEvent('smartphone:backend:res')
AddEventHandler('smartphone:backend:res', function(id, result)
    local cb = pendingCallbacks[id]
    if cb then
        cb(result)
        pendingCallbacks[id] = nil
    end
end)

-- ============================================
-- SERVER → CLIENT: Pusher (notificações tempo real)
-- ============================================

RegisterNetEvent('smartphone:pusher')
AddEventHandler('smartphone:pusher', function(event, payload)
    -- Repassa diretamente pro NUI (React)
    SendNUIMessage({
        type = 'pusher',
        event = event,
        payload = payload
    })
end)

-- ============================================
-- NUI CALLBACK: Ações do client (gameplay)
-- ============================================

RegisterNUICallback('client:action', function(data, cb)
    local action = data.action

    if action == 'getPlayerPosition' then
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        cb({ x = coords.x, y = coords.y, z = coords.z })

    elseif action == 'copyToClipboard' then
        -- FiveM não tem clipboard direto, mas podemos usar chat
        cb({ ok = true })

    elseif action == 'playSound' then
        -- TODO: Tocar som local
        cb({ ok = true })

    else
        cb({ error = 'unknown_action' })
    end
end)

-- ============================================
-- ESC fecha o celular (detectado no Lua, não no JS)
-- FiveM intercepta ESC antes do JavaScript,
-- então precisamos detectar aqui e avisar o React
-- ============================================

CreateThread(function()
    while true do
        Wait(0)
        if isOpen then
            -- Bloqueia ESC de abrir pause menu
            DisableControlAction(0, 200, true)
            DisableControlAction(0, 322, true) -- INPUT_MP_CANCEL (outro binding do ESC)

            -- Detecta ESC pressionado
            if IsDisabledControlJustPressed(0, 200) or IsDisabledControlJustPressed(0, 322) then
                print('[SMARTPHONE] ESC detectado! Fechando celular...')
                closePhone()
            end
        end
    end
end)

-- ============================================
-- DEBUG: Comando /phone para testes
-- ============================================

RegisterCommand('phone', function()
    if isOpen then
        closePhone()
    else
        openPhone()
    end
end, false)

print('[SMARTPHONE] Client loaded - Keybind: M | Command: /phone')
