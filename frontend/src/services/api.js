
// Central API-hjälpare för JENSENOnline.

let csrfToken = null;

// Hämtar en ny CSRF-token från backend.
export async function getCsrfToken() {
  const response = await fetch("/api/security/csrf-token", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not retrieve CSRF token.");
  }

  const data = await response.json();

  csrfToken = data.token;

  return csrfToken;
}

// Används för API-anrop som ändrar data.
export async function secureFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const headers = new Headers(options.headers);

  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(method)
  ) {
    // Hämta ny token för varje ändrande förfrågan.
    const token = await getCsrfToken();

    headers.set("X-CSRF-TOKEN", token);
  }

  return fetch(url, {
    ...options,
    method,
    credentials: "same-origin",
    headers,
  });
}
