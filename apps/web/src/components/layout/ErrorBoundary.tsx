import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@gestao-compra/ui";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro na interface:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-lg rounded-lg border border-border bg-card p-6 space-y-4">
            <h1 className="text-lg font-semibold text-foreground">Erro ao carregar a aplicação</h1>
            <p className="text-sm text-muted-foreground break-words">{this.state.error.message}</p>
            <Button
              onClick={() => {
                this.setState({ error: null });
                window.location.href = "/";
              }}
            >
              Voltar ao login
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
