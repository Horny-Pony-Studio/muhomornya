import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';

interface Props {
  params: Promise<{ locale: string }>;
}

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('metadata');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-page text-center">
        <h1 className="font-heading text-4xl font-semibold text-brand-red tablet:text-5xl desktop:text-6xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-brand-dark/70">
          {t('description')}
        </p>
      </div>
    </main>
  );
}
