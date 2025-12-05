/**
 * PDFViewerEmbedded - Visualizador de PDF embarcado com toolbar
 *
 * Funcionalidades:
 * - Exibição do PDF em 100% width via iframe
 * - Toolbar com controles de impressão, download, rotação
 * - Rotação via CSS transform
 * - Scroll vertical para documentos multipágina
 */

/* eslint-disable no-undef */
declare const setTimeout: typeof globalThis.setTimeout;
declare const alert: typeof globalThis.alert;

import React, { useState, useRef, useCallback } from 'react';
import { PDFViewerToolbar } from './pdf-viewer-toolbar';
import { Card } from '@/components/ui/card';
import { Loader2, FileWarning } from 'lucide-react';

interface PDFViewerEmbeddedProps {
    pdfUrl: string;
    filename?: string;
    height?: string | number;
    showToolbar?: boolean;
    className?: string;
    onError?: () => void;
}

export function PDFViewerEmbedded({
    pdfUrl,
    filename = 'documento.pdf',
    height = 600,
    showToolbar = true,
    className = '',
    onError
}: PDFViewerEmbeddedProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(100);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    // Nota: Sem biblioteca PDF.js, não podemos obter total de páginas automaticamente
    const [totalPages] = useState(1);

    // Handler para impressão
    const handlePrint = useCallback(() => {
        if (!pdfUrl) return;

        // Criar iframe oculto para impressão
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        printFrame.src = pdfUrl;

        printFrame.onload = () => {
            setTimeout(() => {
                printFrame.contentWindow?.focus();
                printFrame.contentWindow?.print();
                // Remover iframe após impressão
                setTimeout(() => {
                    document.body.removeChild(printFrame);
                }, 1000);
            }, 500);
        };

        document.body.appendChild(printFrame);
    }, [pdfUrl]);

    // Handler para download
    const handleDownload = useCallback(() => {
        if (!pdfUrl) return;

        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [pdfUrl, filename]);

    // Handler para rotação
    const handleRotateLeft = useCallback(() => {
        setRotation((prev) => (prev - 90) % 360);
    }, []);

    const handleRotateRight = useCallback(() => {
        setRotation((prev) => (prev + 90) % 360);
    }, []);

    // Handler para zoom
    const handleZoomIn = useCallback(() => {
        setZoom((prev) => Math.min(prev + 25, 200));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => Math.max(prev - 25, 50));
    }, []);

    // Handler para navegação de páginas (scroll-based)
    const handlePrevPage = useCallback(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.scrollBy(0, -500);
            setCurrentPage((prev) => Math.max(prev - 1, 1));
        }
    }, []);

    const handleNextPage = useCallback(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.scrollBy(0, 500);
            setCurrentPage((prev) => Math.min(prev + 1, totalPages));
        }
    }, [totalPages]);

    // Handler para anotação (placeholder)
    const handleAnnotate = useCallback(() => {
        // TODO: Implementar sistema de anotação com canvas overlay
        alert('Funcionalidade de anotação será implementada em breve!');
    }, []);

    // Handler para erro de carregamento
    const handleIframeError = useCallback(() => {
        setHasError(true);
        setIsLoading(false);
        onError?.();
    }, [onError]);

    // Handler para carregamento completo
    const handleIframeLoad = useCallback(() => {
        setIsLoading(false);
        setHasError(false);
    }, []);

    // Calcular dimensões com rotação
    const isRotated90or270 = Math.abs(rotation % 180) === 90;
    const containerStyle = {
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'auto'
    };

    const iframeStyle: React.CSSProperties = {
        width: isRotated90or270 ? `${100 * (zoom / 100)}vh` : `${zoom}%`,
        height: isRotated90or270 ? `${100 * (zoom / 100)}vw` : `${zoom}%`,
        minHeight: isRotated90or270 ? '100vw' : '100%',
        transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
        transformOrigin: 'center center',
        border: 'none',
        transition: 'transform 0.3s ease'
    };

    return (
        <Card className={`overflow-hidden ${className}`}>
            {/* Toolbar */}
            {showToolbar && (
                <PDFViewerToolbar
                    onPrint={handlePrint}
                    onDownload={handleDownload}
                    onRotateLeft={handleRotateLeft}
                    onRotateRight={handleRotateRight}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onPrevPage={handlePrevPage}
                    onNextPage={handleNextPage}
                    onAnnotate={handleAnnotate}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    zoom={zoom}
                    disabled={isLoading || hasError}
                />
            )}

            {/* Container do PDF */}
            <div
                className="relative bg-neutral-100 flex items-center justify-center"
                style={containerStyle}
            >
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Carregando PDF...</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                        <div className="flex flex-col items-center gap-3 text-center px-4">
                            <FileWarning className="h-12 w-12 text-destructive" />
                            <div>
                                <p className="font-medium text-destructive">Erro ao carregar PDF</p>
                                <p className="text-sm text-muted-foreground">
                                    Não foi possível exibir o documento.
                                    <button
                                        onClick={handleDownload}
                                        className="text-primary hover:underline ml-1"
                                    >
                                        Clique para baixar
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* PDF via iframe */}
                <iframe
                    ref={iframeRef}
                    src={`${pdfUrl}#toolbar=0&navpanes=0`}
                    title="PDF Viewer"
                    style={iframeStyle}
                    className={hasError ? 'invisible' : 'visible'}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                />
            </div>
        </Card>
    );
}