dependency "PL_PROTECT"
client_script "@PL_PROTECT/lib/plclient.lua"
server_script "@PL_PROTECT/lib/plserver.lua"
fx_version 'adamant'
game 'gta5'

server_scripts {
    '@vrp/lib/utils.lua',
    'server.js'
}

client_scripts {
    '@vrp/lib/Utils.lua',
    'client.lua'
}

ui_page 'index.html'

files {'index.html'}
