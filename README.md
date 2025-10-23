# Система бронирования мест на мероприятия

API для бронирования мест на мероприятия с использованием Node.js, TypeScript, PostgreSQL, Redis и RabbitMQ.

## Возможности

- Бронирование мест на мероприятия
- Предотвращение двойного бронирования одним пользователем
- Проверка доступности мест
- Кэширование в Redis
- Асинхронные уведомления через RabbitMQ
- Валидация данных
- Обработка ошибок
- Логирование
- Docker контейнеризация

## Технологии

- **Node.js** - серверная платформа
- **TypeScript** - типизированный JavaScript
- **Express.js** - веб-фреймворк
- **PostgreSQL** - основная база данных
- **Redis** - кэширование
- **RabbitMQ** - система обмена сообщениями
- **Docker** - контейнеризация
- **Joi** - валидация данных
- **Winston** - логирование

## Требования

- Node.js 18+
- Docker и Docker Compose
- PostgreSQL
- Redis
- RabbitMQ

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

```bash
cp env.example .env
```

Отредактируйте `.env` файл под ваши настройки.

### 3. Запуск с Docker Compose (либо вручную установить - redis, rabbitMQ, postgreSQL)

```bash
# Запуск всех сервисов
docker-compose up -d

# Или для разработки
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Запуск приложения

```bash
# Режим разработки
npm run dev

# Продакшн
npm run build
npm start
```

## Архитектура

### Микросервисная архитектура
- **API Gateway** - Express.js приложение
- **Database Service** - PostgreSQL
- **Cache Service** - Redis
- **Message Broker** - RabbitMQ

### Паттерны проектирования
- **Repository Pattern** - для работы с данными
- **Service Layer** - бизнес-логика
- **Controller Layer** - обработка HTTP запросов
- **Middleware Pattern** - перехватчики запросов

## Тестирование

```bash
# Запуск тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage
```

## Логирование

Логи сохраняются в папке `logs/`:
- `error.log` - только ошибки
- `combined.log` - все логи

## Docker

### Сборка образа
```bash
docker build -t booking-system-api .
```

### Запуск контейнера
```bash
docker run -p 3000:3000 booking-system-api
```

### Docker Compose
```bash
# Продакшн
docker-compose up -d

# Разработка
docker-compose -f docker-compose.dev.yml up -d
```

## Безопасность

- **Helmet.js** - защита HTTP заголовков
- **CORS** - настройка кросс-доменных запросов
- **Валидация входных данных** - Joi
- **Обработка ошибок** - без утечки информации
- **Логирование** - для мониторинга безопасности

## Документация

- **[QUICK_START.md](QUICK_START.md)** - быстрый старт
- **[README.md](README.md)** - полная документация