export async function fetchAdmin(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''
  const isFormData = options.body instanceof FormData
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${token}`
    }
  })

  if (res.status === 401) {
    localStorage.removeItem('access_token')
    window.location.href = '/'
    throw new Error('Unauthorized')
  }

  return res
}
