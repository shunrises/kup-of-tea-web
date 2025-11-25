'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isCustomLoading, setIsCustomLoading] = useState(false)

  const delay = async (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  const toRoute = async (route: string) => {
    if (isLoading || isCustomLoading) {
      return
    }
    if (route === '/custom') {
      setIsCustomLoading(true)
    } else {
      setIsLoading(true)
    }
    await delay(500)
    await delay(500)
    if (route === '/custom') {
      setIsCustomLoading(false)
    } else {
      setIsLoading(false)
    }
    router.push(route)
  }

  return (
    <div className="flex flex-col w-full h-dvh pb-12 px-5 bg-white justify-between items-center">
      <div className="flex flex-col h-full items-center justify-center">
        <Image
          src="/logo.svg"
          alt="덕틸리티 로고"
          width={240}
          height={55}
          priority
        />
      </div>
      <div className="flex flex-col w-full gap-12">
        {/* Card Section */}
        <div className="flex flex-col gap-5 w-full">
          <button
            onClick={() => toRoute('/select')}
            disabled={isLoading || isCustomLoading}
            className={cn(
              'w-full bg-grey-50 rounded-[8px] flex items-center gap-1 p-4 pr-9',
              isLoading ? 'opacity-70' : 'hover:bg-grey-100 cursor-pointer',
            )}
          >
            <div className="size-20 flex items-center justify-center">
              <Image
                src="/956e34c933b2dbe24ce722c89a3ede41fabb9e26.svg"
                alt="하나의 팀 아이콘"
                width={88}
                height={88}
                className="w-full h-full"
              />
            </div>

            <div className="flex flex-col items-start shrink-0">
              <div className="text-grey-700 text-[20px] font-semibold leading-[1.5] tracking-[-0.5px]">
                하나의 팀에서 선택하기
              </div>
              <div className="text-start text-grey-400 text-[14px] font-normal leading-[1.5] tracking-[-0.3px]">
                한 그룹에서만 선택해서
                <br />
                취향표를 만들어요
              </div>
            </div>
          </button>

          {/* 여러 팀에서 선택하기 */}
          <button
            onClick={() => toRoute('/custom')}
            disabled={isLoading || isCustomLoading}
            className={cn(
              'w-full bg-grey-50 rounded-[8px] flex items-center gap-1 p-4 pr-9',
              isCustomLoading
                ? 'opacity-70'
                : 'hover:bg-grey-100 cursor-pointer',
            )}
          >
            <div className="size-20 flex items-center justify-center">
              <Image
                src="/f225a007dcfdf2baf9a08ccd167f8cf961d44eed.svg"
                alt="여러 팀 아이콘"
                width={88}
                height={88}
                className="w-12"
              />
            </div>
            <div className="flex flex-col items-start shrink-0">
              <div className="text-grey-700 text-[20px] font-semibold leading-[1.5] tracking-[-0.5px]">
                여러 팀에서 선택하기
              </div>
              <div className="text-start text-grey-400 text-[14px] font-normal leading-[1.5] tracking-[-0.3px]">
                여러 그룹을 자유롭게 선택해서
                <br />
                취향표를 만들어요
              </div>
            </div>
          </button>
        </div>
        {/* Footer Links */}
        <div className="w-full flex flex-col items-center">
          <a
            href="/request"
            className="text-grey-600 text-[12px] font-normal leading-[14px] tracking-[-0.5px] underline mb-[16px]"
          >
            추가요청이 있다면 알려주세요!
          </a>
          <p className="text-grey-600 text-[11px] font-normal leading-[14px] tracking-[-0.5px]">
            @DevvTyga
          </p>
        </div>
      </div>
    </div>
  )
}
