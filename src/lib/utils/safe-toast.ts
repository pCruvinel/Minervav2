import { toast as sonnerToast } from "sonner";

/**
 * Wrapper seguro para toast que previne erros se o Toaster não estiver montado
 * VERSÃO REFORÇADA: Agora com proteção extra contra erros de runtime do Sonner
 */
export const toast = {
  success: (message: string, options?: any) => {
    try {
      // Verificar se sonnerToast está disponível
      if (!sonnerToast || typeof sonnerToast.success !== 'function') {
        console.warn('⚠️ Sonner não está disponível. Toast ignorado:', message);
        return;
      }
      return sonnerToast.success(message, options);
    } catch (error) {
      console.warn('❌ Toast success não pôde ser exibido:', message, error);
      // Não lançar erro - falhar silenciosamente
    }
  },
  
  error: (message: string, options?: any) => {
    try {
      // Verificar se sonnerToast está disponível
      if (!sonnerToast || typeof sonnerToast.error !== 'function') {
        console.warn('⚠️ Sonner não está disponível. Toast ignorado:', message);
        return;
      }
      return sonnerToast.error(message, options);
    } catch (error) {
      console.warn('❌ Toast error não pôde ser exibido:', message, error);
      // Não lançar erro - falhar silenciosamente
    }
  },
  
  info: (message: string, options?: any) => {
    try {
      // Verificar se sonnerToast está disponível
      if (!sonnerToast || typeof sonnerToast.info !== 'function') {
        console.warn('⚠️ Sonner não está disponível. Toast ignorado:', message);
        return;
      }
      return sonnerToast.info(message, options);
    } catch (error) {
      console.warn('❌ Toast info não pôde ser exibido:', message, error);
      // Não lançar erro - falhar silenciosamente
    }
  },
  
  warning: (message: string, options?: any) => {
    try {
      // Verificar se sonnerToast está disponível
      if (!sonnerToast || typeof sonnerToast.warning !== 'function') {
        console.warn('⚠️ Sonner não está disponível. Toast ignorado:', message);
        return;
      }
      return sonnerToast.warning(message, options);
    } catch (error) {
      console.warn('❌ Toast warning não pôde ser exibido:', message, error);
      // Não lançar erro - falhar silenciosamente
    }
  },
  
  loading: (message: string, options?: any) => {
    try {
      // Verificar se sonnerToast está disponível
      if (!sonnerToast || typeof sonnerToast.loading !== 'function') {
        console.warn('⚠️ Sonner não está disponível. Toast ignorado:', message);
        return;
      }
      return sonnerToast.loading(message, options);
    } catch (error) {
      console.warn('❌ Toast loading não pôde ser exibido:', message, error);
      // Não lançar erro - falhar silenciosamente
    }
  },
  
  promise: (promise: Promise<any> | (() => Promise<any>), options?: any) => {
    try {
      if (!sonnerToast || typeof sonnerToast.promise !== 'function') {
        console.warn('⚠️ Sonner promise não está disponível');
        return Promise.resolve();
      }
      return sonnerToast.promise(promise, options);
    } catch (error) {
      console.warn('❌ Toast promise não pôde ser exibido:', error);
      return Promise.resolve();
    }
  },
  
  custom: (jsx: any, options?: any) => {
    try {
      if (!sonnerToast || typeof sonnerToast.custom !== 'function') {
        console.warn('⚠️ Sonner custom não está disponível');
        return;
      }
      return sonnerToast.custom(jsx, options);
    } catch (error) {
      console.warn('❌ Toast custom não pôde ser exibido:', error);
    }
  },
  
  dismiss: (id?: string | number) => {
    try {
      if (!sonnerToast || typeof sonnerToast.dismiss !== 'function') {
        console.warn('⚠️ Sonner dismiss não está disponível');
        return;
      }
      return sonnerToast.dismiss(id);
    } catch (error) {
      console.warn('❌ Toast dismiss falhou:', error);
    }
  },
};