'use client'

import { OverlayProvider } from '@toss/use-overlay'
// import posthog from 'posthog-js'
// import { PostHogProvider } from 'posthog-js/react'
import { SWRConfig } from 'swr'
import { UserStoreProvider } from '@/stores/userStore'
import { AnswerStoreProvider } from '@/stores/answerStore'
import { SelectStoreProvider } from '@/stores/selectStore'
import { ModalStoreProvider } from '@/stores/modalStore'

// if (typeof window !== 'undefined') {
//   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
//     api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
//     capture_pageview: false,
//   })
// }

const PostHogProviderWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => {
  // return <PostHogProvider client={posthog}>{children}</PostHogProvider>
  return children
}

const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return <SWRConfig value={{ revalidateOnFocus: false }}>{children}</SWRConfig>
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PostHogProviderWrapper>
      <SWRProvider>
        <UserStoreProvider>
          <AnswerStoreProvider>
            <SelectStoreProvider>
              <ModalStoreProvider>
                <OverlayProvider>{children}</OverlayProvider>
              </ModalStoreProvider>
            </SelectStoreProvider>
          </AnswerStoreProvider>
        </UserStoreProvider>
      </SWRProvider>
    </PostHogProviderWrapper>
  )
}
