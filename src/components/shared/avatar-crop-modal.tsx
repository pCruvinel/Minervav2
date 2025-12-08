/**
 * Modal de Crop de Avatar
 * 
 * Permite ao usuário cortar a imagem em proporção 1:1 (circular)
 * antes de fazer upload para o perfil.
 */

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AvatarCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageFile: File | null;
    onCropComplete: (croppedBlob: Blob) => Promise<void>;
}

// Helper para criar crop centralizado 1:1
function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
): Crop {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

// Helper para gerar canvas com o crop
async function getCroppedImg(
    image: HTMLImageElement,
    crop: PixelCrop
): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Tamanho final do avatar (300x300 para boa qualidade)
    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        outputSize,
        outputSize
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            },
            'image/jpeg',
            0.9 // Qualidade 90%
        );
    });
}

export function AvatarCropModal({
    isOpen,
    onClose,
    imageFile,
    onCropComplete,
}: AvatarCropModalProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Carregar imagem quando o arquivo mudar
    React.useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || '');
            });
            reader.readAsDataURL(imageFile);
        } else {
            setImageSrc('');
            setCrop(undefined);
            setCompletedCrop(undefined);
        }
    }, [imageFile]);

    // Callback quando a imagem carrega
    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }, []);

    // Handler para salvar
    const handleSave = async () => {
        if (!imgRef.current || !completedCrop) return;

        try {
            setIsSaving(true);
            const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
            await onCropComplete(croppedBlob);
            onClose();
        } catch (error) {
            console.error('Erro ao cortar imagem:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handler para cancelar
    const handleCancel = () => {
        setImageSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
                    <DialogDescription>
                        Arraste para posicionar e redimensione a área de corte
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center py-4">
                    {imageSrc && (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                            className="max-h-[400px]"
                        >
                            <img
                                ref={imgRef}
                                alt="Imagem para cortar"
                                src={imageSrc}
                                onLoad={onImageLoad}
                                className="max-h-[400px] object-contain"
                            />
                        </ReactCrop>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!completedCrop || isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
