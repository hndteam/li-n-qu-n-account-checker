# Liên Quân Account Checker - Production Ready v2.0

Full-stack web application để kiểm tra thông tin tài khoản Liên Quân Mobile từ các API provider khác nhau.

## ✨ Tính năng

- ✅ **Đăng nhập / Đăng ký** - JWT authentication
- ✅ **Kiểm tra tài khoản** - Hỗ trợ nhiều provider:
  - **Mock Data** - Dữ liệu demo cho testing
  - **Lien Quan Data** - Open JSON dataset (Heroes, Items, Runes)
  - **Checker Garena** - Community tool API
  - **Public Stats** - Thống kê công khai
- ✅ **Lịch sử kiểm tra** - Lưu và quản lý toàn bộ hoạt động
- ✅ **Tài khoản đã lưu** - Bookmark và quản lý favorite accounts
- ✅ **Admin Dashboard** - Quản lý users, thống kê, analytics
- ✅ **Export Data** - Xuất CSV / Excel
- ✅ **Multiple Databases** - MongoDB hoặc PostgreSQL
- ✅ **Production Ready** - Docker, Heroku, AWS, VPS

## 🚀 Quick Start

### Local Development

```bash
# Clone repo
git clone your-repo
cd your-repo

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Run database migration
node scripts/migrate.js

# Start development server
npm run dev

# Open http://localhost:3000
```

### Using Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

## 📋 Configuration

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_TYPE=mongo  # or postgres
MONGO_URI=mongodb://localhost:27017/lien-quan-checker
POSTGRES_URL=postgresql://user:password@localhost:5432/lien_quan_checker

# Auth
JWT_SECRET=your-32-char-secret-key
JWT_EXPIRE=7d

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!

# Providers
CHECKER_GARENA_URL=https://api.checker-garena.com
CHECKER_GARENA_TOKEN=your-api-token
```

## 🔌 API Providers

### 1. Mock Data (Default)
```javascript
// For testing without external API
POST /api/accounts/check
{
  "nickname": "SkyBlade",
  "provider": "mock"
}
```

### 2. Lien Quan Data (Open JSON)
```javascript
// Uses https://github.com/MLuc24/lien-quan-data
POST /api/accounts/check
{
  "nickname": "Sagittarius",  // Hero name
  "provider": "lienquan_data"
}
```

### 3. Checker Garena (Community API)
```javascript
// Requires CHECKER_GARENA_URL in .env
POST /api/accounts/check
{
  "accountId": "123456789",
  "server": "vn",
  "provider": "checker_garena"
}
```

### 4. Public Stats
```javascript
POST /api/accounts/check
{
  "nickname": "PlayerName",
  "provider": "public_stats"
}
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Accounts
- `POST /api/accounts/check` - Check account
- `GET /api/accounts/saved` - Get saved accounts
- `GET /api/accounts/providers` - List providers
- `GET /api/accounts/providers/health` - Check provider status
- `DELETE /api/accounts/:id` - Delete saved account

### History
- `GET /api/history` - Get check history
- `GET /api/history/stats` - Get statistics
- `DELETE /api/history/:id` - Delete history record

### Export
- `GET /api/export/history/csv` - Export as CSV
- `GET /api/export/history/excel` - Export as Excel
- `GET /api/export/accounts/excel` - Export accounts as Excel

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id/role` - Change user role
- `PATCH /api/admin/users/:id/status` - Disable/enable user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/checks` - View all checks
- `GET /api/admin/stats` - System statistics

## 🗄️ Database Schema

### User
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  profile: { name, avatar },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Account
```javascript
{
  userId: ObjectId,
  accountId: String,
  nickname: String,
  server: String,
  level: Number,
  rank: String,
  winRate: Number,
  matches: Number,
  status: String,
  avatar: String,
  provider: String,
  rawData: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

### CheckHistory
```javascript
{
  userId: ObjectId,
  accountId: String,
  nickname: String,
  server: String,
  provider: String,
  status: 'success' | 'error' | 'pending',
  result: Mixed,
  errorMessage: String,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

## 🚢 Deployment

### Heroku
```bash
heroku create your-app-name
heroku addons:create mongolab:sandbox
heroku config:set JWT_SECRET="your-secret"
heroku config:set NODE_ENV=production
git push heroku main
```

### Docker Registry
```bash
docker build -t your-app:latest .
docker tag your-app:latest your-registry/your-app:latest
docker push your-registry/your-app:latest
```

### AWS EC2
```bash
# SSH vào server
ssh -i your-key.pem ec2-user@your-ip

# Cài Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs pm2

# Clone và chạy
git clone your-repo
cd your-repo
npm install
node scripts/migrate.js
pm2 start server.js --name lien-quan
pm2 startup
```

## 📈 Performance & Security

### Implemented
- ✅ JWT Token-based authentication
- ✅ Password hashing (bcryptjs)
- ✅ CORS enabled
- ✅ Input validation
- ✅ Error handling
- ✅ Database indexing

### Recommended
- [ ] Rate limiting (express-rate-limit)
- [ ] Redis caching
- [ ] HTTPS/SSL
- [ ] API key rotation
- [ ] Audit logging
- [ ] Regular backups

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Or start MongoDB
mongod
```

### Port Already in Use
```bash
lsof -i :3000
kill -9 <PID>
```

### Reset Admin Password
```bash
node scripts/migrate.js
# Check console for new credentials
```

## 📄 License

MIT

## ⚖️ Legal Notice

⚠️ **Important**: This tool uses community APIs and data sources. Be aware:
- Garena has strict Terms of Service regarding account checking
- Only check accounts you own or have explicit permission to check
- Unauthorized access or distribution is illegal
- Use at your own risk for personal/educational purposes only
- Not intended for commercial use or mass data collection

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Make changes
4. Submit pull request

## 📧 Support

For issues, questions, or suggestions:
- Open GitHub Issue
- Check existing documentation
- Review provider API docs

---

**Made with ❤️ for Liên Quân community**
