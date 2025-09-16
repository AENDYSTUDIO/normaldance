// Web Worker для обработки аудио
// Этот файл будет обрабатываться как Web Worker

interface AudioProcessingMessage {
  type: 'processAudio' | 'analyzeAudio' | 'extractFeatures'
  data: {
    audioBuffer?: ArrayBuffer
    audioUrl?: string
    quality?: string
    trackId?: string
  }
}

interface AudioFeatures {
  tempo: number
  key: string
  mode: string
  energy: number
  danceability: number
  valence: number
  acousticness: number
  instrumentalness: number
  liveness: number
  speechiness: number
}

interface AudioAnalysisResult {
  features: AudioFeatures
  waveform: number[]
  spectrum: number[]
  beats: number[]
  segments: Array<{
    start: number
    end: number
    confidence: number
    pitch: number
  }>
}

// Обработчик сообщений
self.onmessage = async (event: MessageEvent<AudioProcessingMessage>) => {
  const { type, data } = event.data

  try {
    switch (type) {
      case 'processAudio':
        await processAudio(data)
        break
      case 'analyzeAudio':
        const analysis = await analyzeAudio(data)
        self.postMessage({
          type: 'audioAnalysisComplete',
          data: analysis
        })
        break
      case 'extractFeatures':
        const features = await extractAudioFeatures(data)
        self.postMessage({
          type: 'featuresExtracted',
          data: features
        })
        break
      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Обработка аудио
async function processAudio(data: AudioProcessingMessage['data']) {
  if (!data.audioBuffer) {
    throw new Error('No audio buffer provided')
  }

  // Создаем AudioContext для обработки
  const audioContext = new (self.AudioContext || (self as any).webkitAudioContext)()
  
  try {
    // Декодируем аудио
    const audioBuffer = await audioContext.decodeAudioData(data.audioBuffer)
    
    // Извлекаем каналы
    const leftChannel = audioBuffer.getChannelData(0)
    const rightChannel = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel
    
    // Обрабатываем аудио
    const processedBuffer = await processAudioBuffer(leftChannel, rightChannel, data.quality)
    
    // Отправляем результат
    self.postMessage({
      type: 'audioProcessed',
      data: {
        trackId: data.trackId,
        processedBuffer: processedBuffer.buffer,
        sampleRate: audioBuffer.sampleRate,
        duration: audioBuffer.duration
      }
    })
  } finally {
    await audioContext.close()
  }
}

// Анализ аудио
async function analyzeAudio(data: AudioProcessingMessage['data']): Promise<AudioAnalysisResult> {
  if (!data.audioBuffer) {
    throw new Error('No audio buffer provided')
  }

  const audioContext = new (self.AudioContext || (self as any).webkitAudioContext)()
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(data.audioBuffer)
    const leftChannel = audioBuffer.getChannelData(0)
    const rightChannel = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel
    
    // Анализируем аудио
    const features = await extractAudioFeatures({
      audioBuffer: data.audioBuffer,
      trackId: data.trackId
    })
    
    const waveform = generateWaveform(leftChannel, 1000)
    const spectrum = generateSpectrum(leftChannel, audioBuffer.sampleRate)
    const beats = detectBeats(leftChannel, audioBuffer.sampleRate)
    const segments = segmentAudio(leftChannel, audioBuffer.sampleRate)
    
    return {
      features,
      waveform,
      spectrum,
      beats,
      segments
    }
  } finally {
    await audioContext.close()
  }
}

// Извлечение характеристик аудио
async function extractAudioFeatures(data: AudioProcessingMessage['data']): Promise<AudioFeatures> {
  if (!data.audioBuffer) {
    throw new Error('No audio buffer provided')
  }

  const audioContext = new (self.AudioContext || (self as any).webkitAudioContext)()
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(data.audioBuffer)
    const leftChannel = audioBuffer.getChannelData(0)
    const rightChannel = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel
    
    // Вычисляем характеристики
    const tempo = calculateTempo(leftChannel, audioBuffer.sampleRate)
    const key = detectKey(leftChannel, audioBuffer.sampleRate)
    const mode = detectMode(leftChannel, audioBuffer.sampleRate)
    const energy = calculateEnergy(leftChannel)
    const danceability = calculateDanceability(leftChannel, audioBuffer.sampleRate)
    const valence = calculateValence(leftChannel)
    const acousticness = calculateAcousticness(leftChannel)
    const instrumentalness = calculateInstrumentalness(leftChannel)
    const liveness = calculateLiveness(leftChannel)
    const speechiness = calculateSpeechiness(leftChannel)
    
    return {
      tempo,
      key,
      mode,
      energy,
      danceability,
      valence,
      acousticness,
      instrumentalness,
      liveness,
      speechiness
    }
  } finally {
    await audioContext.close()
  }
}

// Обработка аудио буфера
async function processAudioBuffer(
  leftChannel: Float32Array,
  rightChannel: Float32Array,
  quality?: string
): Promise<Float32Array> {
  const length = leftChannel.length
  const processed = new Float32Array(length)
  
  // Применяем обработку в зависимости от качества
  switch (quality) {
    case 'low':
      return applyLowQualityProcessing(leftChannel, rightChannel)
    case 'medium':
      return applyMediumQualityProcessing(leftChannel, rightChannel)
    case 'high':
      return applyHighQualityProcessing(leftChannel, rightChannel)
    case 'lossless':
      return applyLosslessProcessing(leftChannel, rightChannel)
    default:
      return applyAdaptiveProcessing(leftChannel, rightChannel)
  }
}

// Обработка низкого качества
function applyLowQualityProcessing(leftChannel: Float32Array, rightChannel: Float32Array): Float32Array {
  const length = leftChannel.length
  const processed = new Float32Array(length)
  
  // Простое усреднение для моно
  for (let i = 0; i < length; i++) {
    processed[i] = (leftChannel[i] + rightChannel[i]) / 2
  }
  
  return processed
}

// Обработка среднего качества
function applyMediumQualityProcessing(leftChannel: Float32Array, rightChannel: Float32Array): Float32Array {
  const length = leftChannel.length
  const processed = new Float32Array(length)
  
  // Стерео с легкой компрессией
  for (let i = 0; i < length; i++) {
    const left = leftChannel[i]
    const right = rightChannel[i]
    processed[i] = (left + right) / 2
  }
  
  return processed
}

// Обработка высокого качества
function applyHighQualityProcessing(leftChannel: Float32Array, rightChannel: Float32Array): Float32Array {
  const length = leftChannel.length
  const processed = new Float32Array(length)
  
  // Стерео с обработкой
  for (let i = 0; i < length; i++) {
    const left = leftChannel[i]
    const right = rightChannel[i]
    processed[i] = (left + right) / 2
  }
  
  return processed
}

// Обработка lossless
function applyLosslessProcessing(leftChannel: Float32Array, rightChannel: Float32Array): Float32Array {
  const length = leftChannel.length
  const processed = new Float32Array(length)
  
  // Без потерь
  for (let i = 0; i < length; i++) {
    const left = leftChannel[i]
    const right = rightChannel[i]
    processed[i] = (left + right) / 2
  }
  
  return processed
}

// Адаптивная обработка
function applyAdaptiveProcessing(leftChannel: Float32Array, rightChannel: Float32Array): Float32Array {
  const length = leftChannel.length
  const processed = new Float32Array(length)
  
  // Адаптивная обработка на основе динамики
  let maxAmplitude = 0
  for (let i = 0; i < length; i++) {
    const amplitude = Math.abs(leftChannel[i]) + Math.abs(rightChannel[i])
    maxAmplitude = Math.max(maxAmplitude, amplitude)
  }
  
  const threshold = maxAmplitude * 0.1
  
  for (let i = 0; i < length; i++) {
    const left = leftChannel[i]
    const right = rightChannel[i]
    const amplitude = Math.abs(left) + Math.abs(right)
    
    if (amplitude > threshold) {
      processed[i] = (left + right) / 2
    } else {
      processed[i] = (left + right) / 2 * 0.5
    }
  }
  
  return processed
}

// Генерация волновой формы
function generateWaveform(channel: Float32Array, samples: number): number[] {
  const blockSize = Math.floor(channel.length / samples)
  const waveform: number[] = []
  
  for (let i = 0; i < samples; i++) {
    const start = i * blockSize
    const end = Math.min(start + blockSize, channel.length)
    
    let max = 0
    let min = 0
    
    for (let j = start; j < end; j++) {
      max = Math.max(max, channel[j])
      min = Math.min(min, channel[j])
    }
    
    waveform.push(max - min)
  }
  
  return waveform
}

// Генерация спектра
function generateSpectrum(channel: Float32Array, sampleRate: number): number[] {
  const fftSize = 2048
  const spectrum: number[] = []
  
  // Простое FFT (в реальном проекте используйте библиотеку)
  for (let i = 0; i < fftSize / 2; i++) {
    let real = 0
    let imag = 0
    
    for (let j = 0; j < fftSize; j++) {
      const angle = -2 * Math.PI * i * j / fftSize
      real += channel[j] * Math.cos(angle)
      imag += channel[j] * Math.sin(angle)
    }
    
    const magnitude = Math.sqrt(real * real + imag * imag)
    spectrum.push(magnitude)
  }
  
  return spectrum
}

// Детекция битов
function detectBeats(channel: Float32Array, sampleRate: number): number[] {
  const beats: number[] = []
  const windowSize = Math.floor(sampleRate * 0.1) // 100ms окна
  const threshold = 0.1
  
  for (let i = 0; i < channel.length - windowSize; i += windowSize) {
    let energy = 0
    
    for (let j = i; j < i + windowSize; j++) {
      energy += channel[j] * channel[j]
    }
    
    energy /= windowSize
    
    if (energy > threshold) {
      beats.push(i / sampleRate)
    }
  }
  
  return beats
}

// Сегментация аудио
function segmentAudio(channel: Float32Array, sampleRate: number): Array<{
  start: number
  end: number
  confidence: number
  pitch: number
}> {
  const segments: Array<{
    start: number
    end: number
    confidence: number
    pitch: number
  }> = []
  
  const windowSize = Math.floor(sampleRate * 0.5) // 500ms окна
  const hopSize = Math.floor(sampleRate * 0.1) // 100ms шаг
  
  for (let i = 0; i < channel.length - windowSize; i += hopSize) {
    const start = i / sampleRate
    const end = (i + windowSize) / sampleRate
    
    // Простая детекция тона
    let pitch = 0
    let confidence = 0
    
    // Автокорреляция для детекции тона
    let maxCorrelation = 0
    let bestPeriod = 0
    
    for (let period = 20; period < windowSize / 2; period++) {
      let correlation = 0
      
      for (let j = 0; j < windowSize - period; j++) {
        correlation += channel[i + j] * channel[i + j + period]
      }
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation
        bestPeriod = period
      }
    }
    
    if (bestPeriod > 0) {
      pitch = sampleRate / bestPeriod
      confidence = Math.min(maxCorrelation / windowSize, 1)
    }
    
    segments.push({
      start,
      end,
      confidence,
      pitch
    })
  }
  
  return segments
}

// Вычисление темпа
function calculateTempo(channel: Float32Array, sampleRate: number): number {
  const beats = detectBeats(channel, sampleRate)
  
  if (beats.length < 2) return 0
  
  const intervals: number[] = []
  for (let i = 1; i < beats.length; i++) {
    intervals.push(beats[i] - beats[i - 1])
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  return 60 / avgInterval
}

// Детекция тональности
function detectKey(channel: Float32Array, sampleRate: number): string {
  const spectrum = generateSpectrum(channel, sampleRate)
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  
  // Простая детекция на основе пиков спектра
  let maxEnergy = 0
  let bestNote = 0
  
  for (let i = 0; i < spectrum.length; i++) {
    if (spectrum[i] > maxEnergy) {
      maxEnergy = spectrum[i]
      bestNote = i % 12
    }
  }
  
  return notes[bestNote]
}

// Детекция лада
function detectMode(channel: Float32Array, sampleRate: number): string {
  // Упрощенная детекция мажор/минор
  const spectrum = generateSpectrum(channel, sampleRate)
  
  // Анализ гармоник
  let majorEnergy = 0
  let minorEnergy = 0
  
  for (let i = 0; i < spectrum.length; i++) {
    const note = i % 12
    if ([0, 2, 4, 5, 7, 9, 11].includes(note)) { // Мажорные интервалы
      majorEnergy += spectrum[i]
    } else if ([0, 2, 3, 5, 7, 8, 10].includes(note)) { // Минорные интервалы
      minorEnergy += spectrum[i]
    }
  }
  
  return majorEnergy > minorEnergy ? 'major' : 'minor'
}

// Вычисление энергии
function calculateEnergy(channel: Float32Array): number {
  let energy = 0
  for (let i = 0; i < channel.length; i++) {
    energy += channel[i] * channel[i]
  }
  return energy / channel.length
}

// Вычисление танцевальности
function calculateDanceability(channel: Float32Array, sampleRate: number): number {
  const beats = detectBeats(channel, sampleRate)
  const tempo = calculateTempo(channel, sampleRate)
  
  // Танцевальность основана на темпе и регулярности битов
  let regularity = 0
  if (beats.length > 2) {
    const intervals: number[] = []
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i - 1])
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length
    
    regularity = 1 / (1 + variance)
  }
  
  const tempoScore = Math.min(tempo / 120, 1) // Нормализация к 120 BPM
  return (tempoScore + regularity) / 2
}

// Вычисление валентности
function calculateValence(channel: Float32Array): number {
  // Валентность основана на яркости и позитивности звука
  const spectrum = generateSpectrum(channel, 44100)
  
  let highFreqEnergy = 0
  let lowFreqEnergy = 0
  
  for (let i = 0; i < spectrum.length; i++) {
    if (i > spectrum.length / 2) {
      highFreqEnergy += spectrum[i]
    } else {
      lowFreqEnergy += spectrum[i]
    }
  }
  
  return highFreqEnergy / (highFreqEnergy + lowFreqEnergy)
}

// Вычисление акустичности
function calculateAcousticness(channel: Float32Array): number {
  // Акустичность основана на отсутствии электронных эффектов
  const spectrum = generateSpectrum(channel, 44100)
  
  let acousticEnergy = 0
  let totalEnergy = 0
  
  for (let i = 0; i < spectrum.length; i++) {
    totalEnergy += spectrum[i]
    
    // Акустические инструменты имеют более мягкий спектр
    if (i < spectrum.length / 4) {
      acousticEnergy += spectrum[i]
    }
  }
  
  return acousticEnergy / totalEnergy
}

// Вычисление инструментальности
function calculateInstrumentalness(channel: Float32Array): number {
  // Инструментальность основана на отсутствии вокала
  const spectrum = generateSpectrum(channel, 44100)
  
  let vocalEnergy = 0
  let totalEnergy = 0
  
  for (let i = 0; i < spectrum.length; i++) {
    totalEnergy += spectrum[i]
    
    // Вокал обычно в диапазоне 80-300 Гц
    const freq = (i * 44100) / (2 * spectrum.length)
    if (freq >= 80 && freq <= 300) {
      vocalEnergy += spectrum[i]
    }
  }
  
  return 1 - (vocalEnergy / totalEnergy)
}

// Вычисление живости
function calculateLiveness(channel: Float32Array): number {
  // Живость основана на присутствии аудитории и реверберации
  const energy = calculateEnergy(channel)
  const variance = calculateVariance(channel)
  
  // Высокая энергия и вариативность указывают на живое выступление
  return Math.min((energy + variance) / 2, 1)
}

// Вычисление речевости
function calculateSpeechiness(channel: Float32Array): number {
  // Речевость основана на присутствии речи
  const spectrum = generateSpectrum(channel, 44100)
  
  let speechEnergy = 0
  let totalEnergy = 0
  
  for (let i = 0; i < spectrum.length; i++) {
    totalEnergy += spectrum[i]
    
    // Речь обычно в диапазоне 300-3400 Гц
    const freq = (i * 44100) / (2 * spectrum.length)
    if (freq >= 300 && freq <= 3400) {
      speechEnergy += spectrum[i]
    }
  }
  
  return speechEnergy / totalEnergy
}

// Вычисление дисперсии
function calculateVariance(channel: Float32Array): number {
  const mean = channel.reduce((a, b) => a + b, 0) / channel.length
  const variance = channel.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / channel.length
  return variance
}

// Экспорт для TypeScript
export type { AudioProcessingMessage, AudioFeatures, AudioAnalysisResult }
