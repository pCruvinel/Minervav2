#!/usr/bin/env python3
"""
Script para mover toda a documentação da raiz para /docs
ERP Minerva Engenharia - Organização de Documentação
Data: 18/11/2025
"""

import os
import shutil

# Lista completa de arquivos para mover
arquivos_md = [
    'ACESSO_RAPIDO_FLUXO_16.md',
    'ACESSO_RAPIDO_GESTORES.md',
    'API_INTEGRATION_GUIDE.md',
    'CHANGELOG_COLABORADOR.md',
    'CHECKLIST_DEPLOY.md',
    'CHECKLIST_MODO_FRONTEND.md',
    'COMANDOS_SUPABASE.md',
    'COMO_CORRIGIR_ERRO_CLIENTE.md',
    'CORRECAO_APLICADA.md',
    'DADOS_MOCKADOS_COLABORADOR.md',
    'DATABASE_SCHEMA.md',
    'DESIGN_SYSTEM.md',
    'ENUM_DEFINICOES_SISTEMA.md',
    'EXECUTE_AGORA.md',
    'FIX_CLIENTE_STATUS_README.md',
    'FIX_DEPLOY_403.md',
    'FIX_ERRO_403_COMPLETO.md',
    'FLUXO_16_MENU_PERFIL_COLABORADOR.md',
    'FLUXO_16_RESUMO_EXECUTIVO.md',
    'FLUXO_GESTORES_COMPLETO.md',
    'GUIA_RAPIDO_SUPABASE.md',
    'INDEX_DOCUMENTACAO.md',
    'MENU_VISIBILIDADE_README.md',
    'MODO_FRONTEND_ONLY.md',
    'QUICK_START_COLABORADOR.md',
    'README_CORRECAO_CLIENTE_STATUS.md',
    'RESUMO_EXECUTIVO_COLABORADOR.md',
    'RESUMO_SUPABASE.md',
    'SOLUCAO_ERRO_403.md',
    'SOLUCAO_RAPIDA.md',
    'STATUS_ATUAL.md',
    'SUPABASE_CONECTADO.md',
    'SUPABASE_INTEGRATION.md',
    'TEST_API_CONNECTION.md',
    'USUARIOS_TESTE.md',
]

arquivos_sql = [
    'FIX_ALL_ENUMS_AGORA.sql',
    'FIX_BANCO_AGORA.sql',
    'FIX_CLIENTE_STATUS_ENUM.sql',
    'FIX_URGENT_CLIENTE_STATUS.sql',
    'FIX_URGENT_TIPO_CLIENTE.sql',
]

def mover_arquivos():
    """Move todos os arquivos da raiz para /docs"""
    
    total_movidos = 0
    total_nao_encontrados = 0
    erros = []
    
    print("🚀 Iniciando movimentação de documentação...")
    print("=" * 60)
    
    # Verificar se pasta docs existe
    if not os.path.exists('docs'):
        os.makedirs('docs')
        print("✅ Pasta /docs criada")
    
    # Mover arquivos .md
    print("\n📄 Movendo arquivos .md...")
    for arquivo in arquivos_md:
        try:
            if os.path.exists(arquivo):
                destino = os.path.join('docs', arquivo)
                shutil.move(arquivo, destino)
                print(f"  ✅ {arquivo}")
                total_movidos += 1
            else:
                print(f"  ⚠️  Não encontrado: {arquivo}")
                total_nao_encontrados += 1
        except Exception as e:
            print(f"  ❌ Erro ao mover {arquivo}: {str(e)}")
            erros.append((arquivo, str(e)))
    
    # Mover arquivos .sql
    print("\n📊 Movendo arquivos .sql...")
    for arquivo in arquivos_sql:
        try:
            if os.path.exists(arquivo):
                destino = os.path.join('docs', arquivo)
                shutil.move(arquivo, destino)
                print(f"  ✅ {arquivo}")
                total_movidos += 1
            else:
                print(f"  ⚠️  Não encontrado: {arquivo}")
                total_nao_encontrados += 1
        except Exception as e:
            print(f"  ❌ Erro ao mover {arquivo}: {str(e)}")
            erros.append((arquivo, str(e)))
    
    # Resumo
    print("\n" + "=" * 60)
    print("📊 RESUMO DA MOVIMENTAÇÃO")
    print("=" * 60)
    print(f"✅ Arquivos movidos com sucesso: {total_movidos}")
    print(f"⚠️  Arquivos não encontrados: {total_nao_encontrados}")
    
    if erros:
        print(f"\n❌ Erros encontrados: {len(erros)}")
        for arquivo, erro in erros:
            print(f"   - {arquivo}: {erro}")
    
    # Verificação final
    print("\n" + "=" * 60)
    print("🔍 VERIFICAÇÃO FINAL")
    print("=" * 60)
    
    docs_count = len([f for f in os.listdir('docs') if f.endswith('.md') or f.endswith('.sql')])
    print(f"📂 Total de arquivos em /docs: {docs_count}")
    
    raiz_md = [f for f in os.listdir('.') if f.endswith('.md') and f not in ['README.md', 'Attributions.md']]
    raiz_sql = [f for f in os.listdir('.') if f.endswith('.sql')]
    
    if raiz_md:
        print(f"\n⚠️  Ainda existem {len(raiz_md)} arquivos .md na raiz:")
        for f in raiz_md:
            print(f"   - {f}")
    
    if raiz_sql:
        print(f"\n⚠️  Ainda existem {len(raiz_sql)} arquivos .sql na raiz:")
        for f in raiz_sql:
            print(f"   - {f}")
    
    if not raiz_md and not raiz_sql:
        print("\n🎉 SUCESSO! Raiz está limpa!")
        print("✅ Apenas README.md e Attributions.md devem estar na raiz")
    
    print("\n" + "=" * 60)
    print("✨ Movimentação concluída!")
    print("=" * 60)
    
    return total_movidos, total_nao_encontrados, erros

if __name__ == "__main__":
    try:
        movidos, nao_encontrados, erros = mover_arquivos()
        
        # Código de saída
        if erros:
            exit(1)  # Houve erros
        elif nao_encontrados > 0:
            exit(2)  # Arquivos não encontrados
        else:
            exit(0)  # Sucesso total
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Operação cancelada pelo usuário")
        exit(130)
    except Exception as e:
        print(f"\n\n❌ Erro crítico: {str(e)}")
        exit(1)
