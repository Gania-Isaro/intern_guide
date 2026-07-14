const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ApiResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

export async function apiPost(
  endpoint: string,
  body: Record<string, unknown>
): Promise<ApiResult> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || data.message || "Something went wrong. Please try again." };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, error: "Could not reach the server. Please try again later." };
  }
}
export async function apiGet(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
): Promise<ApiResult> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    // skip empty filters so the URL stays clean (?search=&industry= -> nothing)
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  const url = `${API_URL}${endpoint}${qs ? `?${qs}` : ""}`;

  try {
    const response = await fetch(url, { credentials: "include" });
    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || "Something went wrong. Please try again." };
    }

    return { ok: true, data };
  } catch {
    return { ok: false, error: "Could not reach the server. Please try again later." };
  }
}
