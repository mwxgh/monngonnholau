'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'

interface Settings {
  store_name: string
  store_phone: string
  store_email: string
  store_website: string
  shipping_fee: string
  shipping_eta: string
}

const FIELD_LABELS: { key: keyof Settings; label: string; type?: string }[] = [
  { key: 'store_name', label: 'Tên cửa hàng' },
  { key: 'store_phone', label: 'Số điện thoại', type: 'tel' },
  { key: 'store_email', label: 'Email liên hệ', type: 'email' },
  { key: 'store_website', label: 'Website' },
  { key: 'shipping_fee', label: 'Phí giao hàng mặc định (₫)', type: 'number' },
  { key: 'shipping_eta', label: 'Thời gian giao hàng dự kiến' }
]

function authHeaders() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // key being saved
  const [saved, setSaved] = useState<string | null>(null)

  // Password
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<{
    type: 'ok' | 'err'
    text: string
  } | null>(null)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/settings`, {
      headers: authHeaders()
    })
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  async function saveField(key: keyof Settings, value: string) {
    setSaving(key)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/settings`,
        {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ [key]: value })
        }
      )
      const data = await res.json()
      setSettings(data)
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } finally {
      setSaving(null)
    }
  }

  async function handleChangePassword() {
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'err', text: 'Mật khẩu mới không khớp.' })
      return
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ type: 'err', text: 'Mật khẩu phải ít nhất 8 ký tự.' })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`,
        {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({
            currentPassword: pwForm.current,
            newPassword: pwForm.next
          })
        }
      )
      if (res.ok) {
        setPwMsg({ type: 'ok', text: 'Đổi mật khẩu thành công.' })
        setPwForm({ current: '', next: '', confirm: '' })
      } else {
        const d = await res.json()
        setPwMsg({ type: 'err', text: d?.message ?? 'Đổi mật khẩu thất bại.' })
      }
    } catch {
      setPwMsg({ type: 'err', text: 'Không thể kết nối máy chủ.' })
    } finally {
      setPwSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Cấu hình thông tin cửa hàng và vận chuyển.
        </p>
      </div>

      {/* Store + Shipping */}
      {[
        {
          title: 'Thông tin cửa hàng',
          desc: 'Hiển thị trên website và email khách hàng.',
          keys: [
            'store_name',
            'store_phone',
            'store_email',
            'store_website'
          ] as (keyof Settings)[]
        },
        {
          title: 'Vận chuyển',
          desc: 'Áp dụng cho đơn hàng nhanh.',
          keys: ['shipping_fee', 'shipping_eta'] as (keyof Settings)[]
        }
      ].map(({ title, desc, keys }) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FIELD_LABELS.filter((f) => keys.includes(f.key)).map(
              ({ key, label, type }) => {
                const val = settings[key] ?? ''
                return (
                  <div key={key} className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700">
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={type ?? 'text'}
                        defaultValue={val}
                        id={`field-${key}`}
                        className="flex-1 h-9 rounded-lg border border-border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        onClick={() => {
                          const el = document.getElementById(
                            `field-${key}`
                          ) as HTMLInputElement
                          saveField(key, el.value)
                        }}
                        disabled={saving === key}
                        className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                          saved === key
                            ? 'bg-emerald-500 text-white'
                            : 'bg-primary text-white hover:opacity-90 disabled:opacity-60'
                        }`}
                      >
                        {saving === key
                          ? '...'
                          : saved === key
                            ? 'Đã lưu ✓'
                            : 'Lưu'}
                      </button>
                    </div>
                  </div>
                )
              }
            )}
          </CardContent>
        </Card>
      ))}

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Bảo mật tài khoản quản trị.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Mật khẩu hiện tại', field: 'current' as const },
            { label: 'Mật khẩu mới (ít nhất 8 ký tự)', field: 'next' as const },
            { label: 'Xác nhận mật khẩu mới', field: 'confirm' as const }
          ].map(({ label, field }) => (
            <div key={field} className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">
                {label}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm[field]}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, [field]: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="w-full h-9 rounded-lg border border-border px-3 pr-14 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {field === 'current' && (
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? 'Ẩn' : 'Hiện'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {pwMsg && (
            <p
              className={`text-sm ${pwMsg.type === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {pwMsg.text}
            </p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={
              pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm
            }
            className="h-9 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {pwSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
