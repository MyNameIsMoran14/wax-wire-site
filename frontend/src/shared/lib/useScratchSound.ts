import { useRef } from 'react'

// Synthesizes a DJ-scratch-style noise texture with the Web Audio API — no
// audio asset needed. A looping noise buffer runs through a bandpass filter;
// gain/frequency/playbackRate are driven live by how fast the record is
// being spun by hand, so it sounds louder & harsher the faster you drag.
export function useScratchSound() {
  const ctxRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)

  const ensureContext = () => {
    if (!ctxRef.current) {
      const ctx = new AudioContext()
      const length = ctx.sampleRate * 1
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
      ctxRef.current = ctx
      bufferRef.current = buffer
    }
    return ctxRef.current
  }

  const start = () => {
    const ctx = ensureContext()
    if (ctx.state === 'suspended') void ctx.resume()

    const source = ctx.createBufferSource()
    source.buffer = bufferRef.current
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 0.9

    const gain = ctx.createGain()
    gain.gain.value = 0

    source.connect(filter).connect(gain).connect(ctx.destination)
    source.start()

    sourceRef.current = source
    filterRef.current = filter
    gainRef.current = gain
  }

  // speed: angular velocity of the drag, in degrees/second (absolute value)
  const update = (speed: number) => {
    const ctx = ctxRef.current
    const gain = gainRef.current
    const filter = filterRef.current
    const source = sourceRef.current
    if (!ctx || !gain || !filter || !source) return

    const intensity = Math.min(1, speed / 500)
    const now = ctx.currentTime
    gain.gain.setTargetAtTime(intensity * 0.35, now, 0.02)
    filter.frequency.setTargetAtTime(500 + intensity * 2500, now, 0.02)
    source.playbackRate.setTargetAtTime(0.5 + intensity * 1.5, now, 0.02)
  }

  const stop = () => {
    const ctx = ctxRef.current
    const gain = gainRef.current
    const source = sourceRef.current
    if (ctx && gain) gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08)
    setTimeout(() => {
      source?.stop()
      source?.disconnect()
      if (sourceRef.current === source) sourceRef.current = null
    }, 200)
  }

  // Call on unmount. Without this the AudioContext (and its source node)
  // outlives the component — browsers cap how many contexts can exist at
  // once, so repeated SPA navigation to/from the page would eventually stop
  // producing sound at all.
  const dispose = () => {
    sourceRef.current?.stop()
    sourceRef.current?.disconnect()
    sourceRef.current = null
    void ctxRef.current?.close()
    ctxRef.current = null
  }

  return { start, update, stop, dispose }
}
