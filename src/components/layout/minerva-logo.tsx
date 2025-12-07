
import logoImage from '../../img/logo.png';
import logoIcone from '../../img/logo-icone.png';

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
          src={logoIcone}
          alt="Minerva Engenharia"
          className="w-full h-full object-contain"
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
        className="h-full w-auto object-contain"
      />
    </div>
  );
}
