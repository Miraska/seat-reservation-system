-- Создание базы данных
CREATE DATABASE booking_system;

-- Подключение к базе данных
\c booking_system;

-- Создание таблицы events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы bookings
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id) -- Уникальное ограничение для предотвращения двойного бронирования
);

-- Создание индексов для оптимизации производительности
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Создание функции для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных
INSERT INTO events (name, total_seats) VALUES 
('Конференция по разработке', 100),
('Воркшоп по TypeScript', 50),
('Митап по Node.js', 30),
('Семинар по PostgreSQL', 25);
