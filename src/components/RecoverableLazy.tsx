import { Component, type ReactNode } from 'react';
import './recoverableLazy.css';

interface Props {
  children: ReactNode;
  errorTitle: string;
  onBeforeReload?: () => boolean;
}

interface State {
  failed: boolean;
  couldNotKeepPlace: boolean;
}

/** Keep a failed lazy import from unmounting the surrounding lesson. */
export default class RecoverableLazy extends Component<Props, State> {
  state: State = { failed: false, couldNotKeepPlace: false };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  private reload = () => {
    try {
      if (this.props.onBeforeReload && !this.props.onBeforeReload()) {
        this.setState({ couldNotKeepPlace: true });
        return;
      }
    } catch {
      this.setState({ couldNotKeepPlace: true });
      return;
    }
    // React.lazy caches a rejected import. Reload the document only after the
    // learner chooses to retry and their lesson has written its checkpoint.
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return <section className="lazy-recovery" role="alert">
      <h2>{this.props.errorTitle}</h2>
      <p>Check your connection, then reload this page to try again.</p>
      <button type="button" onClick={this.reload}>Reload page</button>
      {this.state.couldNotKeepPlace && <p role="status">This page could not keep your place. Try again, or use Previous step to review your answer.</p>}
    </section>;
  }
}
