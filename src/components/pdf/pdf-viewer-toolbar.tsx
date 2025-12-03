/**
 * PDFViewerToolbar - Toolbar para visualizador de PDF
 * 
 * Controles disponíveis:
 * - Impressão
 * - Download
 * - Rotação (esquerda/direita)
 * - Navegação de páginas (anterior/próximo)
 * - Indicador de página atual/total
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Printer,
    Download,
    RotateCcw,
    RotateCw,
    ChevronLeft,
    ChevronRight,
    Pencil,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface PDFViewerToolbarProps {
    onPrint: () => void;
    onDownload: () => void;
    onRotateLeft: () => void;
    onRotateRight: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    currentPage?: number;
    totalPages?: number;
    onPrevPage?: () => void;
    onNextPage?: () => void;
    onAnnotate?: () => void;
    zoom?: number;
    disabled?: boolean;
    className?: string;
}

export function PDFViewerToolbar({
    onPrint,
    onDownload,
    onRotateLeft,
    onRotateRight,
    onZoomIn,
    onZoomOut,
    currentPage = 1,
    totalPages = 1,
    onPrevPage,
    onNextPage,
    onAnnotate,
    zoom = 100,
    disabled = false,
    className = ''
}: PDFViewerToolbarProps) {
    return (
        <TooltipProvider>
            <div className={`flex items-center justify-between bg-muted/50 border-b px-3 py-2 ${className}`}>
                {/* Grupo Esquerdo: Ações principais */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onPrint}
                                disabled={disabled}
                                className="h-8 w-8 p-0"
                            >
                                <Printer className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Imprimir</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDownload}
                                disabled={disabled}
                                className="h-8 w-8 p-0"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-2 h-6" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRotateLeft}
                                disabled={disabled}
                                className="h-8 w-8 p-0"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Girar para esquerda</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRotateRight}
                                disabled={disabled}
                                className="h-8 w-8 p-0"
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Girar para direita</TooltipContent>
                    </Tooltip>

                    {(onZoomIn || onZoomOut) && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-6" />

                            {onZoomOut && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onZoomOut}
                                            disabled={disabled || zoom <= 50}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Diminuir zoom</TooltipContent>
                                </Tooltip>
                            )}

                            <span className="text-xs text-muted-foreground min-w-[40px] text-center">
                                {zoom}%
                            </span>

                            {onZoomIn && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onZoomIn}
                                            disabled={disabled || zoom >= 200}
                                            className="h-8 w-8 p-0"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Aumentar zoom</TooltipContent>
                                </Tooltip>
                            )}
                        </>
                    )}

                    {onAnnotate && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-6" />

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onAnnotate}
                                        disabled={disabled}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Anotar (em breve)</TooltipContent>
                            </Tooltip>
                        </>
                    )}
                </div>

                {/* Grupo Direito: Navegação de páginas */}
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onPrevPage}
                                disabled={disabled || currentPage <= 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Página anterior</TooltipContent>
                    </Tooltip>

                    <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                        Página {currentPage} de {totalPages}
                    </span>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onNextPage}
                                disabled={disabled || currentPage >= totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Próxima página</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}