'use client'

import { useEffect, useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { fetchAdmin } from '@/lib/fetch-admin'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'

interface Subscriber {
  id: number
  email: string
  createdAt: string
}

const API = process.env.NEXT_PUBLIC_API_URL

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{
    ok: boolean
    message: string
  } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchAdmin(`${API}/api/newsletter`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data?.message ?? `Lỗi ${r.status}`)
        setSubscribers(Array.isArray(data) ? data : [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(subscriber: Subscriber) {
    if (!window.confirm(`Xoá email "${subscriber.email}" khỏi danh sách?`)) {
      return
    }
    setDeletingId(subscriber.id)
    try {
      const res = await fetchAdmin(`${API}/api/newsletter/${subscriber.id}`, {
        method: 'DELETE'
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? `Lỗi ${res.status}`)
      setSubscribers((prev) => prev.filter((s) => s.id !== subscriber.id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(subscriber.id)
        return next
      })
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Xoá thất bại')
    } finally {
      setDeletingId(null)
    }
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllFiltered() {
    setSelectedIds((prev) => {
      const allSelected =
        filtered.length > 0 && filtered.every((s) => prev.has(s.id))
      const next = new Set(prev)
      for (const s of filtered) {
        if (allSelected) next.delete(s.id)
        else next.add(s.id)
      }
      return next
    })
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (
      !window.confirm(`Gửi bản tin này đến ${selectedIds.size} người đã chọn?`)
    ) {
      return
    }
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetchAdmin(`${API}/api/newsletter/broadcast`, {
        method: 'POST',
        body: JSON.stringify({
          subject,
          content,
          subscriberIds: Array.from(selectedIds)
        })
      })
      const data = await res.json().catch(() => null)
      if (!res.ok)
        throw new Error(data?.message ?? `Gửi thất bại (${res.status})`)
      setSendResult({ ok: true, message: data.message })
      setSubject('')
      setContent('')
    } catch (e) {
      setSendResult({
        ok: false,
        message: e instanceof Error ? e.message : 'Gửi thất bại'
      })
    } finally {
      setSending(false)
    }
  }

  const filtered = search
    ? subscribers.filter((s) =>
        s.email.toLowerCase().includes(search.toLowerCase())
      )
    : subscribers

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bản tin</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Danh sách khách hàng đã đăng ký nhận bản tin.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Người đăng ký</p>
          <p className="text-2xl font-bold mt-1">
            {subscribers.length.toLocaleString('vi-VN')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Soạn & gửi bản tin</CardTitle>
          <CardDescription>
            Đã chọn {selectedIds.size}/{subscribers.length} người nhận — tick
            chọn ở bảng bên dưới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Tiêu đề email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-10 rounded-lg border border-border px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              required
              placeholder="Nội dung bản tin..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                size="sm"
                disabled={sending || selectedIds.size === 0}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Đang gửi...' : `Gửi bản tin (${selectedIds.size})`}
              </Button>
              {sendResult && (
                <p
                  className={`text-sm ${sendResult.ok ? 'text-green-600' : 'text-red-500'}`}
                >
                  {sendResult.message}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Danh sách đăng ký</CardTitle>
            <CardDescription>
              {subscribers.length} email đã đăng ký
            </CardDescription>
          </div>
          <input
            type="text"
            placeholder="Tìm email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-sm bg-background w-56 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-500 py-10">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left pb-3 font-medium w-8">
                      <input
                        type="checkbox"
                        checked={
                          filtered.length > 0 &&
                          filtered.every((s) => selectedIds.has(s.id))
                        }
                        onChange={toggleAllFiltered}
                        className="w-4 h-4 accent-primary cursor-pointer"
                        aria-label="Chọn tất cả"
                      />
                    </th>
                    <th className="text-left pb-3 font-medium">#</th>
                    <th className="text-left pb-3 font-medium">Email</th>
                    <th className="text-right pb-3 font-medium">
                      Ngày đăng ký
                    </th>
                    <th className="text-right pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleOne(s.id)}
                          className="w-4 h-4 accent-primary cursor-pointer"
                          aria-label={`Chọn ${s.email}`}
                        />
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="py-3 font-medium">{s.email}</td>
                      <td className="py-3 text-right text-xs text-muted-foreground">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={deletingId === s.id}
                          onClick={() => handleDelete(s)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Chưa có ai đăng ký nhận bản tin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
