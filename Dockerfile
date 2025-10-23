FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Компилируем TypeScript
RUN npm run build

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Создаем директорию для логов
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app

# Переключаемся на пользователя nodejs
USER nodejs

# Открываем порт
EXPOSE 3000

# Команда запуска
CMD ["npm", "start"]
