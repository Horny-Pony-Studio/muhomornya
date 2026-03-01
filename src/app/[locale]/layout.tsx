import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Assistant, Montserrat } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { ogLocales, siteUrl, siteName } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';
import { Analytics } from '@/components/seo/Analytics';
import '../globals.css';

const assistant = Assistant({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-assistant',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['600'],
  variable: '--font-montserrat',
  display: 'swap',
});

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  const titles: Record<Locale, string> = {
    uk: 'Крамниця Мухоморня — Купити сушений мухомор в Україні',
    en: 'Muhomornya Store — Buy Dried Amanita Muscaria',
    de: 'Muhomornya Shop — Getrocknete Fliegenpilze kaufen',
  };

  const descriptions: Record<Locale, string> = {
    uk: 'Купити сушений мухомор в Україні. Мікродозинг мухомора, їжовик гребінчастий, кордіцепс. Доставка по всій Україні та за кордон.',
    en: "Buy Amanita Muscaria in Ukraine. Microdosing, Lion's Mane, Cordyceps. Worldwide shipping.",
    de: 'Getrocknete Fliegenpilze kaufen. Mikrodosierung, Igel-Stachelbart, Cordyceps. Weltweiter Versand.',
  };

  const localePath = typedLocale === 'uk' ? '' : `/${typedLocale}`;
  const canonicalUrl = `${siteUrl}${localePath}`;

  return {
    title: {
      default: titles[typedLocale],
      template: `%s | ${siteName}`,
    },
    description: descriptions[typedLocale],
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'x-default': siteUrl,
        uk: siteUrl,
        en: `${siteUrl}/en`,
        de: `${siteUrl}/de`,
      },
    },
    openGraph: {
      type: 'website',
      siteName,
      locale: ogLocales[typedLocale],
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
    },
    verification: {
      google: [
        'a65ZPz63ul8ZnzWDuw41wX3hSrdmRuH_UdUI86od9kg',
        'ssiEuIWL6wIaalWEzCHxqeKRLnpU0ahTxJsrqvmDlgE',
        'eN2QH9P6dqph6glIB5d_ZG_pdi0tb9nwXPTOP1G0DDs',
      ],
      other: {
        'facebook-domain-verification': 'jgmcieakjqdstk6gsulph7s8byskoj',
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${assistant.variable} ${montserrat.variable}`}>
      <body className="font-body antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <OrganizationJsonLd />
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
