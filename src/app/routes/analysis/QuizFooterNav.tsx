import { createPortal } from 'react-dom';
import { useT, useLocalizedPath } from '@/i18n/LocaleProvider';
import { useMediaQuery } from '@/app/lib/useMediaQuery';
import { Button } from '@/app/components/roote';

/**
 * Shared Back/Next/Start-over bar every analysis screen renders below its
 * own content (2026-09-22: moved out of AnalysisShell's top chrome). Every
 * single-select screen re-added auto-advance-on-select the same day, right
 * after the quiz-redesign follow-up work dropped it in favor of an explicit
 * Next everywhere — Next stays wired on all of them as a manual fallback
 * (e.g. revisiting a question without re-clicking its answer), and it's
 * still the only way forward on Health History (multi-select) and Pattern
 * (image review, v3.1 §6). Start Over sits alone on the start side; Back
 * and Next are grouped on the end side, Next last so it's the natural
 * reading-order default action.
 *
 * Back is either a route link (`backPath`, matching
 * `backPathForAnalysisStep`'s contract — `null` means no sensible Back for
 * this step) or a local callback (`onBack`, for a screen with its own
 * in-place sub-view, e.g. GenderScreen's packaging picker, where "back"
 * means returning to a prior local view rather than changing route). Give
 * exactly one; if neither is given, that side renders an empty spacer so
 * Next doesn't jump position depending on whether Back exists.
 *
 * Below `sm`, this bar is portaled straight into `document.body` and pinned
 * to the bottom of the *viewport* with `position: fixed` — every analysis
 * screen's root `<section>` has `data-animate` for the route-reveal
 * animation (`marketing.css`'s `[data-animate]` rule), which sets
 * `will-change: transform` for the life of the element, not just during the
 * transition. Any `will-change: transform` (or `transform`/`filter`/etc.)
 * ancestor becomes the containing block for its `position: fixed`
 * descendants, so without the portal this bar would pin to the bottom of
 * that animated section instead of the screen — sitting right under the
 * last question, not the bottom of the phone. `sm` and up render inline,
 * unaffected, since only mobile needs the pin.
 */
export function QuizFooterNav({
  backPath,
  onBack,
  onStartOver,
  onNext,
  nextDisabled = false,
  nextLabel,
}: {
  backPath?: string | null;
  onBack?: () => void;
  onStartOver: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  const t = useT();
  const withLocale = useLocalizedPath();
  const isMobile = useMediaQuery('(max-width: 39.9975rem)');

  const buttons = (
    <>
      <Button variant="ghost" onClick={onStartOver}>
        {t('common.startOver')}
      </Button>
      <div className="flex items-center gap-2">
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            {t('common.back')}
          </Button>
        ) : backPath ? (
          <Button variant="ghost" to={withLocale(backPath)}>
            {t('common.back')}
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={onNext} disabled={nextDisabled}>
          {nextLabel ?? t('common.next')}
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return createPortal(
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background px-6 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(23,32,34,0.16)]">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">{buttons}</div>
      </div>,
      document.body,
    );
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">{buttons}</div>
    </div>
  );
}
