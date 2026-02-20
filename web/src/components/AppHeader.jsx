/**
 * AppHeader - Barra de navegação dentro dos apps
 * Back button + título + ações opcionais
 */

import usePhone from '@/store/usePhone';

export default function AppHeader({ title, color, rightAction, children }) {
    const { goBack, goHome } = usePhone();

    return (
        <div
            className="flex items-center gap-3 px-4 pt-[56px] pb-3 min-h-[96px]"
            style={{ background: color || 'transparent' }}
        >
            {/* Botão voltar */}
            <button
                onClick={goBack}
                className="flex items-center gap-1 text-phone-accent text-[17px] font-sf shrink-0"
            >
                <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                    <path d="M10.59 0L12 1.41 3.42 10 12 18.59 10.59 20 0.59 10z" />
                </svg>
                <span>Voltar</span>
            </button>

            {/* Título */}
            <h1 className="flex-1 text-white text-[17px] font-sf font-semibold text-center truncate">
                {title}
            </h1>

            {/* Ação direita (opcional) */}
            {rightAction ? (
                <div className="shrink-0">{rightAction}</div>
            ) : (
                <div className="w-[60px] shrink-0" /> // Spacer para centralizar título
            )}
        </div>
    );
}
