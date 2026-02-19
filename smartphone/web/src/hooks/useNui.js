/**
 * Hook: useNui
 * Comunicação React → client.lua (via NUI fetch)
 * 
 * No FiveM: fetch("http://smartphone/backend") → RegisterNUICallback
 * No browser (dev): retorna mock data
 */

const isInGame = typeof GetParentResourceName === 'function' || 
                 window.__FIVEM_NUI__ === true ||
                 window.invokeNative !== undefined;

const resourceName = isInGame ? 'smartphone' : 'smartphone';

/**
 * Envia request para o backend via NUI → client.lua → server.js
 * @param {string} member - Nome da função backend (ex: 'sms_send')
 * @param {Array} args - Argumentos da função
 * @returns {Promise<any>} Resultado do server
 */
export async function fetchBackend(member, args = {}) {
    if (!isInGame) {
        console.log(`[DEV] backend.${member}(`, args, ')');
        return getMockResponse(member, args);
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(`https://${resourceName}/backend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member, args }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        return await response.json();
    } catch (error) {
        console.error(`[NUI] Erro ao chamar ${member}:`, error);
        return { error: error.message };
    }
}

/**
 * Envia request para ações do client.lua
 * @param {string} action - Nome da ação (ex: 'getPlayerPosition')
 * @param {object} data - Dados extras
 */
export async function fetchClient(action, data = {}) {
    if (!isInGame) {
        console.log(`[DEV] client.${action}(`, data, ')');
        return { ok: true };
    }

    try {
        const response = await fetch(`https://${resourceName}/client:action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        return await response.json();
    } catch (error) {
        console.error(`[NUI] Erro ao chamar action ${action}:`, error);
        return { error: error.message };
    }
}

/**
 * Fecha o celular (avisa o client.lua)
 */
export async function closePhone() {
    if (!isInGame) {
        console.log('[DEV] phone:close');
        return;
    }

    try {
        await fetch(`https://${resourceName}/phone:close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
    } catch (error) {
        console.error('[NUI] Erro ao fechar celular:', error);
    }
}

/**
 * Verifica se estamos rodando dentro do FiveM
 */
export function useIsInGame() {
    return isInGame;
}

// ============================================
// MOCK DATA (para desenvolvimento no browser)
// ============================================

function getMockResponse(member, args) {
    const mocks = {
        ping: {
            ok: true,
            phone: '000-001',
            timestamp: Date.now(),
            message: 'Smartphone server online! 🟢 (MOCK)'
        },
        getSettings: {
            phone: '000-001',
            userId: 1,
            config: {
                currency: 'R$',
                bankType: 'nubank',
                zoom: 100,
                case: 'iphonexs',
            },
            settings: {
                currency: 'R$',
                bankType: 'nubank',
                zoom: 100,
                case: 'iphonexs',
            },
            identity: {
                phone: '000-001',
                name: 'BC (Dev)'
            }
        },
        download: {
            phone: '000-001',
            userId: 1,
            config: { currency: 'R$' },
            settings: { currency: 'R$' },
            identity: { phone: '000-001', name: 'BC (Dev)' }
        }
    };

    return mocks[member] || { ok: true, mock: true, member };
}
