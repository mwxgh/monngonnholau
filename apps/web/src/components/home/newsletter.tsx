'use client'

import { useState } from 'react'
import { staticUrl } from '@/lib/utils'
import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.message ?? 'Đăng ký thất bại')
        return
      }
      setStatus('done')
      setMessage(data.message ?? 'Đăng ký nhận bản tin thành công')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Không thể kết nối đến máy chủ')
    }
  }

  return (
    <section className="relative">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="bg-primary rounded-[30px_400px_30px_30px] grid grid-cols-1 gap-y-10 gap-x-6 md:grid-cols-12 xl:gap-x-8">
          <div className="col-span-7">
            <div className="m-10 lg:ml-32 lg:mt-20 lg:mb-20">
              <p className="text-lg font-normal text-white mb-3 tracking-widest uppercase">
                BẢN TIN
              </p>
              <h2 className="text-3xl md:text-5xl font-semibold text-white mb-8">
                Đăng ký nhận <br /> bản tin của chúng tôi.
              </h2>
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center shadow-lg rounded-full bg-white pr-2"
              >
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="@ nhập địa chỉ email của bạn"
                  className="border-none bg-transparent rounded-full py-4 sm:py-5 text-sm pl-4 pr-4 focus-visible:ring-0 h-auto"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={status === 'loading'}
                  className="rounded-full bg-gray-900 hover:bg-gray-700 hover:scale-110 duration-300 shrink-0"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </Button>
              </form>
              {message && (
                <p
                  className={`mt-3 text-sm ${status === 'error' ? 'text-red-100' : 'text-white'}`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
          <div className="col-span-5 relative hidden md:block">
            <div className="-mt-24">
              <Image
                src={staticUrl('images/soup.svg')}
                alt="soup"
                width={626}
                height={602}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div className="absolute top-[78%]">
              <Image
                src={staticUrl('images/onion.svg')}
                alt="onion"
                width={300}
                height={122}
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className="absolute top-[30%] right-[-23%] hidden lg:block">
              <Image
                src={staticUrl('images/lec.svg')}
                alt="lettuce"
                width={300}
                height={122}
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className="absolute bottom-[10%] left-0">
              <Image
                src={staticUrl('images/yellow.svg')}
                alt="yellow"
                width={59}
                height={59}
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className="absolute bottom-[20%] right-[20%]">
              <Image
                src={staticUrl('images/blue.svg')}
                alt="blue"
                width={25}
                height={25}
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
