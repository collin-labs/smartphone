/**
 * PingTest - App de teste de conexão
 * Verifica toda a pipeline: React → NUI → client.lua → server.js → MySQL → resposta
 */

import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { fetchBackend } from '@/hooks/useNui';

export default function PingTest() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const doPing = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetchBackend('ping');
            if (res.error) {
                setError(res.error);
            } else {
                setResult(res);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-phone-bg flex flex-col">
            <AppHeader title="Teste de Conexão" />

            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
                {/* Ícone */}
                <div className="w-20 h-20 rounded-2xl bg-phone-accent/20 flex items-center justify-center text-4xl">
                    🔌
                </div>

                {/* Título */}
                <div className="text-center">
                    <h2 className="text-white text-xl font-sf font-semibold">Pipeline de Comunicação</h2>
                    <p className="text-phone-secondary text-sm font-sf mt-1">
                        React → NUI → client.lua → server.js → MySQL
                    </p>
                </div>

                {/* Botão Ping */}
                <button
                    onClick={doPing}
                    disabled={loading}
                    className="px-8 py-3 bg-phone-accent rounded-xl text-white font-sf font-semibold text-base
                             disabled:opacity-50 active:scale-95 transition-transform"
                >
                    {loading ? 'Pingando...' : '🏓 Enviar Ping'}
                </button>

                {/* Resultado */}
                {result && (
                    <div className="w-full bg-phone-green/10 border border-phone-green/30 rounded-xl p-4 animate-fade-in">
                        <p className="text-phone-green font-sf font-semibold text-sm mb-2">✅ Conexão OK!</p>
                        <div className="space-y-1 text-sm font-sf text-white/80">
                            <p>📱 Telefone: <span className="text-white font-semibold">{result.phone}</span></p>
                            <p>⏱️ Timestamp: <span className="text-white font-semibold">{result.timestamp}</span></p>
                            <p>💬 Mensagem: <span className="text-white font-semibold">{result.message}</span></p>
                        </div>
                    </div>
                )}

                {/* Erro */}
                {error && (
                    <div className="w-full bg-phone-red/10 border border-phone-red/30 rounded-xl p-4 animate-fade-in">
                        <p className="text-phone-red font-sf font-semibold text-sm mb-1">❌ Erro</p>
                        <p className="text-white/80 font-sf text-sm">{error}</p>
                    </div>
                )}

                {/* Checklist */}
                <div className="w-full bg-phone-card rounded-xl p-4 mt-2">
                    <p className="text-phone-secondary font-sf text-xs font-semibold uppercase tracking-wider mb-3">
                        Checklist da Fase 1
                    </p>
                    <div className="space-y-2">
                        {[
                            'React + Vite + Tailwind funcionando',
                            'NUI comunicando com client.lua',
                            'client.lua enviando pro server.js',
                            'server.js processando e respondendo',
                            'Resposta voltando até o React',
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                                    ${result ? 'bg-phone-green text-black' : 'bg-phone-surface text-phone-secondary'}`}>
                                    {result ? '✓' : (i + 1)}
                                </div>
                                <span className={`text-sm font-sf ${result ? 'text-white' : 'text-phone-secondary'}`}>
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
