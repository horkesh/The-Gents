import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-8 text-center bg-charcoal">
          <h2 className="heading-display text-xl text-gold mb-3">Something went wrong</h2>
          <p className="text-cream/40 text-sm mb-6 max-w-xs">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button variant="ghost" size="sm" onClick={this.handleRetry}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
