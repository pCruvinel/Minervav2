import { useEffect } from 'react';

/**
 * FontLoader Component
 * Carrega fontes do Google Fonts de forma segura via preconnect + link
 * Evita erros CORS ao não tentar acessar cssRules
 */
export function FontLoader() {
  useEffect(() => {
    // Preconnect para melhor performance
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    
    // Link para carregar as fontes
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap';
    fontLink.crossOrigin = 'anonymous';
    
    // Adicionar ao head
    document.head.appendChild(preconnect1);
    document.head.appendChild(preconnect2);
    document.head.appendChild(fontLink);
    
    // Cleanup
    return () => {
      try {
        if (preconnect1.parentNode) document.head.removeChild(preconnect1);
        if (preconnect2.parentNode) document.head.removeChild(preconnect2);
        if (fontLink.parentNode) document.head.removeChild(fontLink);
      } catch (error) {
        // Silenciar erros de cleanup
        console.debug('FontLoader cleanup:', error);
      }
    };
  }, []);

  return null;
}
