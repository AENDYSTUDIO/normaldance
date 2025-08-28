# 📚 API документация NORMAL DANCE

Эта документация описывает все API endpoints для NormalDance платформы.

## 🌐 Базовый URL

```
https://api.normaldance.com/v1
```

## 🔐 Аутентификация

Большинство API endpoints требуют аутентификации через JWT токен.

### Формат заголовка
```
Authorization: Bearer <jwt_token>
```

### Получение токена
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 🎵 Треки

### Получить список треков
```http
GET /tracks

Query параметры:
- page: номер страницы (default: 1)
- limit: количество элементов на странице (default: 20, max: 100)
- genre: фильтр по жанру
- search: поиск по названию или артисту
- sort: сортировка (popular, newest, trending)
- artistId: фильтр по артисту

Response:
{
  "data": [
    {
      "id": "track_id",
      "title": "Название трека",
      "artistName": "Имя артиста",
      "genre": "electronic",
      "duration": 180,
      "playCount": 1000,
      "likeCount": 50,
      "imageUrl": "https://...",
      "audioUrl": "https://...",
      "createdAt": "2023-01-01T00:00:00Z",
      "isExplicit": false,
      "price": 9.99
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Получить трек по ID
```http
GET /tracks/{id}

Response:
{
  "id": "track_id",
  "title": "Название трека",
  "artistName": "Имя артиста",
  "genre": "electronic",
  "duration": 180,
  "playCount": 1000,
  "likeCount": 50,
  "imageUrl": "https://...",
  "audioUrl": "https://...",
  "lyrics": "Текст песни...",
  "metadata": {
    "bpm": 120,
    "key": "C#m",
    "energy": 0.8
  },
  "createdAt": "2023-01-01T00:00:00Z",
  "isExplicit": false,
  "price": 9.99,
  "isLiked": true,
  "isPurchased": true
}
```

### Загрузить трек (только для артистов)
```http
POST /tracks
Authorization: Bearer <token>
Content-Type: multipart/form-data

Параметры:
- title: название трека
- artistName: имя артиста
- genre: жанр
- audio: аудиофайл (mp3, wav, flac)
- image: обложка (jpg, png)
- lyrics: текст песни (опционально)
- price: цена в NDT токенах (опционально)

Response:
{
  "id": "track_id",
  "title": "Название трека",
  "status": "uploading",
  "ipfsHash": "Qm...",
  "transactionHash": "0x..."
}
```

### Обновить трек
```http
PUT /tracks/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Новое название",
  "genre": "pop",
  "price": 14.99,
  "isExplicit": true
}
```

### Удалить трек
```http
DELETE /tracks/{id}
Authorization: Bearer <token>
```

### Лайкнуть трек
```http
POST /tracks/{id}/like
Authorization: Bearer <token>
```

### Воспроизвести трек
```http
POST /tracks/{id}/play
Authorization: Bearer <token>

Response:
{
  "success": true,
  "playCount": 1001
}
```

## 👤 Пользователи

### Получить профиль пользователя
```http
GET /users/{id}

Response:
{
  "id": "user_id",
  "username": "username",
  "displayName": "Отображаемое имя",
  "email": "user@example.com",
  "bio": "О себе...",
  "avatar": "https://...",
  "banner": "https://...",
  "level": "GOLD",
  "balance": 1000.50,
  "isArtist": true,
  "role": "ARTIST",
  "stats": {
    "totalPlays": 50000,
    "totalLikes": 1000,
    "totalFollowers": 500,
    "totalTracks": 10
  },
  "createdAt": "2023-01-01T00:00:00Z"
}
```

### Обновить профиль
```http
PUT /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Новое имя",
  "bio": "Новый био",
  "avatar": "https://...",
  "banner": "https://..."
}
```

### Получить статистику пользователя
```http
GET /users/{id}/stats
Authorization: Bearer <token>

Response:
{
  "totalPlays": 50000,
  "totalLikes": 1000,
  "totalFollowers": 500,
  "totalFollowing": 200,
  "totalTracks": 10,
  "totalPlaylists": 5,
  "totalEarnings": 5000.00,
  "topGenres": [
    { "genre": "electronic", "count": 10000 },
    { "genre": "pop", "count": 8000 }
  ],
  "recentActivity": [
    {
      "type": "play",
      "track": { "id": "track_id", "title": "Трек" },
      "timestamp": "2023-01-01T00:00:00Z"
    }
  ]
}
```

## 🎵 Плейлисты

### Получить плейлисты пользователя
```http
GET /users/{id}/playlists

Response:
{
  "data": [
    {
      "id": "playlist_id",
      "name": "Мой плейлист",
      "description": "Описание",
      "isPublic": true,
      "coverImage": "https://...",
      "trackCount": 25,
      "playCount": 1000,
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Создать плейлист
```http
POST /playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Название плейлиста",
  "description": "Описание",
  "isPublic": true,
  "coverImage": "https://..."
}
```

### Добавить трек в плейлист
```http
POST /playlists/{id}/tracks
Authorization: Bearer <token>
Content-Type: application/json

{
  "trackId": "track_id",
  "position": 0
}
```

### Удалить трек из плейлиста
```http
DELETE /playlists/{id}/tracks/{trackId}
Authorization: Bearer <token>
```

## 💰 Кошелек и токены

### Получить баланс
```http
GET /wallet/balance
Authorization: Bearer <token>

Response:
{
  "sol": 1.5,
  "ndt": 1000.50,
  "usd": 150.00
}
```

### История транзакций
```http
GET /wallet/transactions
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "id": "tx_id",
      "type": "purchase",
      "amount": 10.00,
      "currency": "NDT",
      "description": "Покупка трека",
      "timestamp": "2023-01-01T00:00:00Z",
      "status": "completed"
    }
  ]
}
```

### Пополнить кошелек (Stripe)
```http
POST /wallet/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "USD",
  "paymentMethodId": "pm_123456789"
}
```

### Вывести средства
```http
POST /wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "currency": "SOL",
  "address": "0x1234567890abcdef..."
}
```

## 🏆 Система наград

### Получить достижения пользователя
```http
GET /users/{id}/achievements
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "id": "achievement_id",
      "name": "Первый трек",
      "description": "Загрузите первый трек",
      "icon": "🎵",
      "rarity": "common",
      "unlockedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Получить чарты
```http
GET /charts

Query параметры:
- type: weekly, monthly, alltime
- genre: фильтр по жанру

Response:
{
  "data": [
    {
      "rank": 1,
      "track": {
        "id": "track_id",
        "title": "Трек",
        "artistName": "Артист"
      },
      "plays": 10000,
      "likes": 500
    }
  ]
}
```

## 🎨 NFT

### Получить NFT по ID
```http
GET /nft/{id}

Response:
{
  "id": "nft_id",
  "tokenId": "token_id",
  "name": "Название NFT",
  "description": "Описание",
  "imageUrl": "https://...",
  "metadata": {
    "attributes": [...]
  },
  "price": 100.00,
  "status": "listed",
  "owner": {
    "id": "owner_id",
    "username": "owner_username"
  },
  "createdAt": "2023-01-01T00:00:00Z"
}
```

### Купить NFT
```http
POST /nft/{id}/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 100.00
}
```

### Создать NFT из трека
```http
POST /nft/mint
Authorization: Bearer <token>
Content-Type: application/json

{
  "trackId": "track_id",
  "name": "NFT название",
  "description": "NFT описание",
  "price": 100.00
}
```

## 📊 Аналитика

### Получить статистику платформы
```http
GET /analytics/platform

Response:
{
  "totalUsers": 10000,
  "totalTracks": 50000,
  "totalPlays": 1000000,
  "totalRevenue": 50000.00,
  "activeUsers": 1000,
  "topGenres": [
    { "genre": "electronic", "percentage": 30 },
    { "genre": "pop", "percentage": 25 }
  ]
}
```

### Статистика артиста
```http
GET /analytics/artist/{artistId}

Response:
{
  "totalPlays": 50000,
  "totalLikes": 1000,
  "totalFollowers": 500,
  "totalRevenue": 5000.00,
  "monthlyStats": [
    {
      "month": "2023-01",
      "plays": 5000,
      "likes": 100,
      "revenue": 500.00
    }
  ],
  "audienceDemographics": {
    "ageGroups": [
      { "range": "18-24", "percentage": 40 },
      { "range": "25-34", "percentage": 35 }
    ],
    "countries": [
      { "country": "US", "percentage": 30 },
      { "country": "RU", "percentage": 25 }
    ]
  }
}
```

## 🔧 WebSocket события

### Подключение
```javascript
const socket = io('https://api.normaldance.com', {
  auth: {
    token: 'jwt_token'
  }
});
```

### События

#### `track:play`
```javascript
socket.on('track:play', (data) => {
  console.log('Трек воспроизводится:', data);
});
```

#### `user:online`
```javascript
socket.on('user:online', (data) => {
  console.log('Пользователь онлайн:', data);
});
```

#### `notification:new`
```javascript
socket.on('notification:new', (data) => {
  console.log('Новое уведомление:', data);
});
```

## 🚀 Ошибки

### Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Формат ошибки
```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "field": "email",
      "message": "Email is required"
    }
  }
}
```

## 📝 Rate Limiting

- **API лимит**: 100 запросов в минуту
- **WebSocket лимит**: 10 сообщений в секунду
- **Файл загрузка**: Максимальный размер 100MB

## 🔒 Безопасность

- Все API запросы должны использовать HTTPS
- JWT токены имеют срок действия 24 часа
- Все файлы проходят проверку на вредоносный код
- Реализована защита от CSRF атак

---

**Последнее обновление:** 2024-01-01
**Версия API:** v1.0.0