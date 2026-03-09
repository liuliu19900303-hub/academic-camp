import { useRef, useState } from 'react'
import { Mesh } from 'three'
import { Text, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

// 蓝色学术主题颜色
export const BLUE_THEME = {
  // 主蓝色调
  primary: {
    dark: '#0d1b5c',
    main: '#1a237e',
    light: '#283593',
    lighter: '#303f9f'
  },
  // 辅助蓝色
  secondary: {
    dark: '#0d47a1',
    main: '#1565c0',
    light: '#1976d2',
    lighter: '#2196f3'
  },
  // 强调蓝色
  accent: {
    dark: '#01579b',
    main: '#0277bd',
    light: '#0288d1',
    lighter: '#03a9f4'
  },
  // 学术金色
  academic: {
    gold: '#ffd700',
    silver: '#c0c0c0',
    bronze: '#cd7f32'
  },
  // 中性色
  neutral: {
    white: '#ffffff',
    light: '#f5f7fa',
    gray: '#e0e0e0',
    dark: '#424242',
    black: '#212121'
  }
}

// 办公室组件
const OfficeRoom = ({ position, size, name, title, avatar, color, description }: any) => {
  return (
    <group position={position}>
      {/* 办公室主体 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.7} />
      </mesh>
      
      {/* 门 - 正面 */}
      <mesh position={[0, -size.height/4, size.depth/2 + 0.1]} castShadow>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>
      
      {/* 门头标识 */}
      <group position={[0, size.height/2 + 0.5, size.depth/2 + 0.2]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[size.width * 0.8, 0.8, 0.1]} />
          <meshStandardMaterial color={BLUE_THEME.neutral.white} />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.4}
          color={BLUE_THEME.primary.dark}
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      </group>
      
      {/* 门侧边名字 */}
      <group position={[size.width/2 + 0.1, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[1.2, 0.5, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color={BLUE_THEME.neutral.white}
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
      
      {/* 头像图标 */}
      <Text
        position={[size.width/2 + 0.2, size.height/2 - 0.5, 0]}
        rotation={[0, -Math.PI/2, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {avatar}
      </Text>
      
      {/* 描述信息（悬停显示） */}
      <Html position={[0, size.height/2 + 1.5, 0]} center>
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '8px',
          border: `2px solid ${color}`,
          fontSize: '12px',
          color: BLUE_THEME.primary.dark,
          whiteSpace: 'nowrap',
          display: 'none'
        }} className="office-description">
          {description}
        </div>
      </Html>
    </group>
  )
}

// 代理工位组件
const AgentWorkstation = ({ agent, position }: any) => {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      
      // 工作状态动画
      let animationY = 0
      let animationScale = 1
      
      switch(agent.id) {
        case 'wenyuan':  // 文献搜索
          animationY = Math.sin(time * 1.5) * 0.05
          break
        case 'wengou':   // 框架构建
          animationY = Math.sin(time * 0.8) * 0.03
          animationScale = 1 + Math.sin(time) * 0.02
          break
        case 'wenxin':   // 内容撰写
          animationY = Math.sin(time * 3) * 0.04
          break
        case 'wenxiao':  // 格式校对
          animationY = Math.sin(time * 2) * 0.03
          break
        case 'wenshen':  // 质量审查
          animationY = Math.sin(time * 0.5) * 0.02
          break
        case 'wenkan':   // 投稿评估
          animationY = Math.sin(time * 1.2) * 0.04
          animationScale = 1 + Math.sin(time * 0.7) * 0.01
          break
      }
      
      meshRef.current.position.y = 0.5 + animationY
      meshRef.current.scale.setScalar(animationScale)
      
      if (hovered) {
        meshRef.current.rotation.y = time * 0.5
      }
    }
  })

  // 代理颜色映射
  const agentColors: any = {
    wenyuan: BLUE_THEME.primary.main,
    wengou: BLUE_THEME.secondary.main,
    wenxin: BLUE_THEME.accent.main,
    wenxiao: BLUE_THEME.primary.light,
    wenshen: BLUE_THEME.secondary.light,
    wenkan: BLUE_THEME.accent.light
  }

  const agentColor = agentColors[agent.id] || BLUE_THEME.primary.main

  return (
    <group position={position}>
      {/* 工位桌子 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial 
          color={agentColor}
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      
      {/* 代理人物 */}
      <mesh 
        ref={meshRef} 
        position={[0, 1.5, 0]}
        castShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
        <meshStandardMaterial 
          color={agentColor}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>
      
      {/* 工位名牌 */}
      <group position={[0, 2.5, 1.2]}>
        <mesh>
          <boxGeometry args={[1.5, 0.3, 0.1]} />
          <meshStandardMaterial color={BLUE_THEME.neutral.white} />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.2}
          color={BLUE_THEME.primary.dark}
          anchorX="center"
          anchorY="middle"
        >
          {agent.name}
        </Text>
        <Text
          position={[0, -0.15, 0.1]}
          fontSize={0.12}
          color={BLUE_THEME.neutral.dark}
          anchorX="center"
          anchorY="middle"
          maxWidth={1.2}
        >
          {agent.role}
        </Text>
      </group>
      
      {/* 头像图标 */}
      <Text
        position={[0, 2.2, 1.3]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {agent.avatar}
      </Text>
    </group>
  )
}

// 会议室组件
const MeetingRoom = ({ position, size }: any) => {
  return (
    <group position={position}>
      {/* 会议室主体 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial 
          color={BLUE_THEME.accent.main}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      
      {/* 会议桌 */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 1, 8]} />
        <meshStandardMaterial 
          color={BLUE_THEME.academic.gold}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>
      
      {/* 椅子 */}
      {[-2, 2].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0]} castShadow>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshStandardMaterial color={BLUE_THEME.secondary.light} />
        </mesh>
      ))}
      
      {/* 标识 */}
      <Text
        position={[0, size.height/2 + 0.5, size.depth/2 + 0.1]}
        fontSize={0.4}
        color={BLUE_THEME.neutral.white}
        anchorX="center"
        anchorY="middle"
      >
        会议室
      </Text>
    </group>
  )
}

// 资料室组件
const LibraryRoom = ({ position, size }: any) => {
  return (
    <group position={position}>
      {/* 资料室主体 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial 
          color={BLUE_THEME.neutral.gray}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* 书架 */}
      {[-3, 0, 3].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 4, 0.5]} />
            <meshStandardMaterial color={BLUE_THEME.primary.dark} />
          </mesh>
          
          {/* 书籍 */}
          {Array.from({ length: 6 }).map((_, j) => (
            <mesh 
              key={j} 
              position={[0, 1 - j * 0.6, 0.3]} 
              castShadow
            >
              <boxGeometry args={[1.8, 0.4, 0.3]} />
              <meshStandardMaterial 
                color={[BLUE_THEME.primary.main, BLUE_THEME.secondary.main, BLUE_THEME.accent.main][j % 3]}
              />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* 标识 */}
      <Text
        position={[0, size.height/2 + 0.5, size.depth/2 + 0.1]}
        fontSize={0.4}
        color={BLUE_THEME.neutral.white}
        anchorX="center"
        anchorY="middle"
      >
        资料室
      </Text>
      
      {/* 技能提升系统标识 */}
      <Html position={[0, size.height/2 + 1.5, 0]} center>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: '10px',
          border: `3px solid ${BLUE_THEME.academic.gold}`,
          fontSize: '14px',
          color: BLUE_THEME.primary.dark,
          fontWeight: 'bold',
          textAlign: 'center',
          minWidth: '200px'
        }}>
          🎯 技能提升系统
          <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'normal' }}>
            上传资料 → 自动分发 → 代理学习 → 能力提升
          </div>
        </div>
      </Html>
    </group>
  )
}

// 主场景组件
export default function OfficeScene() {
  const floorRef = useRef<Mesh>(null)
  
  // 办公室布局配置
  const officeLayout = {
    // 指挥中心 - 小龙虾办公室
    commandCenter: {
      position: [-15, 0, 0],
      size: { width: 8, height: 6, depth: 8 },
      name: '小龙虾',
      title: '指挥中心',
      avatar: '🦞',
      color: BLUE_THEME.primary.dark,
      description: 'AI指挥中心，负责整体协调和任务分配'
    },
    
    // 决策中心 - 刘小浏办公室
    decisionCenter: {
      position: [15, 0, 0],
      size: { width: 8, height: 6, depth: 8 },
      name: '刘小浏',
      title: '决策中心',
      avatar: '🎓',
      color: BLUE_THEME.secondary.dark,
      description: '学术决策中心，负责研究方向和质量把控'
    },
    
    // 开放办公区配置
    openOffice: {
      position: [0, 0, 0] as [number, number, number],
      size: { width: 25, height: 4, depth: 12 }
    },
    
    // 会议室
    meetingRoom: {
      position: [-8, 0, -18],
      size: { width: 10, height: 5, depth: 8 }
    },
    
    // 资料室
    library: {
      position: [8, 0, -18],
      size: { width: 12, height: 6, depth: 10 }
    }
  }
  
  // 6个子代理配置
  const agents = [
    { id: 'wenyuan', name: '文渊', role: '文献搜集和文献综述', avatar: '📚', position: [-8, 0, 0] },
    { id: 'wengou', name: '文构', role: '论文框架和理论构建', avatar: '🏗️', position: [-4, 0, 0] },
    { id: 'wenxin', name: '文心', role: '论文内容撰写与修改', avatar: '✍️', position: [0, 0, 0] },
    { id: 'wenxiao', name: '文校', role: '论文格式与模板校对', avatar: '✅', position: [4, 0, 0] },
    { id: 'wenshen', name: '文审', role: '模拟审稿专家与质控', avatar: '👁️', position: [8, 0, 0] },
    { id: 'wenkan', name: '文刊', role: '期刊整理与投稿评价', avatar: '📰', position: [12, 0, 0] }
  ]

  return (
    <group>
      {/* 学术蓝色环境光 */}
      <ambientLight intensity={0.5} color={BLUE_THEME.secondary.lighter} />
      
      {/* 主光源 */}
      <directionalLight
        position={[20, 30, 20]}
        intensity={1}
        color={BLUE_THEME.accent.light}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* 辅助光源 */}
      <pointLight position={[-10, 20, -10]} intensity={0.4} color={BLUE_THEME.academic.gold} />
      <pointLight position={[10, 20, 10]} intensity={0.3} color={BLUE_THEME.secondary.light} />
      
      {/* 地板 */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial 
          color={BLUE_THEME.primary.dark}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* 地板网格 */}
      <gridHelper args={[60, 40, BLUE_THEME.secondary.main, BLUE_THEME.secondary.light]} position={[0, -1.99, 0]} />
      
      {/* 墙壁 */}
      <group>
        {/* 后墙 */}
        <mesh position={[0, 8, -25]} castShadow receiveShadow>
          <boxGeometry args={[60, 20, 1]} />
          <meshStandardMaterial color={BLUE_THEME.primary.main} />
        </mesh>
        
        {/* 侧墙 */}
        <mesh position={[-30, 8, 0]} rotation={[0, Math.PI/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[40, 20, 1]} />
          <meshStandardMaterial color={BLUE_THEME.primary.light} />
        </mesh>
        
        <mesh position={[30, 8, 0]} rotation={[0, Math.PI/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[40, 20, 1]} />
          <meshStandardMaterial color={BLUE_THEME.primary.light} />
        </mesh>
      </group>
      
      {/* 办公室 */}
      <OfficeRoom {...officeLayout.commandCenter} />
      <OfficeRoom {...officeLayout.decisionCenter} />
      
      {/* 开放办公区 - 6个子代理 */}
      <group position={officeLayout.openOffice.position}>
        {/* 办公区地面 */}
        <mesh position={[0, -1, 0]} receiveShadow>
          <boxGeometry args={[officeLayout.openOffice.size.width, 0.2, officeLayout.openOffice.size.depth]} />
          <meshStandardMaterial color={BLUE_THEME.neutral.light} />
        </mesh>
        
        {/* 6个子代理工位 */}
        {agents.map((agent) => (
          <AgentWorkstation 
            key={agent.id}
            agent={agent}
            position={agent.position}
          />
        ))}
        
        {/* 办公区标识 */}
        <Text
          position={[0, officeLayout.openOffice.size.height/2 + 1, officeLayout.openOffice.size.depth/2 + 0.5]}
          fontSize={0.6}
          color={BLUE_THEME.neutral.white}
          anchorX="center"
          anchorY="middle"
        >
          学术代理办公区
        </Text>
      </group>
      
      {/* 会议室 */}
      <MeetingRoom {...officeLayout.meetingRoom} />
      
      {/* 资料室 */}
      <LibraryRoom {...officeLayout.library} />
      
      {/* 学术集中营对联 */}
      <group position={[0, 15, -24]}>
        {/* 横批 */}
        <Text
          position={[0, 2, 0]}
          fontSize={1}
          color={BLUE_THEME.academic.gold}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          学术集中营
        </Text>
        
        {/* 左联 */}
        <Text
          position={[-12, 0, 0]}
          fontSize={0.6}
          color={BLUE_THEME.neutral.white}
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, 0]}
          textAlign="center"
        >
          智慧创新\n交叉融合\nAI赋能\n学术突破
        </Text>
        
        {/* 右联 */}
        <Text
          position={[12, 0, 0]}
          fontSize={0.6}
          color={BLUE_THEME.neutral.white}
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, 0]}
          textAlign="center"
        >
          管理科学\n人工智能\n数智病理\n医工管融
        </Text>
      </group>
      
      {/* 场景说明 */}
      <Html position={[0, 20, 0]} center>
        <div style={{
          background: 'rgba(26, 35, 126, 0.9)',
          padding: '20px',
          borderRadius: '15px',
          border: `3px solid ${BLUE_THEME.academic.gold}`,
          color: 'white',
          fontSize: '16px',
          textAlign: 'center',
          minWidth: '400px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
            🦞📚 学术集中营 · 3D沉浸式办公室
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            包含：指挥中心、决策中心、6子代理办公区、会议室、资料室<br/>
            支持：走动交流、任务分配、技能提升、外网访问
          </div>
        </div>
      </Html>
    </group>
  )
}