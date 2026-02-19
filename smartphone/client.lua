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

-- Carregar config
local configRaw = LoadResourceFile(GetCurrentResourceName(), 'config.json')
local config = json.decode(configRaw) or {}

-- ============================================
-- ITEM CHECK: Verificar se jogador tem celular
-- ============================================

function hasPhoneItem()
    if not config.requireItem then return true end

    -- vRP: verificar se tem item no inventário
    local ok, result = pcall(function()
        -- Método 1: vRP export
        if exports.vrp and exports.vrp.hasItem then
            return exports.vrp.hasItem(config.item or 'celular', 1)
        end
    end)

    if ok and result then return true end

    -- Método 2: vRP tunnel (se disponível)
    local ok2, result2 = pcall(function()
        if vRP and vRP.getInventoryItemAmount then
            local amount = vRP.getInventoryItemAmount({config.item or 'celular'})
            return amount and amount >= 1
        end
    end)

    if ok2 and result2 then return true end

    -- Se requireItem = true mas nenhum método funciona, bloqueia
    -- (evita que jogador use celular sem item quando config exige)
    return false
end

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
    if not hasPhoneItem() then
        -- Notificar jogador que precisa do item
        TriggerEvent('chatMessage', '', {255, 59, 48}, 'Você não tem um celular!')
        return
    end
    isOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = 'phone:open'
    })
    if not inCall then
        doPhoneAnimation('text_in')
        SetTimeout(250, function()
            newPhoneProp()
        end)
    end
    print('[SMARTPHONE] Celular aberto')
end

function closePhone()
    if not isOpen then return end
    isOpen = false
    SendNUIMessage({
        type = 'phone:close'
    })
    SetNuiFocus(false, false)
    if not inCall then
        doPhoneAnimation('text_out')
        SetTimeout(400, function()
            deletePhoneProp()
        end)
    end
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
    -- Se receber chamada com celular fechado, abre automaticamente
    if event == 'CALL_INCOMING' and not isOpen then
        openPhone()
        -- Pequeno delay pra garantir que NUI carregou
        SetTimeout(300, function()
            SendNUIMessage({
                type = 'pusher',
                event = event,
                payload = payload
            })
        end)
        return
    end

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

-- ============================================
-- NUI CALLBACK: Ações do client (gameplay)
-- ============================================

local phoneProp = nil
local inCall = false

function newPhoneProp()
    deletePhoneProp()
    local ped = PlayerPedId()
    local model = GetHashKey('prop_amb_phone')
    RequestModel(model)
    local timeout = 0
    while not HasModelLoaded(model) and timeout < 100 do
        Wait(10)
        timeout = timeout + 1
    end
    phoneProp = CreateObject(model, 0.0, 0.0, 0.0, true, true, false)
    local bone = GetPedBoneIndex(ped, 28422)
    AttachEntityToEntity(phoneProp, ped, bone, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, true, true, false, false, 2, true)
end

function deletePhoneProp()
    if phoneProp and DoesEntityExist(phoneProp) then
        DeleteObject(phoneProp)
        phoneProp = nil
    end
end

function doPhoneAnimation(animName)
    local ped = PlayerPedId()
    if animName == 'text_in' then
        RequestAnimDict('cellphone@')
        while not HasAnimDictLoaded('cellphone@') do Wait(10) end
        TaskPlayAnim(ped, 'cellphone@', 'cellphone_text_in', 3.0, -1, -1, 50, 0, false, false, false)
    elseif animName == 'text_out' then
        StopAnimTask(ped, 'cellphone@', 'cellphone_text_in', 2.5)
    elseif animName == 'call' then
        RequestAnimDict('cellphone@')
        while not HasAnimDictLoaded('cellphone@') do Wait(10) end
        TaskPlayAnim(ped, 'cellphone@', 'cellphone_call_listen_base', 3.0, -1, -1, 49, 0, false, false, false)
    end
end

RegisterNUICallback('client:action', function(data, cb)
    local action = data.action

    if action == 'getPlayerPosition' then
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        cb({ x = coords.x, y = coords.y, z = coords.z })

    elseif action == 'startCallAnim' then
        inCall = true
        doPhoneAnimation('call')
        cb({ ok = true })

    elseif action == 'stopCallAnim' then
        inCall = false
        if isOpen then
            doPhoneAnimation('text_in')
        else
            doPhoneAnimation('text_out')
            deletePhoneProp()
        end
        cb({ ok = true })

    elseif action == 'playSound' then
        local sound = data.sound or 'default'
        if sound == 'notification' then
            PlaySoundFrontend(-1, 'Text_Arrive_Tone', 'Phone_SoundSet_Default', false)
        elseif sound == 'ring' then
            PlaySoundFrontend(-1, 'Remote_Ring', 'Phone_SoundSet_Default', false)
        elseif sound == 'dial' then
            PlaySoundFrontend(-1, 'Dial_and_Remote_Ring', 'Phone_SoundSet_Default', false)
        elseif sound == 'hangup' then
            PlaySoundFrontend(-1, 'Hang_Up', 'Phone_SoundSet_Default', false)
        elseif sound == 'camera' then
            PlaySoundFrontend(-1, 'Camera_Shoot', 'Phone_SoundSet_Default', false)
        else
            PlaySoundFrontend(-1, 'Text_Arrive_Tone', 'Phone_SoundSet_Default', false)
        end
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
