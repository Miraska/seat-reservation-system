Полноценная система бронирования мест на мероприятия, реализованная с использованием современного стека технологий:
- **Node.js + TypeScript** - серверная часть
- **PostgreSQL** - база данных
- **Redis** - кэширование
- **RabbitMQ** - асинхронные уведомления
- **Docker** - контейнеризация

## Быстрый запуск

```bash
# 1. Запуск инфраструктуры
docker-compose -f docker-compose.dev.yml up -d

# 2. Установка зависимостей
npm install

# 3. Запуск приложения
npm run dev
```

## Основной endpoint

**POST /api/bookings/reserve**

```json
{
  "event_id": 1,
  "user_id": "user123"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "event_id": 1,
    "user_id": "user123",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Booking created successfully"
}
```


## Документация

- **[QUICK_START.md](QUICK_START.md)** - быстрый старт
- **[README.md](README.md)** - полная документация