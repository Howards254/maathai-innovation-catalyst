import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import React from 'react';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...defaultOptions,
      ...options,
      icon: React.createElement(CheckCircle, { className: 'text-emerald-500', size: 18 }),
    });
  },
  
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...defaultOptions,
      ...options,
      icon: React.createElement(AlertCircle, { className: 'text-red-500', size: 18 }),
    });
  },
  
  info: (message: string, options?: ToastOptions) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
      icon: React.createElement(Info, { className: 'text-blue-500', size: 18 }),
    });
  },
  
  warning: (message: string, options?: ToastOptions) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
      icon: React.createElement(AlertTriangle, { className: 'text-amber-500', size: 18 }),
    });
  },
  
  custom: (message: string, options?: ToastOptions & { icon?: React.ReactNode }) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
    });
  },
  
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
  
  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options,
    });
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...defaultOptions,
        ...options,
      }
    );
  },
};
