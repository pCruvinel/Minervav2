import React from 'react';
import { Search, Bell, LogOut, ArrowLeft } from 'lucide-react';
import { User } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

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
    <header className="minerva-header">
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
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="minerva-header-search">
              <Search className="minerva-header-search-icon" />
              <input type="text" placeholder="Buscar..." />
            </div>

            {/* Notifications */}
            <button className="minerva-header-notification">
              <Bell className="w-5 h-5 text-neutral-600" />
              <span className="minerva-header-notification-badge"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button 
                className="minerva-dropdown-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="minerva-avatar bg-primary text-white">
                  {user.avatar}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-neutral-600 capitalize">{user.role}</p>
                </div>
              </button>
              
              {showDropdown && (
                <>
                  <div 
                    className="fixed top-0 left-0 right-0 bottom-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="minerva-dropdown-content absolute right-0 top-full mt-2 z-20">
                    <div className="px-3 py-2">
                      <p className="font-semibold text-sm">Minha Conta</p>
                    </div>
                    <div className="minerva-dropdown-separator" />
                    <div className="px-3 py-2">
                      <p className="text-sm text-neutral-600">{user.email}</p>
                    </div>
                    <div className="minerva-dropdown-separator" />
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
