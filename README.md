# url-checker

Сервис для проверки доступности списка URL (HEAD-запросы, обработка в фоне).

## Запуск

```bash
docker compose up --build
```

Можно просто перейти по папкам frontend, backend и запустить через npm run dev.

Фронт будет на http://localhost:8080, api на 3000.

## Разработка

Нужен Node 20+. В двух терминалах:

```bash
cd backend && npm i && npm run dev
```

```bash
cd frontend && npm i && npm run dev
```

Фронт поднимется на 8080 порту, запросы на /api уходят в бэкенд через прокси vite.
