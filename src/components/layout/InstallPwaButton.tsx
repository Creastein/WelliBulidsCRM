"use client";

import React, { useEffect, useState } from 'react';
import { Download, MonitorSmartphone, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallPwaButtonProps {
  isOpen: boolean;
}

export default function InstallPwaButton({ isOpen }: InstallPwaButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(true); // Default to true to prevent flash of button
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsInstalled(isStandalone);
      setIsReady(true);
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstalled(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Check if iOS
      const isIos = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase()) && !(window as any).MSStream;
      if (isIos) {
        setShowIosPrompt(true);
      } else {
        // Fallback for other browsers where prompt isn't available but not iOS
        alert("PWA installation is not supported or already installed on this browser.");
      }
    }
  };

  if (!isReady || isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`w-full flex items-center ${isOpen ? 'justify-start px-3' : 'justify-center'} py-2 mb-2 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all group relative`}
      >
        <Download size={16} className="shrink-0" />
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-2 text-xs font-semibold whitespace-nowrap overflow-hidden"
            >
              Install App
            </motion.span>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {!isOpen && (
          <div className="absolute pointer-events-none px-2 py-1 bg-[#1a1a1a]/90 backdrop-blur-sm border border-white/10 text-white text-xs font-medium rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all left-full ml-2 z-50 whitespace-nowrap">
            Install App
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-r-[4px] border-r-[#1a1a1a]/90 border-b-[4px] border-b-transparent" />
          </div>
        )}
      </button>

      {/* iOS Install Prompt Modal */}
      <AnimatePresence>
        {showIosPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowIosPrompt(false)}
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowIosPrompt(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
                  <MonitorSmartphone size={32} className="text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Install WelliBuilds CRM</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Install this application on your home screen for quick and easy access when you&apos;re on the go.
                </p>
                
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 w-full flex items-center gap-4 text-left">
                  <div className="bg-white/10 p-2 rounded-lg text-white">
                    <Share size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">1. Tap the Share button</p>
                    <p className="text-xs text-gray-500">At the bottom of your Safari browser.</p>
                  </div>
                </div>
                
                <div className="w-[1px] h-4 bg-white/10 my-1"></div>
                
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 w-full flex items-center gap-4 text-left">
                  <div className="bg-white/10 p-2 rounded-lg text-white font-bold text-lg w-9 h-9 flex items-center justify-center">
                    +
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">2. Add to Home Screen</p>
                    <p className="text-xs text-gray-500">Scroll down the list and select this option.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
