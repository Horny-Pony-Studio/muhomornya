interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Крамниця Мухоморня',
        logo: 'https://muhomornya.com/images/muhomornya-logotype.png',
        sameAs: ['https://instagram.com/zazemlena.in.ua'],
        url: 'https://muhomornya.com',
      }}
    />
  );
}
