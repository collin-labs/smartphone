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

files {
    'index.html',
    'config.json',

    -- App (front-end)
    'v3/app.js',
    'v3/styles.css',

    -- Fonts
    'fonts/fonts.css',
    'fonts/SF-Pro-Bold.otf',
    'fonts/SF-Pro-Light.otf',
    'fonts/SF-Pro-Regular.otf',
    'fonts/SF-Pro-Semibold.otf',
    'fonts/SF-Pro-Thin.otf',
    'fonts/SofiaPro-Black.otf',
    'fonts/SofiaPro-Bold.otf',
    'fonts/SofiaPro-Medium.otf',
    'fonts/SofiaPro-Regular.otf',
    'fonts/fa-thin-100.woff2',

    -- App icons
    'apps/bdc.svg',
    'apps/blaze.svg',
    'apps/blaze.webp',
    'apps/calculator.webp',
    'apps/cpbank.svg',
    'apps/facetime.webp',
    'apps/fleeca.webp',
    'apps/ifood.webp',
    'apps/instagram.jpg',
    'apps/instagram_hand.png',
    'apps/minesweeper.webp',
    'apps/notes.webp',
    'apps/nubank.webp',
    'apps/olx.png',
    'apps/paypal.webp',
    'apps/phone.png',
    'apps/photos.webp',
    'apps/settings.png',
    'apps/sms.webp',
    'apps/tinder.webp',
    'apps/tor.jpg',
    'apps/truco.webp',
    'apps/twitter.png',
    'apps/uber.webp',
    'apps/waze.webp',
    'apps/weazel.webp',
    'apps/whatsapp.jpg',
    'apps/yellowpages.webp',

    -- Stock: sons
    'stock/dial.mp3',
    'stock/notification.mp3',
    'stock/photo.ogg',
    'stock/ring.mp3',

    -- Stock: imagens gerais
    'stock/fleeca.png',
    'stock/maps.jpg',
    'stock/picpay.svg',
    'stock/twitter_egg.png',
    'stock/user.jpg',
    'stock/user.svg',
    'stock/user_square.png',

    -- Stock: banks
    'stock/banks/2BHyIED.jpg',
    'stock/banks/bb.png',
    'stock/banks/itau.png',
    'stock/banks/nutransf.jpg',

    -- Stock: cases
    'stock/cases/intense.png',
    'stock/cases/iphone14pro.png',
    'stock/cases/iphonex.png',
    'stock/cases/iphonexs.png',
    'stock/cases/redminote8.png',
    'stock/cases/s20.png',
    'stock/cases/s20b.png',
    'stock/cases/s20black.png',
    'stock/cases/s20cda.png',
    'stock/cases/s9.png',
    'stock/cases/snote20.png',

    -- Stock: tinder
    'stock/tinder/chat.png',
    'stock/tinder/dislike.svg',
    'stock/tinder/flame.png',
    'stock/tinder/heart.png',
    'stock/tinder/heartbreak.svg',
    'stock/tinder/like.png',
    'stock/tinder/logo.svg',
    'stock/tinder/redo.png',
    'stock/tinder/refuse.png',
    'stock/tinder/star.png',
    'stock/tinder/user.png',

    -- Stock: wallpapers
    'stock/wallpapers/default.webp',
    'stock/wallpapers/firewatch.webp',
    'stock/wallpapers/iphone14.webp',
    'stock/wallpapers/iphone1444.webp',
    'stock/wallpapers/iphonex.webp',
    'stock/wallpapers/moon.webp',
    'stock/wallpapers/mtfuji.webp',
    'stock/wallpapers/s20.webp',
    'stock/wallpapers/s9.webp',
    'stock/wallpapers/taiwan.webp',
    'stock/wallpapers/vaporwave.webp',

    -- Stock: whatsapp backgrounds
    'stock/whatsapp/bg-dark.jpg',
    'stock/whatsapp/bg-light.jpg'
}
