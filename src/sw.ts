/// <reference lib="webworker" />
/* eslint-disable no-undef */
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any }

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.addEventListener('push', (event: PushEvent) => {
  const data = (() => {
    try {
      return event.data?.json() as { title?: string; body?: string }
    } catch {
      return {}
    }
  })()

  const title = data.title ?? 'Descanso acabou'
  const body = data.body ?? 'Volte para a próxima série.'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      silent: true,
      tag: 'rest-timer-finished',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const url = self.registration.scope ?? '/'
    for (const client of clients) {
      if ('focus' in client) {
        // bring existing client to front
        return (client as WindowClient).focus()
      }
    }
    return self.clients.openWindow(url)
  }))
})
