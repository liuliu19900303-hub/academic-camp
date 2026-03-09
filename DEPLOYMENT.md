# 🚀 学术集中营 - 部署指南

## 📋 部署概览

学术集中营采用现代化云原生架构，支持自动化部署和持续集成。

### 部署架构
```
GitHub Repository
    │
    ├── GitHub Actions (CI/CD)
    │   ├── 前端构建 → GitHub Pages
    │   └── 后端构建 → Vercel
    │
    └── 自动化监控
        ├── 每2小时进度报告
        └── 健康检查告警
```

## 🛠️ 本地开发环境

### 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: >= 2.30.0

### 快速开始
```bash
# 1. 克隆仓库
git clone https://github.com/liuliu19900303-hub/academic-camp.git
cd academic-camp

# 2. 启动开发环境
./start.sh dev

# 3. 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:3001/health
```

### 开发命令
```bash
# 启动开发服务器
./start.sh dev

# 构建项目
./start.sh build

# 运行测试
./start.sh test

# 清理项目
./start.sh clean

# 查看帮助
./start.sh help
```

## 🌐 生产环境部署

### 1. GitHub Pages (前端部署)

#### 自动部署 (推荐)
- 推送到 `main` 分支自动触发部署
- 前端构建结果自动发布到 GitHub Pages
- 访问地址: `https://liuliu19900303-hub.github.io/academic-camp/`

#### 手动部署
```bash
# 构建前端
cd frontend
npm run build

# 部署到GitHub Pages
# 使用GitHub Actions自动完成
```

### 2. Vercel (后端部署)

#### 环境变量配置
在Vercel项目中设置以下环境变量：
```env
# 服务器配置
PORT=3001
NODE_ENV=production

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key

# 飞书配置
FEISHU_WEBHOOK_URL=your_feishu_webhook_url
FEISHU_SECRET=your_feishu_secret

# 安全配置
CORS_ORIGIN=https://liuliu19900303-hub.github.io
```

#### 部署步骤
1. 连接GitHub仓库到Vercel
2. 设置构建命令: `cd backend && npm run build`
3. 设置输出目录: `backend/dist`
4. 配置环境变量
5. 部署

### 3. 自定义域名配置

#### GitHub Pages
1. 在仓库设置中启用GitHub Pages
2. 配置自定义域名
3. 设置HTTPS强制

#### Vercel
1. 在Vercel项目设置中添加域名
2. 配置DNS记录
3. 启用HTTPS

## 🔧 GitHub Actions配置

### 工作流文件
`.github/workflows/ci-cd.yml`

### 密钥配置
在GitHub仓库设置中配置以下密钥：
- `VERCEL_TOKEN`: Vercel部署令牌
- `VERCEL_ORG_ID`: Vercel组织ID
- `VERCEL_PROJECT_ID`: Vercel项目ID
- `FEISHU_WEBHOOK_URL`: 飞书webhook地址
- `FEISHU_SECRET`: 飞书webhook密钥

### 自动化流程
1. **代码推送** → 自动测试和构建
2. **合并到main** → 自动部署到生产环境
3. **每2小时** → 自动生成进度报告
4. **部署完成** → 发送部署通知

## 📊 监控和告警

### 健康检查
```bash
# 后端健康检查
curl https://your-backend-domain.vercel.app/health

# 响应示例
{
  "status": "healthy",
  "project": "学术集中营",
  "version": "0.1.0",
  "timestamp": "2026-03-07T19:45:00Z"
}
```

### 监控指标
1. **API响应时间**: < 500ms
2. **3D渲染帧率**: > 30fps
3. **服务可用性**: > 99.9%
4. **错误率**: < 0.1%

### 告警配置
- **飞书机器人**: 部署状态、错误告警
- **GitHub Actions**: 构建失败通知
- **Vercel监控**: 性能异常告警

## 🔒 安全配置

### 前端安全
```javascript
// Content Security Policy
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'

// HTTPS强制
Strict-Transport-Security: max-age=31536000; includeSubDomains

// XSS防护
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
```

### 后端安全
```typescript
// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

// 请求限制
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP最多100个请求
}))

// 输入验证
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
```

### 文件上传安全
- 文件类型白名单
- 文件大小限制 (10MB)
- 病毒扫描 (可选)
- 临时文件清理

## 📈 性能优化

### 前端优化
```javascript
// 代码分割
const OfficeScene = React.lazy(() => import('./scenes/OfficeScene'))

// 图片优化
import { useTexture } from '@react-three/drei'

// 缓存策略
serviceWorker.register()
```

### 后端优化
```typescript
// 数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Redis缓存
const redis = new Redis(process.env.REDIS_URL)

// 响应压缩
app.use(compression())
```

### CDN配置
- 静态资源CDN加速
- 图片和模型文件CDN
- API响应缓存

## 🔄 备份和恢复

### 数据库备份
```bash
# 自动备份脚本
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# 保留最近7天备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### 文件备份
- 学习资料定期备份到云存储
- 配置文件版本控制
- 日志文件轮转

### 恢复流程
1. 恢复数据库备份
2. 重新部署应用
3. 验证数据完整性
4. 发送恢复通知

## 🚨 故障排除

### 常见问题

#### 1. 部署失败
```bash
# 检查GitHub Actions日志
# 验证环境变量配置
# 检查依赖安装

# 手动部署测试
./start.sh build
./start.sh test
```

#### 2. 服务不可用
```bash
# 检查健康端点
curl https://your-backend-domain/health

# 查看日志
vercel logs your-project-name

# 重启服务
vercel deploy --prod
```

#### 3. 性能问题
```bash
# 监控API响应时间
# 检查数据库查询性能
# 优化3D模型大小
# 启用CDN缓存
```

#### 4. 安全警报
```bash
# 更新依赖包
npm audit fix

# 检查安全头配置
# 验证文件上传限制
# 审查访问日志
```

### 支持渠道
- **GitHub Issues**: 技术问题和功能请求
- **飞书群组**: 实时支持和进度汇报
- **文档网站**: 详细使用指南
- **监控面板**: 系统状态查看

## 📝 更新日志

### v0.1.0 (2026-03-07)
- ✅ 初始版本发布
- ✅ 3D沉浸式办公室
- ✅ 6个智能代理系统
- ✅ 技能提升系统
- ✅ 自动化部署流水线
- ✅ 飞书进度报告

### 未来版本规划
- v0.2.0: 实时协作功能
- v0.3.0: 移动端适配
- v0.4.0: 高级分析功能
- v1.0.0: 正式生产版本

---

**最后更新**: 2026-03-07 19:45
**部署状态**: 准备首次部署
**支持团队**: 小龙虾学术团队 🦞📚