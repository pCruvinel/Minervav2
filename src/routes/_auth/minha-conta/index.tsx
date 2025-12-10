/**
 * Página Minha Conta
 * 
 * Permite ao usuário logado gerenciar:
 * - Perfil e Avatar
 * - Segurança (senha)
 * - Documentos pessoais
 */

import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { z } from 'zod';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AvatarCropModal } from '@/components/shared/avatar-crop-modal';

// Icons
import {
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  Camera,
  Eye,
  EyeOff,
  Download,
  Trash2
} from 'lucide-react';

// Constants
import { DOCUMENTOS_OBRIGATORIOS } from '@/lib/constants/colaboradores';

// Types
interface Documento {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  tipo_documento: string;
  created_at: string;
}

// Zod Schema para validação de senha
const senhaSchema = z.object({
  novaSenha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmarSenha: z.string()
}).refine(data => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha']
});

// Route definition
export const Route = createFileRoute('/_auth/minha-conta/')({
  component: MinhaContaPage
});

function MinhaContaPage() {
  const { currentUser, refreshUser } = useAuth();

  // Estados gerais
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  // Estados do Perfil
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Estados do Crop Modal
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Estados de Segurança
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [senhaErrors, setSenhaErrors] = useState<{ novaSenha?: string; confirmarSenha?: string }>({});

  // Estados de Documentos
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      setNome(currentUser.nome_completo || '');
      setAvatarUrl(currentUser.avatar_url);
      fetchDocumentos();
    }
  }, [currentUser]);

  // Buscar documentos do colaborador
  const fetchDocumentos = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('colaboradores_documentos')
        .select('*')
        .eq('colaborador_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Seleção de imagem (abre modal de crop)
  const handleAvatarSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB para imagem original, depois do crop será menor)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }

    // Abrir modal de crop
    setSelectedImageFile(file);
    setCropModalOpen(true);

    // Limpar input para permitir selecionar a mesma imagem
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  // Handler: Upload após crop
  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!currentUser) return;

    try {
      setUploadingAvatar(true);

      const fileName = `${currentUser.id}/avatar_${Date.now()}.jpg`;
      console.log('[Avatar] Iniciando upload:', fileName);

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error('[Avatar] Erro no upload storage:', uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('[Avatar] URL pública obtida:', publicUrl);

      // Atualizar user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        console.error('[Avatar] Erro ao atualizar auth metadata:', updateError);
        throw updateError;
      }

      console.log('[Avatar] Auth metadata atualizado com sucesso');

      // Sincronizar avatar_url na tabela colaboradores (para exibição em outras partes do sistema)
      const { error: colabError } = await supabase
        .from('colaboradores')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id);

      if (colabError) {
        console.warn('[Avatar] Aviso: Não foi possível sincronizar na tabela colaboradores:', colabError);
      } else {
        console.log('[Avatar] Sincronizado na tabela colaboradores');
      }

      // Atualizar estado local imediatamente
      setAvatarUrl(publicUrl);

      // Forçar refresh completo da sessão para atualizar o JWT
      console.log('[Avatar] Forçando refresh da sessão...');
      await supabase.auth.refreshSession();
      await refreshUser();

      console.log('[Avatar] Upload concluído com sucesso!');
      toast.success('Avatar atualizado com sucesso!');

    } catch (error) {
      console.error('[Avatar] Erro no upload do avatar:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar avatar';
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
      setSelectedImageFile(null);
      setCropModalOpen(false);
    }
  };

  // Handler: Remover Avatar
  const handleRemoveAvatar = async () => {
    if (!currentUser || !avatarUrl) return;

    try {
      setUploadingAvatar(true);

      // Remover avatar_url do user metadata
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (error) throw error;

      // Sincronizar remoção na tabela colaboradores
      const { error: colabError } = await supabase
        .from('colaboradores')
        .update({ avatar_url: null })
        .eq('id', currentUser.id);

      if (colabError) {
        console.warn('Aviso: Não foi possível sincronizar remoção de avatar na tabela colaboradores:', colabError);
      }

      // Atualizar estado local
      setAvatarUrl(undefined);

      // Refresh do contexto
      await refreshUser();
      toast.success('Avatar removido com sucesso!');

    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      const message = error instanceof Error ? error.message : 'Erro ao remover avatar';
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handler: Salvar Perfil
  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      setSavingProfile(true);

      // Atualizar dados do colaborador
      const { error } = await supabase
        .from('colaboradores')
        .update({
          nome_completo: nome,
          telefone: telefone
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Atualizar metadata do auth (preservando avatar_url existente)
      await supabase.auth.updateUser({
        data: {
          nome_completo: nome,
          // Preservar avatar_url se existir
          ...(avatarUrl && { avatar_url: avatarUrl })
        }
      });

      await refreshUser();
      toast.success('Perfil atualizado com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      const message = error instanceof Error ? error.message : 'Erro ao salvar perfil';
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handler: Alterar Senha
  const handleChangePassword = async () => {
    // Validar com Zod
    const result = senhaSchema.safeParse({ novaSenha, confirmarSenha });

    if (!result.success) {
      const errors: { novaSenha?: string; confirmarSenha?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path[0] === 'novaSenha') errors.novaSenha = err.message;
        if (err.path[0] === 'confirmarSenha') errors.confirmarSenha = err.message;
      });
      setSenhaErrors(errors);
      return;
    }

    setSenhaErrors({});

    try {
      setSavingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      setNovaSenha('');
      setConfirmarSenha('');

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      const message = error instanceof Error ? error.message : 'Erro ao alterar senha';
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  // Handler: Upload de Documento
  const handleDocumentUpload = async (tipoDocumento: string, file: File) => {
    if (!currentUser) return;

    try {
      setUploadingDoc(tipoDocumento);

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${tipoDocumento}_${Date.now()}.${fileExt}`;

      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from('documentos-colaboradores')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos-colaboradores')
        .getPublicUrl(fileName);

      // Inserir no banco
      const { error: insertError } = await supabase
        .from('colaboradores_documentos')
        .insert({
          colaborador_id: currentUser.id,
          nome: file.name,
          url: publicUrl,
          tipo: fileExt,
          tipo_documento: tipoDocumento,
          tamanho: file.size
        });

      if (insertError) throw insertError;

      toast.success('Documento enviado com sucesso!');
      fetchDocumentos();

    } catch (error) {
      console.error('Erro no upload do documento:', error);
      const message = error instanceof Error ? error.message : 'Erro ao enviar documento';
      toast.error(message);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Helper: Verificar se documento já foi enviado
  const isDocumentoEnviado = (tipoDocumento: string) => {
    return documentos.some(d => d.tipo_documento === tipoDocumento);
  };

  // Helper: Obter documento por tipo
  const getDocumentoByTipo = (tipoDocumento: string) => {
    return documentos.find(d => d.tipo_documento === tipoDocumento);
  };

  // Helper: Iniciais do nome para fallback do avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Skeleton loader enquanto carrega
  if (!currentUser) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Minha Conta</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus dados pessoais, segurança e documentos
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="documentos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* ==================== ABA PERFIL ==================== */}
        <TabsContent value="perfil" className="mt-6 space-y-6">
          {/* Avatar Card */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Clique na imagem para alterar seu avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 cursor-pointer border-2 border-border">
                    <AvatarImage src={avatarUrl} alt={currentUser.nome_completo} />
                    <AvatarFallback className="text-xl">
                      {getInitials(currentUser.nome_completo || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                    disabled={uploadingAvatar}
                  />
                </div>
                <div>
                  <p className="font-medium">{currentUser.nome_completo}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Máximo 5MB (JPG, PNG)</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 mr-1" />
                      )}
                      Alterar
                    </Button>
                    {avatarUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={uploadingAvatar}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados Pessoais Card */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="pl-10"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={currentUser.email}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="pl-10"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ABA SEGURANÇA ==================== */}
        <TabsContent value="seguranca" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Mantenha sua conta segura com uma senha forte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="novaSenha"
                      type={showPassword ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {senhaErrors.novaSenha && (
                    <p className="text-sm text-destructive">{senhaErrors.novaSenha}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmarSenha"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="pl-10"
                      placeholder="Repita a nova senha"
                    />
                  </div>
                  {senhaErrors.confirmarSenha && (
                    <p className="text-sm text-destructive">{senhaErrors.confirmarSenha}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-start pt-4">
                <Button onClick={handleChangePassword} disabled={savingPassword}>
                  {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ABA DOCUMENTOS ==================== */}
        <TabsContent value="documentos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Documentos</CardTitle>
              <CardDescription>
                Envie os documentos solicitados pela empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DOCUMENTOS_OBRIGATORIOS.map((doc) => {
                      const enviado = isDocumentoEnviado(doc.value);
                      const documento = getDocumentoByTipo(doc.value);
                      const isUploading = uploadingDoc === doc.value;

                      return (
                        <TableRow key={doc.value}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{doc.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {enviado ? (
                              <Badge className="bg-success/10 text-success hover:bg-success/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Enviado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-warning border-warning">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {enviado && documento ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a href={documento.url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Visualizar
                                </a>
                              </Button>
                            ) : (
                              <div className="relative">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isUploading}
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = '.pdf,.jpg,.jpeg,.png';
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) handleDocumentUpload(doc.value, file);
                                    };
                                    input.click();
                                  }}
                                >
                                  {isUploading ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <Upload className="h-4 w-4 mr-1" />
                                  )}
                                  Enviar
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Crop de Avatar */}
      <AvatarCropModal
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setSelectedImageFile(null);
        }}
        imageFile={selectedImageFile}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
