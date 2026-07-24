import { Helmet } from "react-helmet-async";

const SITE = "https://abyss-expeditions.com";
const SITE_NAME = "ABYSS — Deep Sea Exploration Co.";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  jsonLd?: object;
}

export function Seo({ title, description, path = "/", jsonLd }: SeoProps) {
  const url = `${SITE}${path}`;
  const fullTitle = title === "Home" ? SITE_NAME : `${title} · ABYSS`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE}/og.jpg`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE}/og.jpg`} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ABYSS Deep Sea Exploration Co.",
  url: SITE,
  slogan: "Explore the Last Unknown World.",
  description:
    "Luxury submarine expeditions from sunlit coral reefs to the hadal trench.",
  logo: `${SITE}/favicon.svg`,
};
