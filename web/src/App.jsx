import { useEffect } from 'react';
import usePhone from './store/usePhone';
import PhoneShell from './components/PhoneShell';
import { useIsInGame } from './hooks/useNui';

export default function App() {
    const { isOpen, open, close } = usePhone();
    const isInGame = useIsInGame();

    // ============================================
    // NUI MESSAGES: phone:open e phone:close do client.lua
    // ============================================
    useEffect(() => {
        const handleMessage = (event) => {
            const data = event.data;
            if (!data || !data.type) return;

            switch (data.type) {
                case 'phone:open':
                    open();
                    break;
                case 'phone:close':
                    close();
                    break;
                case 'pusher':
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // ============================================
    // KEYBOARD: Dev mode only (in FiveM, ESC handled in index.html + client.lua)
    // ============================================
    useEffect(() => {
        if (!isInGame) {
            const handleKey = (e) => {
                if (e.key === 'Escape' && isOpen) {
                    close();
                } else if (e.key === 'm' && !isOpen) {
                    open();
                }
            };
            window.addEventListener('keydown', handleKey);
            return () => window.removeEventListener('keydown', handleKey);
        }
    }, [isOpen, isInGame]);

    // ============================================
    // DEV MODE: Auto-open in browser
    // ============================================
    useEffect(() => {
        if (!isInGame && !isOpen) {
            open();
        }
    }, []);

    return <PhoneShell />;
}
