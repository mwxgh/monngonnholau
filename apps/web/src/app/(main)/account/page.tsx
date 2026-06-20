'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Lock,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { AcInput } from '@/components/ui/ac-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { fetchAdmin } from '@/lib/fetch-admin'

const API = process.env.NEXT_PUBLIC_API_URL

// "old" = Tỉnh → Huyện → Xã  |  "new" = Tỉnh → Xã
const ADDRESS_MODE = (process.env.NEXT_PUBLIC_ADDRESS_FORM ?? 'old') as
  | 'old'
  | 'new'
const PROVINCES_API =
  ADDRESS_MODE === 'old'
    ? 'https://provinces.open-api.vn/api/v1'
    : 'https://provinces.open-api.vn/api/v2'

// ── Types ────────────────────────────────────────────────────────

interface GeoOption {
  code: number
  name: string
}

interface Address {
  id: number
  fullName: string
  phone: string
  email?: string | null
  // new mode
  province?: string | null
  ward?: string | null
  // old mode
  oldProvince?: string | null
  oldDistrict?: string | null
  oldWard?: string | null
  street?: string | null
  detail: string
  isDefault: boolean
}

interface UserProfile {
  id: number
  email: string
  name?: string | null
  phone?: string | null
  avatar?: string | null
  addresses: Address[]
}

// ── Schemas ──────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^(0[3-9])\d{8}$/, 'Số điện thoại không hợp lệ')
})

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
    newPassword: z.string().min(6, 'Mật khẩu mới ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

const addressSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^(0[3-9])\d{8}$/, 'Số điện thoại không hợp lệ'),
  email: z.union([z.email('Email không hợp lệ'), z.literal('')]).optional(),
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  district:
    ADDRESS_MODE === 'old'
      ? z.string().min(1, 'Vui lòng chọn quận/huyện')
      : z.string().optional(),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  street: z.string().min(1, 'Vui lòng nhập số nhà, tên đường'),
  isDefault: z.boolean().optional()
})

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>
type AddressValues = z.infer<typeof addressSchema>

type Tab = 'profile' | 'password' | 'addresses'

const tabs: {
  id: Tab
  label: string
  icon: React.FC<{ className?: string }>
}[] = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User },
  { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
  { id: 'addresses', label: 'Địa chỉ giao hàng', icon: MapPin }
]

// ── AddressSelect ────────────────────────────────────────────────

function AddressSelect({
  placeholder,
  options,
  value,
  onChange,
  disabled,
  loading,
  error
}: {
  placeholder: string
  options: GeoOption[]
  value: string
  onChange: (name: string, code: number) => void
  disabled?: boolean
  loading?: boolean
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'rounded-lg p-0.5 transition duration-300',
          error ? 'bg-red-400/60' : 'bg-transparent'
        )}
      >
        <select
          value={value}
          onChange={(e) => {
            const selected = options.find((o) => o.name === e.target.value)
            if (selected) onChange(selected.name, selected.code)
          }}
          disabled={disabled || loading}
          className={cn(
            'flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black',
            'shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]',
            'focus:outline-none focus:ring-2 focus:ring-neutral-400 transition duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <option value="">{loading ? 'Đang tải...' : placeholder}</option>
          {options.map((o) => (
            <option key={o.code} value={o.name}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tab, setTab] = useState<Tab>('profile')
  const [addressDialog, setAddressDialog] = useState<{
    open: boolean
    editing: Address | null
  }>({ open: false, editing: null })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.replace('/')
      return
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('access_token')
        router.replace('/')
        return
      }
    } catch {
      localStorage.removeItem('access_token')
      router.replace('/')
      return
    }

    fetchAdmin(`${API}/api/users/me`)
      .then((r) => r.json())
      .then((data: UserProfile) => setUser(data))
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const initials = (user.name ?? user.email)[0].toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">
              {user.name ?? 'Chưa cập nhật tên'}
            </h1>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <nav className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors border-l-2 ${
                    tab === id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-transparent text-neutral-600 hover:bg-gray-50 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {tab === 'profile' && (
              <ProfileTab
                user={user}
                onSaved={(updated) => setUser({ ...user, ...updated })}
              />
            )}
            {tab === 'password' && <PasswordTab />}
            {tab === 'addresses' && (
              <AddressesTab
                addresses={user.addresses}
                onAdd={() => setAddressDialog({ open: true, editing: null })}
                onEdit={(a) => setAddressDialog({ open: true, editing: a })}
                onDelete={async (id) => {
                  await fetchAdmin(`${API}/api/users/me/addresses/${id}`, {
                    method: 'DELETE'
                  })
                  setUser({
                    ...user,
                    addresses: user.addresses.filter((a) => a.id !== id)
                  })
                }}
                onSetDefault={async (id) => {
                  const res = await fetchAdmin(
                    `${API}/api/users/me/addresses/${id}/default`,
                    { method: 'PATCH' }
                  )
                  if (res.ok) {
                    setUser({
                      ...user,
                      addresses: user.addresses.map((a) => ({
                        ...a,
                        isDefault: a.id === id
                      }))
                    })
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      <AddressDialog
        open={addressDialog.open}
        editing={addressDialog.editing}
        onClose={() => setAddressDialog({ open: false, editing: null })}
        onSaved={(address) => {
          const isEdit = !!addressDialog.editing
          let updated: Address[]
          if (isEdit) {
            updated = user.addresses.map((a) =>
              a.id === address.id ? address : a
            )
            if (address.isDefault) {
              updated = updated.map((a) => ({
                ...a,
                isDefault: a.id === address.id
              }))
            }
          } else {
            updated = address.isDefault
              ? [
                  address,
                  ...user.addresses.map((a) => ({ ...a, isDefault: false }))
                ]
              : [...user.addresses, address]
          }
          updated.sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
          setUser({ ...user, addresses: updated })
          setAddressDialog({ open: false, editing: null })
        }}
      />
    </div>
  )
}

// ── Profile tab ──────────────────────────────────────────────────

function ProfileTab({
  user,
  onSaved
}: {
  user: UserProfile
  onSaved: (data: Partial<UserProfile>) => void
}) {
  const [serverMsg, setServerMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name ?? '', phone: user.phone ?? '' }
  })

  async function onSubmit(values: ProfileValues) {
    setServerMsg(null)
    try {
      const res = await fetchAdmin(`${API}/api/users/me`, {
        method: 'PATCH',
        body: JSON.stringify(values)
      })
      const data = await res.json()
      if (!res.ok) {
        setServerMsg({ type: 'error', text: data.message ?? 'Có lỗi xảy ra' })
        return
      }
      onSaved(data)
      setServerMsg({ type: 'success', text: 'Cập nhật thành công' })
    } catch {
      setServerMsg({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ'
      })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-neutral-800 mb-6">
        Thông tin cá nhân
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 max-w-md"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ tên</FormLabel>
                <FormControl>
                  <AcInput placeholder="Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Email</FormLabel>
            <AcInput
              value={user.email}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
          </FormItem>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <AcInput type="tel" placeholder="0912 345 678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverMsg && (
            <p
              className={`text-sm ${
                serverMsg.type === 'success' ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {serverMsg.text}
            </p>
          )}

          <Button
            type="submit"
            size="pill"
            className="w-full mt-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

// ── Password tab ─────────────────────────────────────────────────

function PasswordTab() {
  const [serverMsg, setServerMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  async function onSubmit(values: PasswordValues) {
    setServerMsg(null)
    try {
      const res = await fetchAdmin(`${API}/api/users/me/password`, {
        method: 'PATCH',
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setServerMsg({ type: 'error', text: data.message ?? 'Có lỗi xảy ra' })
        return
      }
      setServerMsg({
        type: 'success',
        text: data.message ?? 'Đổi mật khẩu thành công'
      })
      form.reset()
    } catch {
      setServerMsg({
        type: 'error',
        text: 'Không thể kết nối đến máy chủ'
      })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-base font-semibold text-neutral-800 mb-6">
        Đổi mật khẩu
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 max-w-md"
        >
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu hiện tại</FormLabel>
                <FormControl>
                  <AcInput type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormControl>
                  <AcInput
                    type="password"
                    placeholder="Ít nhất 6 ký tự"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                <FormControl>
                  <AcInput
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverMsg && (
            <p
              className={`text-sm ${
                serverMsg.type === 'success' ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {serverMsg.text}
            </p>
          )}

          <Button
            type="submit"
            size="pill"
            className="w-full mt-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

// ── Addresses tab ────────────────────────────────────────────────

function AddressesTab({
  addresses,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault
}: {
  addresses: Address[]
  onAdd: () => void
  onEdit: (a: Address) => void
  onDelete: (id: number) => Promise<void>
  onSetDefault: (id: number) => Promise<void>
}) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [defaultingId, setDefaultingId] = useState<number | null>(null)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-neutral-800">
          Địa chỉ giao hàng
        </h2>
        <Button size="sm" onClick={onAdd} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Thêm địa chỉ
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Chưa có địa chỉ nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-lg border p-4 transition-colors ${
                address.isDefault
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-neutral-800">
                      {address.fullName}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {address.phone}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" />
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                    {address.detail}
                  </p>
                  {address.email && (
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {address.email}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Đặt làm mặc định"
                      disabled={defaultingId === address.id}
                      onClick={async () => {
                        setDefaultingId(address.id)
                        await onSetDefault(address.id)
                        setDefaultingId(null)
                      }}
                    >
                      <Check className="w-3.5 h-3.5 text-neutral-400" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Sửa"
                    onClick={() => onEdit(address)}
                  >
                    <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Xóa"
                    disabled={deletingId === address.id}
                    onClick={async () => {
                      if (!confirm('Xóa địa chỉ này?')) return
                      setDeletingId(address.id)
                      await onDelete(address.id)
                      setDeletingId(null)
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Address dialog ───────────────────────────────────────────────

function AddressDialog({
  open,
  editing,
  onClose,
  onSaved
}: {
  open: boolean
  editing: Address | null
  onClose: () => void
  onSaved: (address: Address) => void
}) {
  const [serverError, setServerError] = useState('')

  // Cascading address state
  const [provinces, setProvinces] = useState<GeoOption[]>([])
  const [districts, setDistricts] = useState<GeoOption[]>([])
  const [wards, setWards] = useState<GeoOption[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null)
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    number | null
  >(null)

  // Refs to hold pending pre-fill values (populated when editing)
  const pendingDistrict = useRef<string | null>(null)
  const pendingWard = useRef<string | null>(null)

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      province: '',
      district: '',
      ward: '',
      street: '',
      isDefault: false
    }
  })

  // Load provinces once (on first open)
  useEffect(() => {
    if (!open || provinces.length > 0) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingProvinces(true)
    fetch(`${PROVINCES_API}/p/`)
      .then((r) => r.json())
      .then((data: GeoOption[]) => setProvinces(data))
      .catch(() => {})
      .finally(() => setLoadingProvinces(false))
  }, [open, provinces.length])

  // Reset form + set pending fills when dialog opens or editing changes
  useEffect(() => {
    if (!open) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDistricts([])
    setWards([])
    setSelectedProvinceCode(null)
    setSelectedDistrictCode(null)
    pendingDistrict.current = null
    pendingWard.current = null
    setServerError('')

    if (editing) {
      const storedProvince =
        ADDRESS_MODE === 'old' ? editing.oldProvince : editing.province
      const storedDistrict = ADDRESS_MODE === 'old' ? editing.oldDistrict : null
      const storedWard = ADDRESS_MODE === 'old' ? editing.oldWard : editing.ward

      pendingDistrict.current = storedDistrict ?? null
      pendingWard.current = storedWard ?? null

      form.reset({
        fullName: editing.fullName,
        phone: editing.phone,
        email: editing.email ?? '',
        province: storedProvince ?? '',
        district: storedDistrict ?? '',
        ward: storedWard ?? '',
        street: editing.street ?? '',
        isDefault: editing.isDefault
      })

      // Trigger cascade if provinces are already loaded
      if (provinces.length > 0 && storedProvince) {
        const p = provinces.find((p) => p.name === storedProvince)
        if (p) setSelectedProvinceCode(p.code)
      }
    } else {
      form.reset({
        fullName: '',
        phone: '',
        email: '',
        province: '',
        district: '',
        ward: '',
        street: '',
        isDefault: false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing])

  // When provinces load (after dialog opened) — apply pending province for edit
  useEffect(() => {
    if (provinces.length === 0 || !editing || !open) return
    const storedProvince =
      ADDRESS_MODE === 'old' ? editing.oldProvince : editing.province
    if (!storedProvince || selectedProvinceCode !== null) return
    const p = provinces.find((p) => p.name === storedProvince)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p) setSelectedProvinceCode(p.code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinces])

  // Load districts (old) or wards (new) when province changes
  useEffect(() => {
    if (!selectedProvinceCode) return
    form.setValue('district', '')
    form.setValue('ward', '')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWards([])

    if (ADDRESS_MODE === 'old') {
      setLoadingDistricts(true)
      setDistricts([])
      setSelectedDistrictCode(null)
      fetch(`${PROVINCES_API}/p/${selectedProvinceCode}?depth=2`)
        .then((r) => r.json())
        .then((data) => setDistricts(data.districts ?? []))
        .catch(() => {})
        .finally(() => setLoadingDistricts(false))
    } else {
      setLoadingWards(true)
      fetch(`${PROVINCES_API}/p/${selectedProvinceCode}?depth=2`)
        .then((r) => r.json())
        .then((data) => setWards(data.wards ?? []))
        .catch(() => {})
        .finally(() => setLoadingWards(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceCode])

  // When districts load — apply pending district (edit mode, old)
  useEffect(() => {
    if (districts.length === 0 || !pendingDistrict.current) return
    const d = districts.find((d) => d.name === pendingDistrict.current)
    if (d) {
      form.setValue('district', d.name)
      setSelectedDistrictCode(d.code)
      pendingDistrict.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districts])

  // Load wards when district changes (old mode)
  useEffect(() => {
    if (ADDRESS_MODE !== 'old' || !selectedDistrictCode) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingWards(true)
    setWards([])
    form.setValue('ward', '')
    fetch(`${PROVINCES_API}/d/${selectedDistrictCode}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards ?? []))
      .catch(() => {})
      .finally(() => setLoadingWards(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrictCode])

  // When wards load — apply pending ward (edit mode)
  useEffect(() => {
    if (wards.length === 0 || !pendingWard.current) return
    const w = wards.find((w) => w.name === pendingWard.current)
    if (w) {
      form.setValue('ward', w.name)
      pendingWard.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wards])

  async function onSubmit(values: AddressValues) {
    setServerError('')

    // Construct detail same as order modal
    const parts = [
      values.street,
      values.ward,
      values.district,
      values.province
    ].filter(Boolean)
    const detail = parts.join(', ')

    const payload = {
      fullName: values.fullName,
      phone: values.phone,
      email: values.email || undefined,
      street: values.street,
      detail,
      isDefault: values.isDefault,
      ...(ADDRESS_MODE === 'old'
        ? {
            oldProvince: values.province,
            oldDistrict: values.district,
            oldWard: values.ward
          }
        : {
            province: values.province,
            ward: values.ward
          })
    }

    try {
      const url = editing
        ? `${API}/api/users/me/addresses/${editing.id}`
        : `${API}/api/users/me/addresses`
      const res = await fetchAdmin(url, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.message ?? 'Có lỗi xảy ra')
        return
      }
      onSaved(data as Address)
    } catch {
      setServerError('Không thể kết nối đến máy chủ')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Name + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Họ tên <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <AcInput placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Số điện thoại <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <AcInput
                        type="tel"
                        placeholder="0912 345 678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <AcInput
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Province */}
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tỉnh / Thành phố <span className="text-primary">*</span>
                  </FormLabel>
                  <AddressSelect
                    placeholder="Chọn tỉnh/thành phố"
                    options={provinces}
                    value={field.value}
                    loading={loadingProvinces}
                    onChange={(name, code) => {
                      field.onChange(name)
                      setSelectedProvinceCode(code)
                    }}
                    error={form.formState.errors.province?.message}
                  />
                </FormItem>
              )}
            />

            {/* District — old mode only */}
            {ADDRESS_MODE === 'old' && (
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Quận / Huyện <span className="text-primary">*</span>
                    </FormLabel>
                    <AddressSelect
                      placeholder="Chọn quận/huyện"
                      options={districts}
                      value={field.value ?? ''}
                      loading={loadingDistricts}
                      disabled={!selectedProvinceCode}
                      onChange={(name, code) => {
                        field.onChange(name)
                        setSelectedDistrictCode(code)
                      }}
                      error={form.formState.errors.district?.message}
                    />
                  </FormItem>
                )}
              />
            )}

            {/* Ward */}
            <FormField
              control={form.control}
              name="ward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {ADDRESS_MODE === 'old'
                      ? 'Phường / Xã'
                      : 'Xã / Phường / Thị trấn'}{' '}
                    <span className="text-primary">*</span>
                  </FormLabel>
                  <AddressSelect
                    placeholder={
                      ADDRESS_MODE === 'old'
                        ? 'Chọn phường/xã'
                        : 'Chọn xã/phường/thị trấn'
                    }
                    options={wards}
                    value={field.value}
                    loading={loadingWards}
                    disabled={
                      ADDRESS_MODE === 'old'
                        ? !selectedDistrictCode
                        : !selectedProvinceCode
                    }
                    onChange={(name) => field.onChange(name)}
                    error={form.formState.errors.ward?.message}
                  />
                </FormItem>
              )}
            />

            {/* Street */}
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Số nhà, tên đường <span className="text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <AcInput placeholder="VD: 12 Nguyễn Huệ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Default checkbox */}
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={field.onChange}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-neutral-700">
                      Đặt làm địa chỉ mặc định
                    </span>
                  </label>
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-sm text-red-500">{serverError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="pill"
                className="flex-1"
                onClick={onClose}
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                size="pill"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? 'Đang lưu...'
                  : editing
                    ? 'Cập nhật'
                    : 'Thêm địa chỉ'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
