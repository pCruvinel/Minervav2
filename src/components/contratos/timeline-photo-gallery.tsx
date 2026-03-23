/**
 * TimelinePhotoGallery – Grid de fotos de um RDO com lightbox.
 *
 * Exibe até 4 miniaturas em grid. Fotos excedentes são indicadas com
 * overlay "+N". Clique abre lightbox em Dialog com navegação prev/next.
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  X,
  ImageOff,
} from 'lucide-react'

interface PhotoItem {
  id: string
  arquivo: string
  descricao?: string
  url: string
}

interface TimelinePhotoGalleryProps {
  fotos: PhotoItem[]
}

export function TimelinePhotoGallery({ fotos }: TimelinePhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!fotos || fotos.length === 0) return null

  const visibleCount = Math.min(fotos.length, 4)
  const extraCount = fotos.length - visibleCount

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const goNext = () => setCurrentIndex((i) => (i + 1) % fotos.length)
  const goPrev = () => setCurrentIndex((i) => (i - 1 + fotos.length) % fotos.length)

  // Grid layout adapts to photo count
  const gridClass =
    visibleCount === 1
      ? 'grid-cols-1'
      : visibleCount === 2
        ? 'grid-cols-2'
        : 'grid-cols-2'

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={`grid ${gridClass} gap-1.5 rounded-xl overflow-hidden`}>
        {fotos.slice(0, visibleCount).map((foto, index) => (
          <button
            key={foto.id}
            type="button"
            className={`relative group overflow-hidden bg-muted cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              visibleCount === 1
                ? 'aspect-video'
                : visibleCount === 3 && index === 0
                  ? 'row-span-2 aspect-square'
                  : 'aspect-square'
            }`}
            onClick={() => openLightbox(index)}
          >
            <img
              src={foto.url}
              alt={foto.descricao || foto.arquivo}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
              <ImageOff className="w-6 h-6 text-muted-foreground" />
            </div>

            {/* Overlay for extra photos on last visible */}
            {index === visibleCount - 1 && extraCount > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  +{extraCount}
                </span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none [&>button]:hidden">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-50 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-50 text-white/70 text-sm font-medium">
            {currentIndex + 1} / {fotos.length}
          </div>

          {/* Image */}
          <div className="relative flex items-center justify-center min-h-[60vh] max-h-[85vh] p-8">
            <img
              src={fotos[currentIndex]?.url}
              alt={fotos[currentIndex]?.descricao || fotos[currentIndex]?.arquivo}
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
            />

            {/* Prev/Next */}
            {fotos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10"
                  onClick={goPrev}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10"
                  onClick={goNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>

          {/* Caption */}
          {fotos[currentIndex]?.descricao && (
            <div className="px-8 pb-4 text-center">
              <p className="text-white/70 text-sm">{fotos[currentIndex].descricao}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
