/**
 * AppRouter - Mapeia slug do app para o componente React
 * Novos apps são registrados aqui
 */

import PingTest from '@/apps/PingTest';
import CalculatorApp from '@/apps/Calculator';
import usePhone from '@/store/usePhone';

// ============================================
// REGISTRO DE APPS (slug → componente)
// ============================================

const APP_COMPONENTS = {
    // Fase 1 - Infraestrutura (teste)
    'ping': PingTest,

    // Fase 1 - Apps simples
    'calculator': CalculatorApp,

    // TODO: Adicionar conforme construímos
    // 'contacts': ContactsApp,
    // 'sms': SmsApp,
    // 'notes': NotesApp,
    // 'bank': BankApp,
    // 'whatsapp': WhatsAppApp,
    // 'instagram': InstagramApp,
    // 'twitter': TwitterApp,
    // etc.
};

// ============================================
// PLACEHOLDER para apps ainda não implementados
// ============================================

function ComingSoon({ slug }) {
    return (
        <div className="absolute inset-0 bg-phone-bg flex flex-col items-center justify-center gap-4 pt-[56px]">
            <div className="text-5xl">🚧</div>
            <h2 className="text-white text-lg font-sf font-semibold">
                Em Desenvolvimento
            </h2>
            <p className="text-phone-secondary text-sm font-sf">
                App: <span className="text-white">{slug}</span>
            </p>
            <button
                onClick={() => usePhone.getState().goHome()}
                className="mt-4 px-6 py-2 bg-phone-surface rounded-xl text-white font-sf text-sm
                           active:scale-95 transition-transform"
            >
                ← Voltar pra Home
            </button>
        </div>
    );
}

// ============================================
// ROUTER
// ============================================

export default function AppRouter({ slug }) {
    const AppComponent = APP_COMPONENTS[slug];

    if (!AppComponent) {
        return <ComingSoon slug={slug} />;
    }

    return (
        <div className="animate-slide-in absolute inset-0">
            <AppComponent />
        </div>
    );
}
