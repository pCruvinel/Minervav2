import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OSDetailsRedesignPage } from '../os-details-redesign-page';

// Mock do Supabase
const mockSupabaseFrom = vi.fn();
const mockSupabaseStorage = vi.fn();
const mockSupabaseAuth = vi.fn();

vi.mock('@/lib/supabase-client', () => ({
    supabase: {
        from: mockSupabaseFrom,
        storage: {
            from: mockSupabaseStorage
        },
        auth: {
            getUser: mockSupabaseAuth
        }
    }
}));

// Mock do React Router
vi.mock('@tanstack/react-router', () => ({
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
    useNavigate: () => vi.fn()
}));

// Mock do toast
vi.mock('@/lib/utils/safe-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('OSDetailsRedesignPage', () => {
    const mockOsId = 'test-os-id';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders loading state initially', () => {
        render(<OSDetailsRedesignPage osId={mockOsId} />);

        expect(screen.getByText('Carregando detalhes da OS...')).toBeInTheDocument();
    });

    it('renders OS not found when no data', async () => {
        render(<OSDetailsRedesignPage osId={mockOsId} />);

        await waitFor(() => {
            expect(screen.getByText('OS não encontrada')).toBeInTheDocument();
        });
    });

    it('renders OS details when data is loaded', async () => {
        // Mock successful data load
        mockSupabaseFrom.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({
                        data: {
                            id: mockOsId,
                            codigo_os: 'OS-001',
                            status_geral: 'em_andamento',
                            descricao: 'Test OS',
                            cliente_nome: 'Test Client',
                            tipo_os_nome: 'Perícia de Fachada',
                            comentarios_count: 5,
                            documentos_count: 3,
                            etapas_concluidas_count: 2,
                            etapas_total_count: 15
                        },
                        error: null
                    }))
                }))
            }))
        });

        render(<OSDetailsRedesignPage osId={mockOsId} />);

        await waitFor(() => {
            expect(screen.getByText('OS-001')).toBeInTheDocument();
            expect(screen.getByText('Test Client')).toBeInTheDocument();
            expect(screen.getByText('Perícia de Fachada')).toBeInTheDocument();
        });
    });

    it('handles tab switching', async () => {
        // Setup mock data
        mockSupabaseFrom.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({
                        data: {
                            id: mockOsId,
                            codigo_os: 'OS-001',
                            status_geral: 'em_andamento',
                            descricao: 'Test OS',
                            cliente_nome: 'Test Client',
                            tipo_os_nome: 'Perícia de Fachada',
                            comentarios_count: 5,
                            documentos_count: 3,
                            etapas_concluidas_count: 2,
                            etapas_total_count: 15
                        },
                        error: null
                    }))
                }))
            }))
        });

        render(<OSDetailsRedesignPage osId={mockOsId} />);

        await waitFor(() => {
            expect(screen.getByText('OS-001')).toBeInTheDocument();
        });

        // Test tab switching
        const documentsTab = screen.getByText('Documentos (3)');
        fireEvent.click(documentsTab);

        expect(screen.getByText('Documentos Vinculados')).toBeInTheDocument();
    });

    it('handles file upload', async () => {
        // Setup mock data
        mockSupabaseFrom.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({
                        data: {
                            id: mockOsId,
                            codigo_os: 'OS-001',
                            status_geral: 'em_andamento',
                            descricao: 'Test OS',
                            cliente_nome: 'Test Client',
                            tipo_os_nome: 'Perícia de Fachada',
                            comentarios_count: 5,
                            documentos_count: 3,
                            etapas_concluidas_count: 2,
                            etapas_total_count: 15
                        },
                        error: null
                    }))
                }))
            }))
        });

        render(<OSDetailsRedesignPage osId={mockOsId} />);

        await waitFor(() => {
            expect(screen.getByText('OS-001')).toBeInTheDocument();
        });

        // Switch to documents tab
        const documentsTab = screen.getByText('Documentos (3)');
        fireEvent.click(documentsTab);

        // Test upload button exists
        const uploadButton = screen.getByText('Upload');
        expect(uploadButton).toBeInTheDocument();
    });

    it('handles theme toggle', async () => {
        // Setup mock data
        const mockSupabase = await import('@/lib/supabase-client');
        mockSupabase.supabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({
                        data: {
                            id: mockOsId,
                            codigo_os: 'OS-001',
                            status_geral: 'em_andamento',
                            descricao: 'Test OS',
                            cliente_nome: 'Test Client',
                            tipo_os_nome: 'Perícia de Fachada',
                            comentarios_count: 5,
                            documentos_count: 3,
                            etapas_concluidas_count: 2,
                            etapas_total_count: 15
                        },
                        error: null
                    }))
                }))
            }))
        });

        render(<OSDetailsRedesignPage osId={mockOsId} />);

        await waitFor(() => {
            expect(screen.getByText('OS-001')).toBeInTheDocument();
        });

        // Theme toggle button should exist
        const themeButton = screen.getByRole('button', { hidden: true });
        expect(themeButton).toBeInTheDocument();
    });

    it('displays progress correctly', async () => {
        // Setup mock data with progress
        const mockSupabase = await import('@/lib/supabase-client');
        mockSupabase.supabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({
                        data: {
                            id: mockOsId,
                            codigo_os: 'OS-001',
                            status_geral: 'em_andamento',
                            descricao: 'Test OS',
                            cliente_nome: 'Test Client',
                            tipo_os_nome: 'Perícia de Fachada',
                            comentarios_count: 5,
                            documentos_count: 3,
                            etapas_concluidas_count: 10,
                            etapas_total_count: 15
                        },
                        error: null
                    }))
                }))
            }))
        });

        render(<OSDetailsRedesignPage osId={mockOsId} />);

        await waitFor(() => {
            expect(screen.getByText('10/15')).toBeInTheDocument();
            expect(screen.getByText('66.7% concluído')).toBeInTheDocument();
        });
    });

    it('handles comment filtering', async () => {
        // Setup mock data
        const mockSupabase = await import('@/lib/supabase-client');
        mockSupabase.supabase.from.mockReturnValue({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({
                        data: {
                            id: mockOsId,
                            codigo_os: 'OS-001',
                            status_geral: 'em_andamento',
                            descricao: 'Test OS',
                            cliente_nome: 'Test Client',
                            tipo_os_nome: 'Perícia de Fachada',
                            comentarios_count: 5,
                            documentos_count: 3,
                            etapas_concluidas_count: 2,
                            etapas_total_count: 15
                        },
                        error: null
                    }))
                }))
            }))
        });

        render(<OSDetailsRedesignPage osId={mockOsId} />);

        await waitFor(() => {
            expect(screen.getByText('OS-001')).toBeInTheDocument();
        });

        // Switch to comments tab
        const commentsTab = screen.getByText('Comentários (5)');
        fireEvent.click(commentsTab);

        // Check if filter controls exist
        expect(screen.getByText('Filtros e Busca')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Buscar comentários...')).toBeInTheDocument();
    });

    it('handles workflow navigation', async () => {
        // Setup mock data with workflow steps
        const mockSupabase = await import('@/lib/supabase-client');
        mockSupabase.supabase.from
            .mockReturnValueOnce({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({
                            data: {
                                id: mockOsId,
                                codigo_os: 'OS-001',
                                status_geral: 'em_andamento',
                                descricao: 'Test OS',
                                cliente_nome: 'Test Client',
                                tipo_os_nome: 'Perícia de Fachada',
                                comentarios_count: 5,
                                documentos_count: 3,
                                etapas_concluidas_count: 2,
                                etapas_total_count: 15
                            },
                            error: null
                        }))
                    }))
                }))
            })
            .mockReturnValueOnce({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        order: vi.fn(() => Promise.resolve({
                            data: [
                                {
                                    id: 'step-1',
                                    nome_etapa: 'Identificação do Cliente',
                                    status: 'concluida',
                                    ordem: 1,
                                    comentarios_count: 2,
                                    documentos_count: 1
                                }
                            ],
                            error: null
                        }))
                    }))
                }))
            });

        render(<OSDetailsRedesignPage osId={mockOsId} />);

        await waitFor(() => {
            expect(screen.getByText('OS-001')).toBeInTheDocument();
        });

        // Switch to workflow tab
        const workflowTab = screen.getByText('Etapas (1)');
        fireEvent.click(workflowTab);

        expect(screen.getByText('Etapas do Workflow')).toBeInTheDocument();
    });
});