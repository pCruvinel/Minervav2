import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    children?: ReactNode;
    className?: string;
}

/**
 * Standard Page Header component
 * Includes Title, Subtitle, Optional Back Button, Actions (children), and a Separator.
 */
export function PageHeader({
    title,
    subtitle,
    showBackButton = false,
    onBack,
    children,
    className
}: PageHeaderProps) {


    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.history.back();
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="p-0 hover:bg-transparent text-neutral-600 hover:text-neutral-900 font-medium h-auto gap-1"
                            title="Voltar"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Button>
                    )}

                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>

                {children && (
                    <div className="flex items-center gap-2">
                        {children}
                    </div>
                )}
            </div>

            <Separator className="bg-neutral-200" />
        </div >
    );
}
