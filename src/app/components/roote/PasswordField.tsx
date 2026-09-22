import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useT } from '@/i18n/LocaleProvider';
import { cn } from '@/app/components/ui/utils';
import { IconButton } from './Button';

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  /** The caller's own field styling (e.g. `funnelField`) — this stays a
   *  drop-in replacement for a bare `<input type="password" className={…}>`. */
  inputClassName: string;
};

/**
 * A `type="password"` input with a show/hide toggle (an eye icon inside the
 * field) — every password field in the app (login, signup, funnel account
 * step, profile change-password) renders through this so the behavior and
 * icon placement stay consistent instead of five hand-rolled copies, each
 * password-only with no way to check what you typed before submitting.
 */
export function PasswordField({ inputClassName, ...inputProps }: PasswordFieldProps) {
  const t = useT();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...inputProps} type={visible ? 'text' : 'password'} className={cn(inputClassName, 'w-full pe-11')} />
      <IconButton
        label={visible ? t('common.hidePassword') : t('common.showPassword')}
        size="sm"
        onClick={() => setVisible((v) => !v)}
        className="absolute end-0.5 top-1/2 -translate-y-1/2"
      >
        {visible ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
      </IconButton>
    </div>
  );
}
