import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { lsGet, lsSet } from './persistence';
import { readOrders } from './orders';

/** `digest: null` = a guest account created by checking out (no password set yet) —
 *  signed back into with order number + email via `signInWithOrder`. */
type Account = { email: string; digest: string | null };
type AuthSession = { email: string; since: string } | null;

type SignUpResult = { ok: true } | { ok: false; error: 'invalid-email' | 'weak-password' | 'duplicate-email' };
type SignInResult = { ok: true } | { ok: false; error: 'not-found' | 'wrong-password' | 'no-password' };
type OrderSignInResult = { ok: true } | { ok: false; error: 'order-not-found' };
type ChangePasswordResult =
  | { ok: true }
  | { ok: false; error: 'not-signed-in' | 'wrong-password' | 'weak-password' };

const ACCOUNTS_KEY = 'accounts';
const SESSION_KEY = 'authSession';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * NOT cryptographic. A stable, non-reversible-looking string derived from the password, used only
 * to detect "same password on sign-in" for this mock/demo auth. Real auth is a backend concern —
 * see the TODO on AuthProvider below.
 */
function digestOf(password: string): string {
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    h = (Math.imul(31, h) + password.charCodeAt(i)) | 0;
  }
  return `d${h}`;
}

function readAccounts(): Record<string, Account> {
  return lsGet<Record<string, Account>>(ACCOUNTS_KEY, {});
}
function writeAccounts(accounts: Record<string, Account>): void {
  lsSet(ACCOUNTS_KEY, accounts);
}
function readSession(): AuthSession {
  return lsGet<AuthSession>(SESSION_KEY, null);
}
function writeSession(session: AuthSession): void {
  lsSet(SESSION_KEY, session);
}

type Ctx = {
  email: string | null;
  since: string | null;
  signUp: (email: string, password: string) => SignUpResult;
  signIn: (email: string, password: string) => SignInResult;
  signInWithOrder: (email: string, orderId: string) => OrderSignInResult;
  signInAfterPurchase: (email: string) => void;
  signOut: () => void;
  changePassword: (current: string, next: string) => ChangePasswordResult;
};

const AuthContext = createContext<Ctx | null>(null);

// TODO: real auth (backend) — Shopify customer accounts / Supabase / Clerk. Everything in this
// file is a client-only mock so the account-creation UI has something real to talk to.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>(readSession);

  function startSession(email: string) {
    const next: AuthSession = { email, since: new Date().toISOString() };
    writeSession(next);
    setSession(next);
  }

  const value = useMemo<Ctx>(
    () => ({
      email: session?.email ?? null,
      since: session?.since ?? null,
      signUp(email, password) {
        if (!EMAIL_RE.test(email)) return { ok: false, error: 'invalid-email' };
        if (password.length < 8) return { ok: false, error: 'weak-password' };
        const accounts = readAccounts();
        if (accounts[email]) return { ok: false, error: 'duplicate-email' };
        accounts[email] = { email, digest: digestOf(password) };
        writeAccounts(accounts);
        const next: AuthSession = { email, since: new Date().toISOString() };
        writeSession(next);
        setSession(next);
        return { ok: true };
      },
      signIn(email, password) {
        const accounts = readAccounts();
        const account = accounts[email];
        if (!account) return { ok: false, error: 'not-found' };
        if (account.digest === null) return { ok: false, error: 'no-password' };
        if (account.digest !== digestOf(password)) return { ok: false, error: 'wrong-password' };
        startSession(email);
        return { ok: true };
      },
      signInWithOrder(email, orderId) {
        const e = email.trim().toLowerCase();
        const id = orderId.trim();
        const match = readOrders().find((o) => o.id === id && o.email?.toLowerCase() === e);
        if (!match) return { ok: false, error: 'order-not-found' };
        ensureAccount(match.email!);
        startSession(match.email!);
        return { ok: true };
      },
      // Guest checkout (no signup step): the buyer is signed in on the spot so the
      // thank-you page and /account work straight away. Mock only — real auth would
      // issue this session server-side after payment.
      signInAfterPurchase(email) {
        const e = email.trim();
        ensureAccount(e);
        startSession(e);
      },
      signOut() {
        writeSession(null);
        setSession(null);
      },
      changePassword(current, next) {
        if (!session) return { ok: false, error: 'not-signed-in' };
        const accounts = readAccounts();
        const account = accounts[session.email];
        if (!account || account.digest === null || account.digest !== digestOf(current)) {
          return { ok: false, error: 'wrong-password' };
        }
        if (next.length < 8) return { ok: false, error: 'weak-password' };
        accounts[session.email] = { ...account, digest: digestOf(next) };
        writeAccounts(accounts);
        return { ok: true };
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within <AuthProvider>');
  return c;
}

/** Creates a password-less (guest) account for `email` if none exists yet. */
function ensureAccount(email: string): void {
  const accounts = readAccounts();
  if (accounts[email]) return;
  accounts[email] = { email, digest: null };
  writeAccounts(accounts);
}
