'use client'

import { SecureLogger } from '@/lib/security/secure-logger';
import React, { useState, useEffect } from 'react'
import MemorialCard from './MemorialCard'
import CreateMemorialModal from './CreateMemorialModal'

interface Memorial {
  id: string
  artistName: string
  ipfsHash: string
  fundBalance: number
  heirs: string[]
  isActive: boolean
  createdAt: string
}

export default function GraveyardGrid() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Загрузка мемориалов
  useEffect(() => {
    loadMemorials()
  }, [])

  const loadMemorials = async () => {
    try {
      const response = await fetch('/api/grave/memorials')
      const data = await response.json()
      
      if (data.success) {
        setMemorials(data.data.memorials || [])
      }
    } catch (error) {
      SecureLogger.error('Ошибка загрузки мемориалов:', error)
      // Показываем демо-данные
      setMemorials([
        {
          id: '1',
          artistName: 'DJ Eternal',
          ipfsHash: 'QmDemoMemorial123',
          fundBalance: 1.25,
          heirs: ['0x123...abc'],
          isActive: true,
          createdAt: '2024-12-01T00:00:00Z'
        },
        {
          id: '2',
          artistName: 'Producer Ghost',
          ipfsHash: 'QmDemoMemorial456',
          fundBalance: 0.89,
          heirs: ['0x456...def'],
          isActive: true,
          createdAt: '2024-11-15T00:00:00Z'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMemorials = memorials.filter(memorial =>
    memorial.artistName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Поиск и фильтры */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Поиск по имени артиста..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Создать мемориал
        </button>
      </div>

      {/* Статистика */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
          <div className="stat-title">Мемориалов</div>
          <div className="stat-value text-primary">{memorials.length}</div>
          <div className="stat-desc">Вечная память</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div className="stat-title">Общий фонд</div>
          <div className="stat-value text-secondary">
            {memorials.reduce((sum, m) => sum + m.fundBalance, 0).toFixed(2)} ETH
          </div>
          <div className="stat-desc">Пожертвований</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
            </svg>
          </div>
          <div className="stat-title">Наследников</div>
          <div className="stat-value text-accent">
            {memorials.reduce((sum, m) => sum + m.heirs.length, 0)}
          </div>
          <div className="stat-desc">Получают доходы</div>
        </div>
      </div>

      {/* Сетка мемориалов */}
      {filteredMemorials.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🪦</div>
          <h3 className="text-2xl font-bold mb-2">Кладбище пусто</h3>
          <p className="text-gray-600 mb-4">Станьте первым, кто создаст мемориал</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Создать первый мемориал
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemorials.map((memorial) => (
            <MemorialCard
              key={memorial.id}
              memorial={memorial}
              onDonate={() => loadMemorials()}
            />
          ))}
        </div>
      )}

      {/* Модальное окно создания мемориала */}
      {showCreateModal && (
        <CreateMemorialModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadMemorials()
          }}
        />
      )}
    </div>
  )
}
