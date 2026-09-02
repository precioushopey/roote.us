import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth';

function Probe() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="email">{auth.email ?? 'none'}</span>
      <button onClick={() => auth.signUp('a@b.com', 'longenough')}>signup</button>
      <button onClick={() => auth.signUp('a@b.com', 'longenough')}>signup-dup</button>
      <button onClick={() => auth.signUp('bad', 'longenough')}>signup-bad-email</button>
      <button onClick={() => auth.signUp('c@d.com', 'short')}>signup-weak</button>
      <button onClick={() => auth.signOut()}>signout</button>
    </div>
  );
}

beforeEach(() => localStorage.clear());

describe('auth store', () => {
  it('signs up, persists an auth session, and rejects a duplicate email', async () => {
    const results: unknown[] = [];
    function Wired() {
      const auth = useAuth();
      return (
        <div>
          <span data-testid="email">{auth.email ?? 'none'}</span>
          <button onClick={() => results.push(auth.signUp('a@b.com', 'longenough'))}>signup</button>
          <button onClick={() => results.push(auth.signUp('a@b.com', 'longenough'))}>signup-again</button>
        </div>
      );
    }
    render(<AuthProvider><Wired /></AuthProvider>);
    act(() => screen.getByText('signup').click());
    expect(screen.getByTestId('email')).toHaveTextContent('a@b.com');
    act(() => screen.getByText('signup-again').click());
    expect(results[1]).toEqual({ ok: false, error: 'duplicate-email' });
  });

  it('rejects an invalid email and a too-short password', () => {
    let last: unknown;
    function Wired() {
      const auth = useAuth();
      return (
        <div>
          <button onClick={() => (last = auth.signUp('not-an-email', 'longenough'))}>bad-email</button>
          <button onClick={() => (last = auth.signUp('e@f.com', 'short'))}>weak</button>
        </div>
      );
    }
    render(<AuthProvider><Wired /></AuthProvider>);
    act(() => screen.getByText('bad-email').click());
    expect(last).toEqual({ ok: false, error: 'invalid-email' });
    act(() => screen.getByText('weak').click());
    expect(last).toEqual({ ok: false, error: 'weak-password' });
  });

  it('signs in with the right password and rejects the wrong one', () => {
    let last: unknown;
    function Wired() {
      const auth = useAuth();
      return (
        <div>
          <button onClick={() => auth.signUp('g@h.com', 'longenough')}>signup</button>
          <button onClick={() => auth.signOut()}>signout</button>
          <button onClick={() => (last = auth.signIn('g@h.com', 'longenough'))}>signin-right</button>
          <button onClick={() => (last = auth.signIn('g@h.com', 'nope-nope'))}>signin-wrong</button>
        </div>
      );
    }
    render(<AuthProvider><Wired /></AuthProvider>);
    act(() => screen.getByText('signup').click());
    act(() => screen.getByText('signout').click());
    act(() => screen.getByText('signin-wrong').click());
    expect(last).toEqual({ ok: false, error: 'wrong-password' });
    act(() => screen.getByText('signin-right').click());
    expect(last).toEqual({ ok: true });
  });

  it('persists the auth session across a remount (localStorage-backed)', () => {
    function Wired() {
      const auth = useAuth();
      return <button onClick={() => auth.signUp('i@j.com', 'longenough')}>signup</button>;
    }
    const { unmount } = render(<AuthProvider><Wired /></AuthProvider>);
    act(() => screen.getByText('signup').click());
    unmount();
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('email')).toHaveTextContent('i@j.com');
  });
});
