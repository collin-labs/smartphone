/**
 * Hook: usePusher
 * Escuta eventos do servidor enviados via pusher (server → client.lua → NUI)
 * 
 * Fluxo:
 * server.js pushToPlayer() → emitNet('smartphone:pusher') → client.lua → SendNUIMessage → window.message
 */

import { useEffect } from 'react';

// Registry global de listeners
const listeners = {};

/**
 * Registra callback para um evento pusher
 * @param {string} event - Nome do evento (ex: 'WHATSAPP_MESSAGE')
 * @param {function} callback - Função a chamar quando evento chegar
 */
export function onPusher(event, callback) {
    if (!listeners[event]) {
        listeners[event] = [];
    }
    listeners[event].push(callback);

    // Retorna função de cleanup
    return () => {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
}

/**
 * Hook React: escuta um evento pusher e chama callback
 * Limpa automaticamente no unmount
 */
export function usePusherEvent(event, callback) {
    useEffect(() => {
        const cleanup = onPusher(event, callback);
        return cleanup;
    }, [event, callback]);
}

// ============================================
// LISTENER GLOBAL (window.message do FiveM NUI)
// ============================================

function handleNuiMessage(nativeEvent) {
    const data = nativeEvent.data;

    if (data.type === 'pusher' && data.event) {
        const eventListeners = listeners[data.event];
        if (eventListeners) {
            eventListeners.forEach(cb => {
                try {
                    cb(data.payload);
                } catch (error) {
                    console.error(`[PUSHER] Erro no listener de '${data.event}':`, error);
                }
            });
        }
    }
}

// Registra listener uma vez
window.addEventListener('message', handleNuiMessage);

export default { onPusher, usePusherEvent };
