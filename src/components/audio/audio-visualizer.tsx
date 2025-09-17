'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AudioVisualizerProps {
  audioUrl?: string
  audioElement?: HTMLAudioElement | null
  className?: string
  isPlaying?: boolean
  type?: 'bars' | 'wave' | 'circle' | 'particles'
  color?: string
}

export function AudioVisualizer({ 
  audioUrl, 
  audioElement,
  className, 
  isPlaying = false, 
  type = 'bars',
  color = 'hsl(var(--primary))'
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationRef = useRef<number>()
  const audioRef = useRef<HTMLAudioElement>()
  
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0))

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const audioContext = audioContextRef.current
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyserRef.current = analyser

    // Create/connect audio element
    if (!audioRef.current) {
      if (audioElement) {
        audioRef.current = audioElement
      } else if (audioUrl) {
        audioRef.current = new Audio(audioUrl)
        audioRef.current.crossOrigin = 'anonymous'
      }
      if (audioRef.current) {
        const source = audioContext.createMediaElementSource(audioRef.current)
        sourceRef.current = source
        source.connect(analyser)
        analyser.connect(audioContext.destination)
      }
    }

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    setAudioData(dataArray)

    const draw = () => {
      if (!ctx || !analyser) return

      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      switch (type) {
        case 'bars':
          drawBars(ctx, dataArray, canvas.width, canvas.height, color)
          break
        case 'wave':
          drawWave(ctx, dataArray, canvas.width, canvas.height, color)
          break
        case 'circle':
          drawCircle(ctx, dataArray, canvas.width, canvas.height, color)
          break
        case 'particles':
          // reuse bars drawing as a simple particle effect placeholder
          drawBars(ctx, dataArray, canvas.width, canvas.height, color)
          break
      }
    }

    if (isPlaying) {
      draw()
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioUrl, audioElement, isPlaying, type, color])

  const drawBars = (ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number, color: string) => {
    const barWidth = width / data.length * 2
    let x = 0

    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * height * 0.8
      
      ctx.fillStyle = color
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)
      
      x += barWidth
    }
  }

  const drawWave = (ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number, color: string) => {
    ctx.lineWidth = 2
    ctx.strokeStyle = color
    ctx.beginPath()

    const sliceWidth = width / data.length
    let x = 0

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0
      const y = v * height / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.stroke()
  }

  const drawCircle = (ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number, color: string) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 4

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw frequency bars around circle
    const bars = 64
    const barLength = 20

    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * 2 * Math.PI
      const dataIndex = Math.floor((i / bars) * data.length)
      const barHeight = (data[dataIndex] / 255) * barLength

      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius + barHeight)
      const y2 = centerY + Math.sin(angle) * (radius + barHeight)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-full', className)}
      width={300}
      height={100}
    />
  )
}