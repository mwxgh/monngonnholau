'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { showToast } from '@/lib/toast'

function CallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      showToast(
        'error',
        'Đăng nhập thất bại',
        'Không nhận được thông tin đăng nhập từ nhà cung cấp'
      )
      router.replace('/')
      return
    }
    localStorage.setItem('access_token', token)
    window.location.href = '/'
  }, [searchParams, router])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-neutral-500">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">Đang đăng nhập...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  )
}
