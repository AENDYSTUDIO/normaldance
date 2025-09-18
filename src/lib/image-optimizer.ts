// Оптимизация изображений
export class ImageOptimizer {
  static async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Максимальные размеры
        const maxWidth = 800
        const maxHeight = 600
        
        let { width, height } = img
        
        // Пропорциональное изменение размера
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        canvas.width = width
        canvas.height = height
        
        // Рисуем оптимизированное изображение
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          const optimizedFile = new File([blob!], file.name, {
            type: 'image/webp',
            lastModified: Date.now()
          })
          resolve(optimizedFile)
        }, 'image/webp', 0.8) // 80% качество
      }
      
      img.src = URL.createObjectURL(file)
    })
  }
  
  static generatePlaceholder(width: number, height: number): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = width
    canvas.height = height
    
    // Градиент placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f0f0f0')
    gradient.addColorStop(1, '#e0e0e0')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    return canvas.toDataURL('image/webp', 0.1)
  }
}