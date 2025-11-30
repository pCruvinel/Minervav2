# 06 - Documentação de Componentes

> **Template**: Documente os principais componentes React do projeto

## 🧩 Visão Geral

[PREENCHER]

## 📦 Componentes UI Base (Shadcn/ui)

### Button

[PREENCHER ou REFERENCIAR documentação do Shadcn]

---

## 🎯 Componentes de Domínio

### ProjectCard

**Descrição**: [PREENCHER]

**Localização**: `components/projects/project-card.tsx`

**Props:**
```typescript
interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}
```

**Exemplo de uso:**
```tsx
<ProjectCard
  project={project}
  onEdit={(p) => router.push(`/projects/${p.id}/edit`)}
  onDelete={handleDelete}
/>
```

**Estados:**
- Loading: Skeleton loader
- Error: Error boundary
- Empty: -

---

### ProjectForm

[PREENCHER]

---

### TaskList

[PREENCHER]

---

## 🔐 Componentes de Auth

### LoginForm

[PREENCHER]

---

### SignupForm

[PREENCHER]

---

## 🎨 Componentes de Layout

### Header

[PREENCHER]

---

### Sidebar

[PREENCHER]

---

## 🎭 Padrões de Componentes

### Server Components (padrão)
```tsx
// app/projects/page.tsx
export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectList projects={projects} />;
}
```

### Client Components
```tsx
'use client';

export function InteractiveComponent() {
  const [state, setState] = useState();
  // ...
}
```

### Compound Components
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>
```

---

**Status**: 🟡 Template - Aguardando preenchimento
**Documento Anterior**: [05-API.md](./API.md)