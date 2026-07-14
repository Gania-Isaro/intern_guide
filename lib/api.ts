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
