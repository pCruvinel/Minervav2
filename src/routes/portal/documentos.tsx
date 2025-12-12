/**
 * Portal Documentos - Biblioteca de documentos para download
 */

import { createFileRoute } from '@tanstack/react-router'
import { PortalDocumentosTab } from '@/components/portal/tabs/portal-documentos'

export const Route = createFileRoute('/portal/documentos')({
    component: PortalDocumentos,
})

function PortalDocumentos() {
    return <PortalDocumentosTab />
}
