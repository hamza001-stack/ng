'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

/** EN | FR switch. Stores the choice in a cookie, then refreshes server-rendered content. */
export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations('Language');
  const router = useRouter();
  const set = (next: 'en' | 'fr') => {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  return (
    <div role="group" aria-label={t('switch')} className="language-toggle" style={{ display: 'inline-flex', gap: 2, fontSize: 12, fontWeight: 600 }}>
      {(['en', 'fr'] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={locale === l}
          onClick={() => set(l)}
          className="icon-button"
          style={{ width: 'auto', padding: '0 8px', opacity: locale === l ? 1 : 0.55, textDecoration: locale === l ? 'underline' : 'none' }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
