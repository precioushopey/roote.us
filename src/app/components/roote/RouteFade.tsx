import { AnimatePresence, motion } from 'motion/react';
import { useLocation, useOutlet } from 'react-router';
import { useReducedMotion } from '@/app/lib/useReducedMotion';
import { motion as motionTokens } from '@/styles/tokens';

/**
 * Cross-fades the routed page content on navigation while the surrounding
 * shell chrome (header/sidebar/footer) stays put — drop-in replacement for
 * `<Outlet />` at a shell's route boundary. `useOutlet()` (not `<Outlet />`
 * directly) is required: AnimatePresence needs the outgoing element handed to
 * it explicitly so it can keep rendering it during the exit transition.
 *
 * `context`, when given, is forwarded exactly like `<Outlet context={...}>`
 * — the routed screen reads it via `useOutletContext()`. Optional: every
 * other shell using `RouteFade` omits it and is unaffected.
 */
export function RouteFade({ context }: { context?: unknown } = {}) {
  const element = useOutlet(context);
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return element;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: motionTokens.durationRoute / 1000, ease: motionTokens.easeStandardBezier }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}
