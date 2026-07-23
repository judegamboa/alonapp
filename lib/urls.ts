/**
 * The site's own origin. Used for auth redirects, links inside transactional
 * emails, and `metadataBase` for canonical/OG URLs — they must all agree, so
 * they read this one function rather than each reaching for the env var.
 */
export function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
