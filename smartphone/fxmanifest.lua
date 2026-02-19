fx_version 'cerulean'
game 'gta5'

name 'smartphone'
description 'Smartphone limpo para GTA RP - Agência Soluções Digitais'
author 'BC - Agência Soluções Digitais'
version '1.0.0'

-- Dependências
dependency 'oxmysql'

-- Client-side (Lua)
client_script 'client.lua'

-- Server-side (Node.js)
server_script 'server/main.js'

-- Interface (NUI)
ui_page 'web/dist/index.html'

-- Arquivos acessíveis pelo NUI
files {
    'web/dist/index.html',
    'web/dist/**/*',
    'config.json',
    'assets/**/*'
}
