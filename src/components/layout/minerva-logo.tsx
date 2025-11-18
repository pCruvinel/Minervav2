import React from 'react';
import logoImage from 'figma:asset/4d6725944d737f640d01fc63f170afaabecd6e0a.png';

interface MinervaLogoProps {
  variant?: 'full' | 'icon' | 'compact';
  className?: string;
}

export function MinervaLogo({ variant = 'full', className = '' }: MinervaLogoProps) {
  if (variant === 'icon') {
    // Apenas o ícone do capacete (para sidebar colapsada)
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img 
          src={logoImage} 
          alt="Minerva Engenharia" 
          className="h-8 w-8 object-contain object-left"
          style={{ objectPosition: 'left center' }}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    // Logo compacta (para mobile ou espaços pequenos)
    return (
      <div className={`flex items-center ${className}`}>
        <img 
          src={logoImage} 
          alt="Minerva Engenharia" 
          className="h-8 w-auto object-contain"
        />
      </div>
    );
  }

  // Logo completa (padrão)
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoImage} 
        alt="Minerva Soluções em Engenharia" 
        className="h-20 w-auto object-contain"
      />
    </div>
  );
}
