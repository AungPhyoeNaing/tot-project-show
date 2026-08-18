// src/utils/mediaUrl.js

/**
 * Resolves media/avatar URLs to ensure they work across localhost, local IP, and public domains (totumdy.com).
 * Fixes mixed content and old hardcoded IP addresses in stored URLs.
 */
export const formatMediaUrl = (url, fallback = null) => {
  if (!url) return fallback;

  // If url is a blob: or data: (local preview)
  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }

  // If url is a local asset path (e.g. /assets/images/user.png)
  if (url.startsWith("/assets/") || url.startsWith("assets/")) {
    return url.startsWith("/") ? url : `/${url}`;
  }

  const isTotDomain =
    typeof window !== "undefined" &&
    (window.location.hostname === "totumdy.com" ||
      window.location.hostname.endsWith(".totumdy.com"));

  const proto =
    typeof window !== "undefined" ? window.location.protocol || "https:" : "https:";
  const host =
    typeof window !== "undefined" && window.location.hostname
      ? window.location.hostname
      : "127.0.0.1";

  const apiBase = isTotDomain
    ? `${proto}//api.totumdy.com`
    : `http://${host}:8000`;

  // If url contains /storage/
  if (url.includes("/storage/")) {
    const storagePath = url.substring(url.indexOf("/storage/"));
    return `${apiBase}${storagePath}`;
  }

  // If url starts with storage/
  if (url.startsWith("storage/")) {
    return `${apiBase}/${url}`;
  }

  // If it's an absolute URL with insecure http on an https page, upgrade if totumdy.com
  if (isTotDomain && url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }

  return url;
};

export default formatMediaUrl;
