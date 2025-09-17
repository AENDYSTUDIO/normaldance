// Минимальная главная страница для быстрого старта
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8">
            NORMAL DANCE
          </h1>
          <p className="text-2xl text-blue-200 mb-12">
            Децентрализованная музыкальная платформа
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              🎵 Добро пожаловать в будущее музыки
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Первая в мире Web3 музыкальная платформа с честной экономикой
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">🎧</div>
                <h3 className="font-bold text-white">Слушай</h3>
                <p className="text-sm text-blue-200">Высококачественная музыка</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">🎤</div>
                <h3 className="font-bold text-white">Создавай</h3>
                <p className="text-sm text-blue-200">Загружай свои треки</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-bold text-white">Зарабатывай</h3>
                <p className="text-sm text-blue-200">Получай доход от музыки</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                Начать слушать
              </button>
              <button className="w-full bg-white/20 text-white font-bold py-4 px-8 rounded-lg hover:bg-white/30 transition-all duration-300">
                Загрузить трек
              </button>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-blue-300 text-lg">
              🚀 <strong>Статус:</strong> Продакшен готов | 0 пользователей | Честный старт
            </p>
            <p className="text-blue-400 text-sm mt-2">
              Версия 1.0.1 | SQLite | Solana | IPFS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
