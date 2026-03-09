import { Router, Request, Response } from 'express'
import { aiService } from '../services/AIService'
import { AgentService } from '../services/AgentService'

const router = Router()
const agentService = new AgentService(process.env.OPENAI_API_KEY || '')

/**
 * @route   POST /api/v1/ai/task
 * @desc    分配AI任务给代理
 * @access  Public
 */
router.post('/task', async (req: Request, res: Response) => {
  try {
    const { agentId, taskType, input, options } = req.body

    // 验证参数
    if (!agentId || !taskType || !input) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: agentId, taskType, input',
        timestamp: new Date().toISOString()
      })
    }

    // 获取代理配置
    const agent = agentService.getAgent(agentId)
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `代理 ${agentId} 不存在`,
        timestamp: new Date().toISOString()
      })
    }

    // 检查代理状态
    if (agent.isBusy) {
      return res.status(409).json({
        success: false,
        error: `代理 ${agent.name} 当前忙碌中`,
        timestamp: new Date().toISOString()
      })
    }

    // 更新代理状态
    agentService.updateAgentStatus(agentId, 'busy', `处理AI任务: ${taskType}`)

    // 将AgentStatus转换为AgentConfig
    const agentConfig = convertToAgentConfig(agent)
    
    // 执行AI任务
    const result = await aiService.assignAITask(agentConfig, taskType, input, options)

    // 恢复代理状态
    agentService.updateAgentStatus(agentId, 'idle')

    // 记录任务完成
    agentService.recordTaskCompletion(agentId, {
      taskId: result.taskId,
      type: taskType,
      score: result.confidence * 100,
      processingTime: result.processingTime
    })

    res.json({
      success: true,
      data: result,
      message: 'AI任务执行成功',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI任务分配失败:', error)
    
    // 如果代理状态被设置为busy，恢复为idle
    if (req.body.agentId) {
      try {
        agentService.updateAgentStatus(req.body.agentId, 'idle')
      } catch (e) {
        // 忽略恢复错误
      }
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * @route   GET /api/v1/ai/history/:agentId
 * @desc    获取代理的AI任务历史
 * @access  Public
 */
router.get('/history/:agentId', (req: Request, res: Response) => {
  try {
    const agentId = req.params.agentId as string
    const limit = parseInt(req.query.limit as string) || 20

    // 验证代理存在
    const agent = agentService.getAgent(agentId)
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `代理 ${agentId} 不存在`,
        timestamp: new Date().toISOString()
      })
    }

    // 获取任务历史
    const history = aiService.getAgentTaskHistory(agentId, limit)

    res.json({
      success: true,
      data: {
        agent: {
          id: agent.agentId,
          name: agent.name,
          role: agent.role
        },
        history,
        total: history.length
      },
      message: '获取任务历史成功',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('获取任务历史失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * @route   GET /api/v1/ai/statistics
 * @desc    获取AI任务统计信息
 * @access  Public
 */
router.get('/statistics', (req: Request, res: Response) => {
  try {
    const statistics = aiService.getTaskStatistics()

    res.json({
      success: true,
      data: statistics,
      message: '获取统计信息成功',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('获取统计信息失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * @route   GET /api/v1/ai/models
 * @desc    获取可用AI模型列表
 * @access  Public
 */
router.get('/models', (req: Request, res: Response) => {
  try {
    const models = aiService.getAvailableModels()

    res.json({
      success: true,
      data: models,
      message: '获取模型列表成功',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('获取模型列表失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * @route   POST /api/v1/ai/batch
 * @desc    批量执行AI任务
 * @access  Public
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { tasks } = req.body

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'tasks必须是非空数组',
        timestamp: new Date().toISOString()
      })
    }

    // 限制批量任务数量
    if (tasks.length > 10) {
      return res.status(400).json({
        success: false,
        error: '批量任务数量不能超过10个',
        timestamp: new Date().toISOString()
      })
    }

    const results: any[] = []
    const errors: Array<{index: number, error: string, task: any}> = []

    // 并行执行任务
    const taskPromises = tasks.map(async (task, index) => {
      try {
        const { agentId, taskType, input, options } = task

        // 验证参数
        if (!agentId || !taskType || !input) {
          errors.push({
            index,
            error: '缺少必要参数',
            task
          })
          return null
        }

        // 获取代理配置
        const agent = agentService.getAgent(agentId)
        if (!agent) {
          errors.push({
            index,
            error: `代理 ${agentId} 不存在`,
            task
          })
          return null
        }

        // 执行AI任务
        const agentConfig = convertToAgentConfig(agent)
        const result = await aiService.assignAITask(agentConfig, taskType, input, options)
        
        // 记录任务完成
        agentService.recordTaskCompletion(agentId, {
          taskId: result.taskId,
          type: taskType,
          score: result.confidence * 100,
          processingTime: result.processingTime
        })

        return result

      } catch (error) {
        errors.push({
          index,
          error: error instanceof Error ? error.message : String(error),
          task
        })
        return null
      }
    })

    // 等待所有任务完成
    const taskResults = await Promise.all(taskPromises)
    
    // 过滤掉失败的任务
    const successfulResults = taskResults.filter(result => result !== null)

    res.json({
      success: true,
      data: {
        total: tasks.length,
        completed: successfulResults.length,
        failed: errors.length,
        results: successfulResults,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `批量任务执行完成，成功: ${successfulResults.length}, 失败: ${errors.length}`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('批量任务执行失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * @route   DELETE /api/v1/ai/history/:agentId
 * @desc    清除代理的AI任务历史
 * @access  Public
 */
router.delete('/history/:agentId', (req: Request, res: Response) => {
  try {
    const agentId = req.params.agentId as string

    // 验证代理存在
    const agent = agentService.getAgent(agentId)
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `代理 ${agentId} 不存在`,
        timestamp: new Date().toISOString()
      })
    }

    // 清除历史
    aiService.clearTaskHistory(agentId)

    res.json({
      success: true,
      message: `已清除代理 ${agent.name} 的任务历史`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('清除任务历史失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * @route   GET /api/v1/ai/status
 * @desc    获取AI服务状态
 * @access  Public
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const connectionStatus = await aiService.testConnection()
    const statistics = aiService.getTaskStatistics()

    res.json({
      success: true,
      data: {
        connection: connectionStatus,
        statistics,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      message: 'AI服务状态正常',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('获取AI服务状态失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * @route   POST /api/v1/ai/analyze
 * @desc    学术内容深度分析
 * @access  Public
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { content, analysisType, options } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        error: '缺少分析内容',
        timestamp: new Date().toISOString()
      })
    }

    // 选择最适合分析的代理
    const agents = agentService.getAllAgents()
    const analysisAgent = agents.find(agent => 
      agent.role.includes('分析') || agent.role.includes('审稿')
    ) || agents[0]

    // 执行深度分析
    const analysisAgentConfig = convertToAgentConfig(analysisAgent)
    const result = await aiService.assignAITask(
      analysisAgentConfig,
      'paper_analysis',
      content,
      {
        ...options,
        temperature: 0.3, // 分析任务需要较低温度
        maxTokens: 2048
      }
    )

    res.json({
      success: true,
      data: {
        analysis: result.output,
        agent: {
          id: analysisAgent.agentId,
          name: analysisAgent.name,
          role: analysisAgent.role
        },
        metadata: result.metadata
      },
      message: '学术内容分析完成',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('学术内容分析失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * @route   POST /api/v1/ai/generate
 * @desc    学术内容生成
 * @access  Public
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, contentType, style, options } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '缺少生成提示',
        timestamp: new Date().toISOString()
      })
    }

    // 选择最适合生成的代理
    const agents = agentService.getAllAgents()
    const writingAgent = agents.find(agent => 
      agent.role.includes('撰写') || agent.role.includes('内容')
    ) || agents[2] // 默认使用文心

    // 构建生成任务
    const taskType = contentType === 'literature_review' ? 'literature_review' : 'content_writing'
    
    // 根据风格调整参数
    const generationOptions = {
      ...options,
      temperature: style === 'creative' ? 0.9 : style === 'academic' ? 0.7 : 0.8,
      maxTokens: 3072
    }

    // 执行生成任务
    const writingAgentConfig = convertToAgentConfig(writingAgent)
    const result = await aiService.assignAITask(
      writingAgentConfig,
      taskType,
      prompt,
      generationOptions
    )

    res.json({
      success: true,
      data: {
        content: result.output,
        agent: {
          id: writingAgent.agentId,
          name: writingAgent.name,
          role: writingAgent.role
        },
        metadata: result.metadata
      },
      message: '学术内容生成完成',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('学术内容生成失败:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * 将AgentStatus转换为AgentConfig
 */
function convertToAgentConfig(agentStatus: any): any {
  // 从配置文件中获取完整的代理配置
  const agentsConfig = require('../../../config/agents.json')
  const fullConfig = agentsConfig.agents.find((a: any) => a.id === agentStatus.agentId)
  
  if (!fullConfig) {
    throw new Error(`找不到代理 ${agentStatus.agentId} 的完整配置`)
  }

  return {
    ...fullConfig,
    status: agentStatus.isBusy ? 'busy' : 'idle',
    currentTask: agentStatus.currentTask?.content,
    performance: {
      tasksCompleted: agentStatus.completedTasks,
      averageScore: 0,
      learningProgress: agentStatus.learningProgress,
      lastActive: agentStatus.lastActivity
    }
  }
}

export default router