# StockSenseAI - Quick Deploy to Render

## 🚀 Hızlı Başlangıç

### 1️⃣ GitHub'a Push
```bash
git add .
git commit -m "Ready for Render"
git push origin main
```

### 2️⃣ Render'da Deploy
1. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
2. GitHub repo'nuzu seç
3. **Apply** (render.yaml otomatik algılanacak)

### 3️⃣ Environment Variables Ekle
Web Service → Environment sekmesi:
```
DATABASE_URL=<Render veritabanından alınacak - otomatik>
Jwt__Key=<Güçlü random string>
Jwt__Issuer=StockSenseAI
Jwt__Audience=StockSenseAI
OpenAI__ApiKey=<OpenAI API Key>
FRONTEND_URL=<Frontend URL>
```

### 4️⃣ Deploy & Test
```bash
curl https://your-app.onrender.com/health
# Yanıt: Healthy ✅
```

## 📚 Detaylı Rehber
Tüm adımlar için: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

## ✅ Hazır Özellikler
- ✅ Auto-Migration
- ✅ Health Checks
- ✅ Global Error Handling
- ✅ DATABASE_URL Parsing
- ✅ CORS Configuration
- ✅ JWT Authentication

## 🎯 Bu Proje
- .NET 8.0
- PostgreSQL
- OpenAI Integration
- SignalR Real-time
