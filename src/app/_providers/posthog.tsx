// app/providers.tsx
'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { usePostHog } from 'posthog-js/react'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { env } from "~/env"
import { useAuth, useUser } from "@clerk/nextjs"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: '/ingest',
      ui_host: "https://ui.posthog.com",
      person_profiles: 'identified_only',
      capture_pageview: false
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const user = useUser();
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  // Track pageviews
  useEffect(() => {
    if (user?.user?.id) {
      posthog.identify(user.user.id, {
        email: user.user.emailAddresses[0]?.emailAddress,
      })
    }

    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }

      posthog.capture('$pageview', { '$current_url': url })
    }
  }, [pathname, searchParams, posthog, user])

  return null
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}