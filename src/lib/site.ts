export function publicSiteUrl() {
  const url = (process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3100').replace(
    /\/$/,
    '',
  );
  if (url.includes('chatgpt.site')) {
    return 'http://127.0.0.1:3100';
  }
  return url;
}
