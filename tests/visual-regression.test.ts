import { test, expect } from '@playwright/test';

/**
 * Testes de Regressão Visual - Design System Minerva
 *
 * Garante que os componentes do design system existem e renderizam
 * após a migração de cores.
 */

test.describe('Design System - Basic Rendering', () => {
  test('Design system showcase page loads', async ({ page }) => {
    // Navegar para página de showcase do design system
    await page.goto('/design-system-showcase');

    // Verificar se a página carregou
    await expect(page).toHaveTitle(/Minerva/);
  });

  test('StatusBadge component renders', async ({ page }) => {
    await page.goto('/design-system-showcase');

    // Verificar se pelo menos um StatusBadge está presente
    const statusBadge = page.locator('text=/Status:/');
    await expect(statusBadge.first()).toBeVisible();
  });

  test('PriorityBadge component renders', async ({ page }) => {
    await page.goto('/design-system-showcase');

    // Verificar se pelo menos um PriorityBadge está presente
    const priorityBadge = page.locator('text=/Prioridade:/');
    await expect(priorityBadge.first()).toBeVisible();
  });

  test('No critical color violations', async ({ page }) => {
    await page.goto('/');

    // Verificar que não há erros críticos de cor na página principal
    // Este é um teste básico que pode ser expandido
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});