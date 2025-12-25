export async function postDouble(apiUrl: string, value: string) {
  const res = await fetch(`${apiUrl}/double`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Erreur API");

  return data as { result: number };
}
