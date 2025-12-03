import { LucideIcon } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { modalThemes, ModalTheme, customGradients, CustomGradient } from '@/lib/modal-themes';

interface ModalHeaderPadraoProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    theme?: ModalTheme;
    customGradient?: CustomGradient;
}

export function ModalHeaderPadrao({
    title,
    description,
    icon: Icon,
    theme = 'create',
    customGradient
}: ModalHeaderPadraoProps) {
    const themeConfig = modalThemes[theme];
    const gradientClass = customGradient
        ? `bg-gradient-to-r ${customGradients[customGradient]}`
        : `bg-gradient-to-r ${themeConfig.gradient}`;

    return (
        <div className={`${gradientClass} p-6 rounded-t-lg`}>
            <DialogHeader>
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`w-10 h-10 rounded-lg ${themeConfig.iconBg} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <div className="flex-1">
                        <DialogTitle className="text-white text-2xl font-semibold">
                            {title}
                        </DialogTitle>
                        {description && (
                            <DialogDescription className={`${themeConfig.textColor} mt-2`}>
                                {description}
                            </DialogDescription>
                        )}
                    </div>
                </div>
            </DialogHeader>
        </div>
    );
}