"use client";
import { staticUrl } from "@/lib/utils";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function PromoBanner() {
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
              <div>
                <div className="relative text-white focus-within:text-white flex flex-row-reverse shadow-lg rounded-full">
                  <input
                    type="email"
                    className="py-6 sm:py-8 text-sm w-full text-black rounded-full pl-4 pr-16 focus:outline-none focus:text-black"
                    placeholder="@ nhập địa chỉ email của bạn"
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button
                      type="submit"
                      className="p-2 bg-gray-900 hover:scale-110 duration-300 rounded-full"
                    >
                      <ArrowRight className="w-8 h-8 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-5 relative hidden md:block">
            <div className="-mt-24">
              <Image
                src={staticUrl("images/soup.svg")}
                alt="soup"
                width={626}
                height={602}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <div className="absolute top-[78%]">
              <Image
                src={staticUrl("images/onion.svg")}
                alt="onion"
                width={300}
                height={122}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="absolute top-[30%] right-[-23%] hidden lg:block">
              <Image
                src={staticUrl("images/lec.svg")}
                alt="lettuce"
                width={300}
                height={122}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="absolute bottom-[10%] left-0">
              <Image
                src={staticUrl("images/yellow.svg")}
                alt="yellow"
                width={59}
                height={59}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="absolute bottom-[20%] right-[20%]">
              <Image
                src={staticUrl("images/blue.svg")}
                alt="blue"
                width={25}
                height={25}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
