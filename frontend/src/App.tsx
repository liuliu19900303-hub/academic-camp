import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { useState, useEffect } from 'react'
import OfficeScene from './scenes/OfficeScene'
import './styles/theme.css'

function App() {
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showStats, setShowStats] = useState(false)

  // 获取系统状态
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/agents/system/status')
        const data = await response.json()
        if (data.success) {
          setSystemStatus(data.data)
        }
      } catch (error) {
        console.error('获取系统状态失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 30000) // 每30秒更新一次

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="container mx-auto flex justify-between items-center">
          <div className="navbar-brand">
            <span className="text-2xl">🦞📚</span>
            <span>学术集中营</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? '隐藏统计' : '显示统计'}
            </button>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${systemStatus?.agents?.busy > 0 ? 'bg-warning-orange pulse' : 'bg-success-green'}`}></div>
              <span className="text-sm">
                {loading ? '连接中...' : `${systemStatus?.agents?.busy || 0}个代理忙碌`}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 标题区域 */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            学术集中营 · 智慧创新平台
          </h1>
          <p className="text-xl text-neutral-dark max-w-3xl mx-auto">
            基于AI代理的3D沉浸式学术协作环境，专为管理科学与工程、人工智能、数智病理等交叉学科研究设计
          </p>
        </div>

        {/* 系统状态卡片 */}
        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-in">
            <div className="card academic-border">
              <h3 className="text-lg font-semibold mb-2">代理状态</h3>
              <div className="flex items-center justify-between">
                <span>在线代理</span>
                <span className="text-2xl font-bold text-primary-blue">
                  {systemStatus.agents.total}
                </span>
              </div>
              <div className="progress mt-2">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${(systemStatus.agents.busy / systemStatus.agents.total) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="text-sm text-neutral-dark mt-1">
                {systemStatus.agents.busy}个忙碌，{systemStatus.agents.total - systemStatus.agents.busy}个空闲
              </div>
            </div>

            <div className="card academic-border">
              <h3 className="text-lg font-semibold mb-2">任务状态</h3>
              <div className="flex items-center justify-between">
                <span>总任务数</span>
                <span className="text-2xl font-bold text-secondary-blue">
                  {systemStatus.tasks.total}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-info-cyan rounded-full"></div>
                  <span>进行中: {systemStatus.tasks.processing}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success-green rounded-full"></div>
                  <span>已完成: {systemStatus.tasks.completed}</span>
                </div>
              </div>
            </div>

            <div className="card academic-border">
              <h3 className="text-lg font-semibold mb-2">学习进度</h3>
              <div className="flex items-center justify-between">
                <span>平均进度</span>
                <span className="text-2xl font-bold text-accent-blue">
                  {systemStatus.agents.averageLearningProgress.toFixed(1)}%
                </span>
              </div>
              <div className="progress mt-2">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${systemStatus.agents.averageLearningProgress}%` 
                  }}
                ></div>
              </div>
              <div className="text-sm text-neutral-dark mt-1">
                最近上传: {systemStatus.learning.recentUploads.length}份资料
              </div>
            </div>

            <div className="card academic-border">
              <h3 className="text-lg font-semibold mb-2">系统运行</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>运行时间</span>
                  <span className="font-mono">
                    {Math.floor(systemStatus.system.uptime / 3600)}h
                    {Math.floor((systemStatus.system.uptime % 3600) / 60)}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>内存使用</span>
                  <span className="font-mono">
                    {(systemStatus.system.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>最后更新</span>
                  <span className="text-xs">
                    {new Date(systemStatus.system.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3D场景 */}
        <div className="scene-container mb-8 fade-in">
          <Canvas shadows camera={{ position: [15, 12, 15], fov: 45 }}>
            <OfficeScene />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
            />
            {showStats && <Stats />}
          </Canvas>
        </div>

        {/* 代理介绍 */}
        <div className="mb-12 fade-in">
          <h2 className="text-3xl font-bold mb-6 text-center">学术代理团队</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 'wenyuan',
                name: '文渊',
                role: '文献搜集和文献综述',
                description: '负责搜索、筛选、整理相关学术文献，撰写文献综述，跟踪研究前沿动态。',
                skills: ['文献检索', '文献分析', '综述撰写', '趋势预测']
              },
              {
                id: 'wengou',
                name: '文构',
                role: '论文框架和理论构建',
                description: '设计论文整体结构，构建理论模型，选择研究方法，制定研究计划。',
                skills: ['框架设计', '理论建模', '方法选择', '计划制定']
              },
              {
                id: 'wenxin',
                name: '文心',
                role: '论文内容撰写与修改',
                description: '撰写论文正文内容，优化语言表达，确保逻辑连贯，提升学术质量。',
                skills: ['内容撰写', '语言优化', '逻辑梳理', '质量提升']
              },
              {
                id: 'wenxiao',
                name: '文校',
                role: '论文格式与模板校对',
                description: '检查格式规范，校对参考文献，验证图表编号，确保排版正确。',
                skills: ['格式检查', '参考文献', '图表校对', '排版优化']
              },
              {
                id: 'wenshen',
                name: '文审',
                role: '模拟审稿专家与质控',
                description: '模拟审稿专家视角，评估论文质量，提出修改意见，给出审稿结论。',
                skills: ['质量评估', '修改建议', '审稿模拟', '质量控制']
              },
              {
                id: 'wenkan',
                name: '文刊',
                role: '期刊整理与投稿评价',
                description: '分析目标期刊，评估发表机会，制定投稿策略，预测审稿周期。',
                skills: ['期刊分析', '机会评估', '策略制定', '周期预测']
              }
            ].map((agent) => (
              <div key={agent.id} className="card hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ 
                      background: `linear-gradient(135deg, ${BLUE_THEME.primary.main}, ${BLUE_THEME.secondary.main})`
                    }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{agent.name}</h3>
                    <p className="text-sm text-neutral-dark">{agent.role}</p>
                  </div>
                </div>
                <p className="text-neutral-dark mb-4">{agent.description}</p>
                <div className="flex flex-wrap gap-2">
                  {agent.skills.map((skill, i) => (
                    <span key={i} className="badge badge-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 功能特性 */}
        <div className="mb-12 fade-in">
          <h2 className="text-3xl font-bold mb-6 text-center">核心功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">智能代理协作</h3>
              <p className="text-neutral-dark">
                6个专业学术代理协同工作，覆盖从文献检索到论文投稿的全流程。
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-2">3D沉浸环境</h3>
              <p className="text-neutral-dark">
                虚拟办公室环境，直观展示代理工作状态，提升协作效率和体验。
              </p>
            </div>
            
            <div className="card text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">实时进度跟踪</h3>
              <p className="text-neutral-dark">
                实时监控任务进度、学习状态和系统性能，数据驱动决策优化。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="footer">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="navbar-brand text-xl mb-2">
                🦞📚 学术集中营
              </div>
              <p className="text-blue-200">
                3D沉浸式学术协作平台 · 版本 0.1.0
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-blue-200 mb-2">
                © 2026 学术集中营项目 · 保留所有权利
              </p>
              <div className="flex gap-4 justify-center md:justify-end">
                <a href="http://localhost:3001/health" target="_blank" rel="noopener noreferrer">
                  API状态
                </a>
                <a href="http://localhost:3001/api/v1/agents" target="_blank" rel="noopener noreferrer">
                  代理管理
                </a>
                <a href="http://localhost:3001/api/v1/learning/materials" target="_blank" rel="noopener noreferrer">
                  学习资料
                </a>
              </div>
            </div>
          </div>
          
          <div className="divider my-6"></div>
          
          <div className="text-center text-blue-300 text-sm">
            <p className="mb-2">
              技术支持: React · Three.js · Node.js · Express · TypeScript
            </p>
            <p>
              当前时间: {new Date().toLocaleString('zh-CN', { 
                timeZone: 'Asia/Shanghai',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
        </div>
      </footer>

      {/* 加载状态 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-white text-lg">正在连接学术集中营系统...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// 蓝色主题常量（从OfficeScene导入）
import { BLUE_THEME } from './scenes/OfficeScene'

export default App