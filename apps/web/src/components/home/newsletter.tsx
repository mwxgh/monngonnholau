'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { staticUrl } from '@/lib/utils'
import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'
import { showToast } from '@/lib/toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const newsletterSchema = z.object({
  email: z.email('Vui lòng nhập email hợp lệ')
})

type NewsletterValues = z.infer<typeof newsletterSchema>

export function Newsletter() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle'
  )

  const form = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' }
  })

  async function handleSubmit(values: NewsletterValues) {
    setStatus('loading')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        showToast('error', 'Đăng ký thất bại', data.message)
        return
      }
      setStatus('done')
      if (data.alreadySubscribed) {
        showToast('warning', 'Email đã được đăng ký', data.message)
      } else {
        showToast(
          'success',
          'Đăng ký thành công',
          data.message ?? 'Bạn sẽ nhận được bản tin mới nhất từ chúng tôi'
        )
      }
      form.reset()
    } catch {
      setStatus('error')
      showToast('error', 'Đăng ký thất bại', 'Không thể kết nối đến máy chủ')
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
              <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
                <div className="relative flex items-center shadow-lg rounded-full bg-white pr-2">
                  <Input
                    type="email"
                    placeholder="@ nhập địa chỉ email của bạn"
                    className="border-none bg-transparent rounded-full py-4 sm:py-5 text-sm pl-4 pr-4 focus-visible:ring-0 h-auto"
                    autoComplete="off"
                    aria-invalid={!!form.formState.errors.email}
                    {...form.register('email')}
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
                </div>
                {form.formState.errors.email && (
                  <p className="mt-2 text-sm font-medium text-red-100">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </form>
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
