import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw, ShieldCheck } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorInfo: (error as Error).message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[CRITICAL RENDER FAILURE]", error, errorInfo);
    // Silent automatic recovery for iOS 16 instabilities
    setTimeout(() => {
      this.setState({ hasError: false, errorInfo: null });
    }, 500);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-system-background z-[10000]">
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <div className="w-12 h-12 bg-system-tertiary-label/10 rounded-2xl animate-pulse" />
            <div className="h-4 w-32 bg-secondary-system-background rounded-full animate-pulse" />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const GlobalSafetyManager = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Log errors but don't block UI state
      console.error("[RUNTIME SYSTEM ERROR]", event.error?.stack || event.message);
      
      // Clear specific stuck states in background if needed
      const uptime = performance.now();
      if (uptime < 5000) {
        localStorage.removeItem('app_boot_crash_count');
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.warn("[ASYNC COORDINATION]", event.reason?.message || event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export const LoadingPlaceholder = () => (
  <div className="h-full flex flex-col items-center justify-center bg-system-background">
    <div className="w-28 h-28 bg-apple-card rounded-[32px] shadow-xl flex items-center justify-center animate-pulse">
      <div className="w-12 h-12 bg-system-tertiary-label/20 rounded-xl" />
    </div>
    <div className="mt-12 flex flex-col items-center gap-4">
      <div className="h-6 w-48 bg-secondary-system-background rounded-full animate-pulse" />
      <div className="h-4 w-32 bg-secondary-system-background rounded-full animate-pulse opacity-60" />
    </div>
  </div>
);
