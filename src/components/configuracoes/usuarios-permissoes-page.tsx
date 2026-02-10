import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Shield,
  Edit,
  Lock,
  Clock,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

// Types
type Role = {
  id: string;
  nome: string;
  slug: string;
  nivel: number;
  descricao: string;
  active: boolean;
};

type Module = {
  id: string;
  code: string;
  name: string;
  description: string;
};

type RoleModulePermission = {
  id?: string;
  role_id: string;
  module_id: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
};

type ColaboradorWithRole = {
  id: string;
  nome_completo: string;
  email_contato: string;
  funcao: string;
  role_id: string | null;
  role: Role | null;
  ativo: boolean;
  created_at: string;
};

export function UsuariosPermissoesPage() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState(true);
  
  // Data
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [users, setUsers] = useState<ColaboradorWithRole[]>([]);
  
  // Local State
  const [filtroUser, setFiltroUser] = useState('');
  
  // Modals
  const [editingUser, setEditingUser] = useState<ColaboradorWithRole | null>(null);
  const [editingRolePermissions, setEditingRolePermissions] = useState<Role | null>(null);

  // Fetch Initial Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch
      const [rolesRes, modulesRes, usersRes] = await Promise.all([
        supabase.from('roles').select('*').order('nivel', { ascending: false }),
        supabase.from('modules').select('*').eq('active', true).order('name'),
        supabase.from('colaboradores')
            .select('*, role:roles(*)')
            .order('nome_completo')
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (modulesRes.error) throw modulesRes.error;
      if (usersRes.error) throw usersRes.error;

      setRoles(rolesRes.data || []);
      setModules(modulesRes.data || []);
      setUsers(usersRes.data || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.nome_completo.toLowerCase().includes(filtroUser.toLowerCase()) ||
    u.email_contato?.toLowerCase().includes(filtroUser.toLowerCase()) ||
    u.funcao?.toLowerCase().includes(filtroUser.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Permissões</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie perfis de acesso, usuários e permissões granulares do sistema.
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
            Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="perfis">Perfis (Roles)</TabsTrigger>
        </TabsList>

        {/* --- TAB: USUÁRIOS --- */}
        <TabsContent value="usuarios" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Usuários do Sistema</CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar usuários..." 
                    className="pl-9"
                    value={filtroUser}
                    onChange={e => setFiltroUser(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Perfil (Role)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {loading ? (
                     <TableRow>
                       <TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell>
                     </TableRow>
                   ) : filteredUsers.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</TableCell>
                     </TableRow>
                   ) : (
                     filteredUsers.map(user => (
                       <TableRow key={user.id}>
                         <TableCell>
                           <div className="flex flex-col">
                             <span className="font-medium">{user.nome_completo}</span>
                             <span className="text-xs text-muted-foreground">{user.email_contato || 'Sem e-mail'}</span>
                           </div>
                         </TableCell>
                         <TableCell>{user.funcao}</TableCell>
                         <TableCell>
                           {user.role ? (
                             <Badge variant="outline" className="gap-1">
                               <Shield className="w-3 h-3" />
                               {user.role.nome} (N{user.role.nivel})
                             </Badge>
                           ) : (
                             <Badge variant="secondary">Sem Perfil</Badge>
                           )}
                         </TableCell>
                         <TableCell>
                           {user.ativo ? (
                             <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-0">Ativo</Badge>
                           ) : (
                             <Badge variant="destructive">Inativo</Badge>
                           )}
                         </TableCell>
                         <TableCell className="text-right">
                           <Button size="sm" variant="ghost" onClick={() => setEditingUser(user)}>
                             <Edit className="w-4 h-4" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     ))
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB: PERFIS --- */}
        <TabsContent value="perfis" className="mt-6 space-y-4">
           <Card>
            <CardHeader>
               <CardTitle>Perfis de Acesso (Roles)</CardTitle>
               <CardDescription>Defina o que cada perfil pode fazer em cada módulo do sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nível</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Permissões</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell className="font-mono text-xs">N{role.nivel}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            {role.nome}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{role.descricao}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="secondary" size="sm" onClick={() => setEditingRolePermissions(role)}>
                          <Lock className="w-4 h-4 mr-2" />
                          Configurar Acesso
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- MODAL EDIT USER ROLE --- */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>Alterar perfil de acesso de {editingUser?.nome_completo}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="role-select">Perfil de Acesso</Label>
                    <Select 
                        value={editingUser?.role_id || 'none'} 
                        onValueChange={async (val) => {
                            if (!editingUser) return;
                            const newRoleId = val === 'none' ? null : val;
                            
                            try {
                                const { error } = await supabase
                                    .from('colaboradores')
                                    .update({ role_id: newRoleId })
                                    .eq('id', editingUser.id);
                                
                                if (error) throw error;
                                
                                setUsers(prev => prev.map(u => 
                                    u.id === editingUser.id 
                                    ? { ...u, role_id: newRoleId, role: roles.find(r => r.id === newRoleId) || null } 
                                    : u
                                ));
                                toast.success('Perfil atualizado!');
                                setEditingUser(null);
                            } catch (err: any) {
                                toast.error('Erro ao atualizar: ' + err.message);
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sem Perfil</SelectItem>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.id}>
                                    {role.nome} (N{role.nivel})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL EDIT ROLE PERMISSIONS --- */}
      {editingRolePermissions && (
          <ModalEditPermissions 
            role={editingRolePermissions} 
            modules={modules}
            onClose={() => setEditingRolePermissions(null)}
          />
      )}
    </div>
  );
}

// Subcomponent for Matrix Editing
function ModalEditPermissions({ role, modules, onClose }: { role: Role, modules: Module[], onClose: () => void }) {
    const [permissions, setPermissions] = useState<RoleModulePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPermissions();
    }, [role.id]);

    const loadPermissions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('role_module_permissions')
            .select('*')
            .eq('role_id', role.id);
        
        if (!error && data) {
            setPermissions(data);
        }
        setLoading(false);
    };

    const getPermission = (moduleId: string) => {
        return permissions.find(p => p.module_id === moduleId) || {
            role_id: role.id,
            module_id: moduleId,
            can_create: false,
            can_read: false,
            can_update: false,
            can_delete: false
        };
    };

    const handleToggle = (moduleId: string, field: keyof RoleModulePermission) => {
        const current = getPermission(moduleId);
        const updated = { ...current, [field]: !current[field] };
        
        const exists = permissions.find(p => p.module_id === moduleId);
        if (exists) {
            setPermissions(prev => prev.map(p => p.module_id === moduleId ? updated : p));
        } else {
            setPermissions(prev => [...prev, updated as RoleModulePermission]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Upsert all defined permissions
            const { error } = await supabase
                .from('role_module_permissions')
                .upsert(
                    permissions.map(p => ({
                        role_id: role.id,
                        module_id: p.module_id,
                        can_create: p.can_create,
                        can_read: p.can_read,
                        can_update: p.can_update,
                        can_delete: p.can_delete
                    })),
                    { onConflict: 'role_id,module_id' }
                );

            if (error) throw error;
            toast.success(`Permissões atualizadas para ${role.nome}`);
            onClose();
        } catch (err: any) {
            console.error(err);
            toast.error('Erro ao salvar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Permissões: {role.nome}</DialogTitle>
                    <DialogDescription>Configure o acesso granular para cada módulo.</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Módulo</TableHead>
                                    <TableHead className="text-center w-24">Ler</TableHead>
                                    <TableHead className="text-center w-24">Criar</TableHead>
                                    <TableHead className="text-center w-24">Editar</TableHead>
                                    <TableHead className="text-center w-24">Excluir</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modules.map(mod => {
                                    const perm = getPermission(mod.id);
                                    return (
                                        <TableRow key={mod.id}>
                                            <TableCell>
                                                <div className="font-medium">{mod.name}</div>
                                                <div className="text-xs text-muted-foreground">{mod.description}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={perm.can_read} 
                                                    onCheckedChange={() => handleToggle(mod.id, 'can_read')} 
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={perm.can_create} 
                                                    onCheckedChange={() => handleToggle(mod.id, 'can_create')} 
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={perm.can_update} 
                                                    onCheckedChange={() => handleToggle(mod.id, 'can_update')} 
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={perm.can_delete} 
                                                    onCheckedChange={() => handleToggle(mod.id, 'can_delete')} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Fallback for missing components/types if needed
// (Assumed available based on project structure)
