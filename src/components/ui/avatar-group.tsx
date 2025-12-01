/**
 * AvatarGroup - Grupo de Avatares com Overlap
 *
 * Componente para exibir múltiplos avatares com sobreposição.
 * Útil para mostrar participantes, equipes, etc.
 *
 * @example
 * ```tsx
 * <AvatarGroup users={[
 *   { name: 'João Silva', avatar: '/avatar1.jpg' },
 *   { name: 'Maria Santos', avatar: '/avatar2.jpg' }
 * ]} max={3} />
 * ```
 */

import { useMemo } from 'react';
import { designTokens } from '@/lib/design-tokens';

interface User {
  name: string;
  avatar?: string;
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Gera iniciais a partir de um nome
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Gera cor consistente baseada no nome
 */
function getColorFromName(name: string): string {
  const colors = [
    designTokens.colors.events.blue.DEFAULT,
    designTokens.colors.events.green.DEFAULT,
    designTokens.colors.events.yellow.DEFAULT,
    designTokens.colors.events.pink.DEFAULT,
    designTokens.colors.events.purple.DEFAULT,
    designTokens.colors.events.orange.DEFAULT,
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Gera cor de texto contrastante
 */
function getTextColor(backgroundColor: string): string {
  // Cores claras -> texto escuro
  const lightColors = [
    designTokens.colors.events.blue.DEFAULT,
    designTokens.colors.events.green.DEFAULT,
    designTokens.colors.events.yellow.DEFAULT,
    designTokens.colors.events.pink.DEFAULT,
    designTokens.colors.events.purple.DEFAULT,
    designTokens.colors.events.orange.DEFAULT,
  ];

  if (lightColors.includes(backgroundColor)) {
    return designTokens.colors.text.primary;
  }

  return 'var(--background)';
}

export function AvatarGroup({ users, max = 3, size = 'md' }: AvatarGroupProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const visibleUsers = useMemo(() => users.slice(0, max), [users, max]);
  const remainingCount = users.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visibleUsers.map((user, index) => {
        const bgColor = getColorFromName(user.name);
        const textColor = getTextColor(bgColor);

        return (
          <div
            key={`${user.name}-${index}`}
            className={`
              ${sizeClasses[size]}
              rounded-full
              border-2 border-white
              flex items-center justify-center
              font-medium
              transition-transform hover:scale-110 hover:z-10
              cursor-default
              shadow-sm
            `}
            style={{
              backgroundColor: bgColor,
              color: textColor,
            }}
            title={user.name}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
          </div>
        );
      })}

      {remainingCount > 0 && (
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full
            border-2 border-white
            flex items-center justify-center
            font-medium
            cursor-default
            shadow-sm
          `}
          style={{
            backgroundColor: designTokens.colors.background.tertiary,
            color: designTokens.colors.text.secondary,
          }}
          title={`+${remainingCount} ${remainingCount === 1 ? 'usuário' : 'usuários'}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
