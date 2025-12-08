import React from 'react';
import { Search, LogOut, ArrowLeft, User as UserIcon, FileText, Bell } from 'lucide-react';
import { User } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { NotificationBell } from '@/components/shared/notification-bell';

interface OSHeaderData {
  codigo: string;
  titulo: string;
  cliente: string;
  status: string;
  statusVariant?: 'default' | 'outline' | 'secondary' | 'destructive';
  onBack: () => void;
}

interface HeaderProps {
  user: User;
  breadcrumbs: { label: string; href?: string }[];
  onLogout: () => void;
  osData?: OSHeaderData;
}

export function Header({ user, breadcrumbs, onLogout, osData }: HeaderProps) {
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <header className="minerva-header w-full flex items-center justify-between">
      {/* Conteúdo específico para página de OS */}
      {osData ? (
        <>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={osData.onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-black">{osData.codigo} - {osData.titulo}</h1>
            </div>
          </div>
          <Badge variant={osData.statusVariant || "outline"} className="border-primary text-primary">
            {osData.status}
          </Badge>
        </>
      ) : (
        <>
          {/* Breadcrumbs - modo padrão */}
          <div className="minerva-breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="minerva-breadcrumb-separator">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="minerva-breadcrumb-current">{crumb.label}</span>
                ) : (
                  <a href={crumb.href || '#'} className="minerva-breadcrumb-link">
                    {crumb.label}
                  </a>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Search */}
            <div className="minerva-header-search">
              <Search className="minerva-header-search-icon" />
              <input type="text" placeholder="Buscar..." />
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* User Dropdown */}
            <div className="relative">
              <button
                className="minerva-dropdown-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="minerva-avatar bg-primary text-white overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.nome_completo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.nome_completo
                      ?.split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'U'
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{user.nome_completo}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role_nivel}</p>
                </div>
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed top-0 left-0 right-0 bottom-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="minerva-dropdown-content absolute right-0 top-full mt-2 z-20 min-w-[200px]">
                    {/* Header do Dropdown */}
                    <div className="px-3 py-2">
                      <p className="font-semibold text-sm">{user.nome_completo}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="minerva-dropdown-separator" />

                    {/* Minha Conta */}
                    <a
                      href="/minha-conta"
                      className="minerva-dropdown-item w-full"
                      onClick={() => setShowDropdown(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Minha Conta</span>
                    </a>

                    {/* Meus Documentos */}
                    <a
                      href="/minha-conta?tab=documentos"
                      className="minerva-dropdown-item w-full"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Meus Documentos</span>
                    </a>

                    {/* Notificações */}
                    <a
                      href="/notificacoes"
                      className="minerva-dropdown-item w-full"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Bell className="w-4 h-4" />
                      <span>Notificações</span>
                    </a>

                    <div className="minerva-dropdown-separator" />

                    {/* Logout */}
                    <button
                      onClick={onLogout}
                      className="minerva-dropdown-item text-error font-medium w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
