import { useMemo, useRef, useState } from 'react'

const canNotify =
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window

async function ensureNotificationPermission() {
  if (!canNotify) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

async function sendSilentNotification() {
  if (!canNotify) return
  const granted = await ensureNotificationPermission()
  if (!granted) return
  const registration = await navigator.serviceWorker.ready
  registration.showNotification('Descanso acabou', {
    body: 'Volte para a próxima série.',
    silent: true,
    tag: 'rest-timer-finished',
  })
}

async function subscribeAndSchedulePush(seconds: number) {
  if (!canNotify) return
  const granted = await ensureNotificationPermission()
  if (!granted) return
  const registration = await navigator.serviceWorker.ready
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) return
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })

  await fetch('/api/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription,
      delaySeconds: Math.min(Math.max(seconds, 5), 300),
      title: 'Descanso acabou',
      body: 'Volte para a próxima série.',
    }),
  })
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

type Mode = 'stopped' | 'running' | 'paused'

const presetSeconds = [30, 45, 60, 90, 120, 150, 180, 210, 240, 300]

export function RestTimer() {
  const [durationSeconds, setDurationSeconds] = useState(60)
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)
  const [mode, setMode] = useState<Mode>('stopped')
  const tickRef = useRef<number | null>(null)
  const startAtRef = useRef<number | null>(null)
  const pausedElapsedRef = useRef<number>(0)

  const formatted = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [secondsLeft])

  const clear = () => {
    if (tickRef.current) cancelAnimationFrame(tickRef.current)
    tickRef.current = null
  }

  const resetSeconds = (seconds: number) => {
    setDurationSeconds(seconds)
    setSecondsLeft(seconds)
    pausedElapsedRef.current = 0
  }

  const stop = () => {
    clear()
    setMode('stopped')
    resetSeconds(durationSeconds)
  }

  const tick = () => {
    const start = startAtRef.current
    if (!start) return
    // eslint-disable-next-line react-hooks/purity -- timer tick reads current time
    const elapsedMs = Date.now() - start + pausedElapsedRef.current
    const remaining = Math.max(durationSeconds - Math.floor(elapsedMs / 1000), 0)
    setSecondsLeft(remaining)
    if (remaining === 0) {
      clear()
      setMode('stopped')
      startAtRef.current = null
      pausedElapsedRef.current = 0
      navigator.vibrate?.(250)
      void sendSilentNotification()
      return
    }
    tickRef.current = requestAnimationFrame(tick)
  }

  const start = () => {
    if (mode === 'running') return
    void subscribeAndSchedulePush(durationSeconds)
    startAtRef.current = Date.now()
    setMode('running')
    tickRef.current = requestAnimationFrame(tick)
  }

  const pause = () => {
    if (mode !== 'running') return
    clear()
    setMode('paused')
    const start = startAtRef.current
    if (!start) return
    pausedElapsedRef.current += Date.now() - start
  }

  const resume = () => {
    if (mode !== 'paused') return
    startAtRef.current = Date.now()
    setMode('running')
    tickRef.current = requestAnimationFrame(tick)
  }

  const onSelectMinutes = (value: number) => {
    resetSeconds(value)
    setMode('stopped')
  }

  return (
    <section className="card">
      <div className="time-display" role="timer" aria-live="assertive">
        {formatted}
      </div>

      <div className="picker-row">
        <label className="field-label" htmlFor="time-picker">
          Tempo de descanso
        </label>
        <input
          id="time-picker"
          type="time"
          className="ios-time"
          aria-label="Escolher tempo de descanso"
          value={`${String(Math.floor(durationSeconds / 60)).padStart(2, '0')}:${String(durationSeconds % 60).padStart(2, '0')}`}
          step={15}
          onChange={(e) => {
            const [m, s] = e.target.value.split(':').map(Number)
            const total = m * 60 + s
            onSelectMinutes(total)
          }}
        />

        <div className="chips" aria-label="Presets rápidos">
          {presetSeconds.map((sec) => (
            <button
              key={sec}
              className={`chip ${sec === durationSeconds ? 'active' : ''}`}
              onClick={() => onSelectMinutes(sec)}
            >
              {Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      <div className="actions">
        {mode !== 'running' && (
          <button className="btn primary" onClick={start}>
            Iniciar
          </button>
        )}
        {mode === 'running' && (
          <button className="btn" onClick={pause}>
            Pausar
          </button>
        )}
        {mode === 'paused' && (
          <button className="btn primary" onClick={resume}>
            Retomar
          </button>
        )}
        <button className="btn ghost" onClick={stop}>
          Zerar
        </button>
      </div>
    </section>
  )
}
