// Use the proxy endpoint instead of direct HTTP call
export const API_BASE = "/api/proxy";

async function request(path: string, opts: RequestInit = {}) {
  // Build the URL to hit your proxy, passing the original path as a query param
  const url = `${API_BASE}?path=${encodeURIComponent(path)}`;
  
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text();
    let payload: any = text;
    try {
      payload = JSON.parse(text || "null");
    } catch (e) {
      // ignore
    }
    const err: any = new Error(res.statusText || "Request failed");
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  // Try parse JSON, fallback to null
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchCustomers() {
  return await request('/customers.php');
}

export async function fetchCustomerById(id: string | number) {
  return await request(`/customers.php?id=${encodeURIComponent(String(id))}`);
}
