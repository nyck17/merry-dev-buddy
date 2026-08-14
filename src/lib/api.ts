export const API_URL = "https://xbwecudqsqvnsukkabxt.supabase.co/functions/v1/admin-license-api";

export async function apiCall(action: string, payload: any = {}) {
  const token = localStorage.getItem("admin_token");
  
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token || "",
      },
      body: JSON.stringify({ action, ...payload }),
    });

    const data = await res.json();

    if (!res.ok || data.ok === false) {
      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.reload();
        return;
      }
      throw new Error(data.error || "Erro na requisição");
    }

    return data;
  } catch (error: any) {
    console.error("API Call Error:", error);
    throw error;
  }
}
