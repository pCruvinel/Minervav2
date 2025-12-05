import { LucideIcon } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { modalThemes, ModalTheme } from '@/lib/modal-themes';

interface ModalHeaderPadraoProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    theme?: ModalTheme;
}

export function ModalHeaderPadrao({
    title,
    description,
    icon: Icon,
    theme = 'create',
}: ModalHeaderPadraoProps) {
    const themeConfig = modalThemes[theme];

    return (
        <div className="bg-background p-6 rounded-t-lg border-b border-border/50">
            <DialogHeader>
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`w-10 h-10 rounded-xl ${themeConfig.iconBg} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${themeConfig.accentColor}`} />
                        </div>
                    )}
                    <div className="flex-1">
                        <DialogTitle className="text-foreground text-xl font-semibold">
                            {title}
                        </DialogTitle>
                        {description && (
                            <DialogDescription className="text-muted-foreground mt-1">
                                {description}
                            </DialogDescription>
                        )}
                    </div>
                </div>
            </DialogHeader>
        </div>
    );
}