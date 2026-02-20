/**
 * Store: usePhone
 * Estado global do smartphone via Zustand
 */

import { create } from 'zustand';
import { fetchBackend } from '@/hooks/useNui';

const usePhone = create((set, get) => ({
    // ============================================
    // STATE
    // ============================================

    // Visibilidade
    isOpen: false,
    isLoading: true,

    // Navegação
    currentApp: null,     // slug do app atual (ex: 'contacts', 'sms')
    appHistory: [],       // pilha de navegação para "voltar"

    // Identidade do jogador
    identity: {
        phone: '000-000',
        name: 'Jogador'
    },
    userId: null,

    // Configurações
    settings: {
        currency: 'R$',
        bankType: 'nubank',
        zoom: 100,
        case: 'iphonexs',
        isAndroid: false,
        useGameClock: false,
    },
    config: {},

    // Notificações
    notifications: [],

    // Clock
    time: null,

    // ============================================
    // ACTIONS: Visibilidade
    // ============================================

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false, currentApp: null, appHistory: [] }),

    // ============================================
    // ACTIONS: Navegação entre apps
    // ============================================

    openApp: (slug) => set((state) => ({
        currentApp: slug,
        appHistory: [...state.appHistory, state.currentApp].filter(Boolean)
    })),

    goBack: () => set((state) => {
        const history = [...state.appHistory];
        const previous = history.pop();
        return {
            currentApp: previous || null,
            appHistory: history
        };
    }),

    goHome: () => set({
        currentApp: null,
        appHistory: []
    }),

    // ============================================
    // ACTIONS: Notificações
    // ============================================

    addNotification: (notification) => set((state) => ({
        notifications: [
            { id: Date.now(), timestamp: Date.now(), ...notification },
            ...state.notifications
        ].slice(0, 50) // máximo 50 notificações
    })),

    clearNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
    })),

    clearAllNotifications: () => set({ notifications: [] }),

    // ============================================
    // ACTIONS: Clock
    // ============================================

    setTime: (time) => set({ time }),

    // ============================================
    // ACTIONS: Bootstrap (carrega settings do server)
    // ============================================

    bootstrap: async () => {
        set({ isLoading: true });

        try {
            const data = await fetchBackend('getSettings');

            if (data && !data.error) {
                set({
                    identity: data.identity || { phone: '000-000', name: 'Jogador' },
                    userId: data.userId,
                    settings: data.settings || {},
                    config: data.config || {},
                    isLoading: false
                });
                console.log('[PHONE] Bootstrap OK:', data.identity?.phone);
            } else {
                console.error('[PHONE] Bootstrap error:', data?.error);
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('[PHONE] Bootstrap failed:', error);
            set({ isLoading: false });
        }
    },

    // ============================================
    // ACTIONS: Ping (teste de conexão)
    // ============================================

    ping: async () => {
        const result = await fetchBackend('ping');
        console.log('[PHONE] Ping result:', result);
        return result;
    }
}));

export default usePhone;
