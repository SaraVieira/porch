export const json = (data: any, options?: { status?: number; headers?: Record<string, string> }) =>
  new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
