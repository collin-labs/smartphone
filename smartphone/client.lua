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
        elseif sound == 'camera' or sound == 'photo' then
            PlaySoundFrontend(-1, 'Camera_Shoot', 'Phone_SoundSet_Default', false)
        else
            PlaySoundFrontend(-1, 'Text_Arrive_Tone', 'Phone_SoundSet_Default', false)
        end
        cb({ ok = true })

    elseif action == 'setWaypoint' then
        local x = tonumber(data.x) or 0.0
        local y = tonumber(data.y) or 0.0
        SetNewWaypoint(x, y)
        cb({ ok = true })

    elseif action == 'removeWaypoint' then
        SetWaypointOff()
        cb({ ok = true })

    elseif action == 'toggleFlashlight' then
        -- Toggle lanterna do jogador
        local ped = PlayerPedId()
        if IsFlashLightOn(ped) then
            SetFlashLightEnabled(ped, false)
        else
            SetFlashLightEnabled(ped, true)
        end
        cb({ ok = true })

    elseif action == 'takeScreenshot' then
        -- ============================================
        -- FASE 4: Câmera real (screenshot-basic + FiveManage)
        -- ============================================
        cb({ ok = true }) -- Responde imediato pro NUI

        if GetResourceState('screenshot-basic') ~= 'started' then
            SendNUIMessage({ type = 'screenshot:result', url = '' })
            print('[SMARTPHONE] screenshot-basic NÃO está rodando!')
            return
        end

        -- 1. Esconde o celular (pra não aparecer na foto)
        SendNUIMessage({ type = 'screenshot:hide' })
        Wait(250)

        -- 2. Captura a tela como base64
        exports['screenshot-basic']:requestScreenshot({encoding = 'jpg', quality = 0.85}, function(dataUri)
            -- 3. Mostra o celular de volta
            SendNUIMessage({ type = 'screenshot:show' })

            if not dataUri or dataUri == '' then
                SendNUIMessage({ type = 'screenshot:result', url = '' })
                print('[SMARTPHONE] Screenshot falhou!')
                return
            end

            -- 4. Envia pro server fazer upload (FiveManage/Fivemerr)
            TriggerServerEvent('smartphone:screenshot:upload', dataUri)
            print('[SMARTPHONE] Screenshot capturado! Enviando pro server...')
        end)

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
-- WAZE / GPS: Waypoints no mapa
-- ============================================

RegisterNUICallback('setWaypoint', function(data, cb)
    -- For now, set a waypoint at a random position (server can send coords later)
    -- In production, destination name → coords mapping would be server-side
    Citizen.CreateThread(function()
        -- Notify player
        SetNotificationTextEntry('STRING')
        AddTextComponentString('~b~GPS~w~: Rota definida para ~y~' .. (data.destination or 'destino'))
        DrawNotification(false, false)
    end)
    cb({ ok = true })
end)

RegisterNUICallback('removeWaypoint', function(data, cb)
    SetWaypointOff()
    cb({ ok = true })
end)

-- Blips do Uber
local uberBlips = {}

RegisterNetEvent('smartphone:blip')
AddEventHandler('smartphone:blip', function(data)
    local blipType = data.type or 'uber'
    -- Remove existing blip of same type
    if uberBlips[blipType] then
        RemoveBlip(uberBlips[blipType])
        uberBlips[blipType] = nil
    end
    -- For now, show notification (blip position would come from server with real coords)
    SetNotificationTextEntry('STRING')
    AddTextComponentString('~g~Uber~w~: ' .. (data.label or 'Localização'))
    DrawNotification(false, false)
end)

RegisterNetEvent('smartphone:removeBlip')
AddEventHandler('smartphone:removeBlip', function(blipType)
    if uberBlips[blipType] then
        RemoveBlip(uberBlips[blipType])
        uberBlips[blipType] = nil
    end
end)

RegisterNetEvent('smartphone:setWaypoint')
AddEventHandler('smartphone:setWaypoint', function(data)
    -- Server-side waypoint command
    SetNotificationTextEntry('STRING')
    AddTextComponentString('~b~GPS~w~: Navegando para ~y~' .. (data.destination or 'destino'))
    DrawNotification(false, false)
end)

RegisterNetEvent('smartphone:removeWaypoint')
AddEventHandler('smartphone:removeWaypoint', function()
    SetWaypointOff()
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

-- ============================================
-- FASE 4: Receber URL da foto do server
-- ============================================

RegisterNetEvent('smartphone:screenshot:result')
AddEventHandler('smartphone:screenshot:result', function(url)
    if url and url ~= '' then
        print('[SMARTPHONE] Foto uploaded: ' .. url)
    else
        print('[SMARTPHONE] Upload falhou ou sem API key')
    end
    SendNUIMessage({ type = 'screenshot:result', url = url or '' })
end)

print('[SMARTPHONE] Camera (screenshot-basic) loaded')

-- ============================================
-- SPOTIFY xSOUND 3D — Áudio propagado no mundo
-- ADICIONADO NO FINAL do client.lua (Fase 3B)
-- Se xsound NÃO estiver instalado, o celular funciona normal
-- (jogador ouve pelo NUI, mas outros não ouvem "vazando")
-- ============================================

local hasXSound = GetResourceState('xsound') == 'started'
local xSound = hasXSound and exports.xsound or nil
local mySpotifyYtId = nil
local nearbySpotify = {}

if not hasXSound then
    print('[SMARTPHONE] xSound NÃO encontrado - Spotify 3D DESATIVADO (áudio só pro jogador)')
    print('[SMARTPHONE] Para ativar: instale xsound e adicione ensure xsound no server.cfg')
end

-- ============================================
-- SERVER → CLIENT: Play/Toggle/Stop do Spotify
-- ============================================

RegisterNetEvent('smartphone:spotify:play')
AddEventHandler('smartphone:spotify:play', function(youtubeId)
    if not youtubeId or youtubeId == '' then return end
    mySpotifyYtId = youtubeId
    if hasXSound then
        TriggerServerEvent('smartphone:spotify:sync', youtubeId, 0.3)
        print('[SPOTIFY] Broadcasting 3D audio: ' .. youtubeId)
    end
end)

RegisterNetEvent('smartphone:spotify:toggle')
AddEventHandler('smartphone:spotify:toggle', function(playing)
    if not hasXSound then return end
    if not playing then
        TriggerServerEvent('smartphone:spotify:sync', nil, 0)
    elseif mySpotifyYtId then
        TriggerServerEvent('smartphone:spotify:sync', mySpotifyYtId, 0.3)
    end
end)

RegisterNetEvent('smartphone:spotify:stop')
AddEventHandler('smartphone:spotify:stop', function()
    mySpotifyYtId = nil
    if hasXSound then
        TriggerServerEvent('smartphone:spotify:sync', nil, 0)
    end
end)

-- ============================================
-- JOGADORES PRÓXIMOS: Ouvir música dos outros
-- (só funciona com xSound instalado)
-- ============================================

RegisterNetEvent('smartphone:spotify:nearby')
AddEventHandler('smartphone:spotify:nearby', function(playerId, youtubeId, volume)
    if not hasXSound then return end
    if playerId == GetPlayerServerId(PlayerId()) then return end

    local soundId = 'spfy_' .. playerId

    if not youtubeId or volume <= 0 then
        pcall(function() xSound:Destroy(soundId) end)
        nearbySpotify[playerId] = nil
        return
    end

    local targetPlayer = GetPlayerFromServerId(playerId)
    if targetPlayer == -1 then return end
    local targetPed = GetPlayerPed(targetPlayer)
    if not DoesEntityExist(targetPed) then return end

    local myPos = GetEntityCoords(PlayerPedId())
    local theirPos = GetEntityCoords(targetPed)
    local dist = #(myPos - theirPos)

    if dist > 50.0 then
        pcall(function() xSound:Destroy(soundId) end)
        nearbySpotify[playerId] = nil
        return
    end

    -- Mesma música, só atualiza posição
    if nearbySpotify[playerId] and nearbySpotify[playerId].youtubeId == youtubeId then
        pcall(function() xSound:Position(soundId, theirPos) end)
        return
    end

    pcall(function() xSound:Destroy(soundId) end)

    local url = 'https://www.youtube.com/watch?v=' .. youtubeId
    xSound:PlayUrlPos(soundId, url, volume, theirPos, false)
    xSound:Distance(soundId, 30.0)

    nearbySpotify[playerId] = { youtubeId = youtubeId, soundId = soundId }
end)

-- ============================================
-- THREAD: Atualizar posições dos sons 3D
-- ============================================

if hasXSound then
    CreateThread(function()
        while true do
            Wait(2000)
            for playerId, info in pairs(nearbySpotify) do
                local targetPlayer = GetPlayerFromServerId(playerId)
                if targetPlayer == -1 then
                    pcall(function() xSound:Destroy(info.soundId) end)
                    nearbySpotify[playerId] = nil
                else
                    local targetPed = GetPlayerPed(targetPlayer)
                    if DoesEntityExist(targetPed) then
                        local theirPos = GetEntityCoords(targetPed)
                        local myPos = GetEntityCoords(PlayerPedId())
                        if #(myPos - theirPos) > 50.0 then
                            pcall(function() xSound:Destroy(info.soundId) end)
                            nearbySpotify[playerId] = nil
                        else
                            pcall(function() xSound:Position(info.soundId, theirPos) end)
                        end
                    else
                        pcall(function() xSound:Destroy(info.soundId) end)
                        nearbySpotify[playerId] = nil
                    end
                end
            end
        end
    end)
end

-- Cleanup
AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() and hasXSound then
        for _, info in pairs(nearbySpotify) do
            pcall(function() xSound:Destroy(info.soundId) end)
        end
    end
end)

if hasXSound then
    print('[SMARTPHONE] xSound Spotify 3D ATIVO - Range: 30m')
end
