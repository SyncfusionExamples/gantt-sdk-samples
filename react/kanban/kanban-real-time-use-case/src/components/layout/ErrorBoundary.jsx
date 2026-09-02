import React from 'react';

/**
 * ErrorBoundary — catches any uncaught render error in its subtree and
 * renders a friendly fallback instead of unmounting the whole app.
 *
 * This was missing in the original build, which is why a single
 * component error inside the New Task dialog took down the entire
 * page (blank screen).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Caught by ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            padding: '24px',
            margin: '24px',
            borderRadius: '12px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow)'
          }}
        >
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '8px' }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: '12px' }}>
            The page hit an unexpected error. Details are below.
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: '12px',
              background: 'var(--color-bg-alt)',
              padding: '12px',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '240px'
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            type="button"
            onClick={this.handleReset}
            className="btn btn--primary"
            style={{ marginTop: '12px' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
