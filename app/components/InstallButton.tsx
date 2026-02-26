"use client";

import { useState, useEffect } from 'react';

export default function InstallButton() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSModal(true);
        } else if (installPrompt) {
            await installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === 'accepted') setInstallPrompt(null);
        } else {
            alert('O aplicativo já está instalado ou seu navegador não suporta esta função.');
        }
    };

    return (
        <>
            <button
                onClick={handleInstallClick}
                className="bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-3 px-6 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Instalar App
            </button>

            {showIOSModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#0A0A0A] border border-[#D4AF37] p-6 rounded-2xl max-w-sm w-full text-center text-white shadow-2xl">
                        <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">Instalar HomeRenovAi</h3>
                        <p className="mb-6 text-gray-400 text-sm">Adicione o app à sua tela inicial para uma experiência completa.</p>

                        <ol className="text-left space-y-4 mb-8">
                            <li className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                                <span className="text-2xl font-bold text-[#D4AF37]">1.</span>
                                <p className="text-sm">Recomendamos abrir este site no <strong>Safari</strong>. Toque no ícone de <strong>Compartilhar</strong> na barra inferior.</p>
                            </li>
                            <li className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                                <span className="text-2xl font-bold text-[#D4AF37]">2.</span>
                                <p className="text-sm">Role para baixo e escolha <strong>Adicionar à Tela de Início</strong>.</p>
                            </li>
                        </ol>

                        <button
                            onClick={() => setShowIOSModal(false)}
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl"
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}