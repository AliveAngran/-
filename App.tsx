
import React, { useState, useRef, useEffect } from 'react';
import { SectionData, StepType, AppMode } from './types';
import { Card, TechText, Badge, Button } from './components/UI';
import { SimulationGame } from './components/SimulationGame';
import { 
  DimensionPortal, 
  VAEEncoderViz, 
  LatentNavViz, 
  ForwardDiffusionViz, 
  AttentionViz, 
  UnetViz,
  Img2ImgViz,
  DecoderViz 
} from './components/InteractiveModules';
import { BookOpen, Layers, Terminal, Activity, ArrowDown, Sparkles, Cpu, Gamepad2, Link2, GitCommit } from 'lucide-react';

const SECTIONS: SectionData[] = [
  {
    id: StepType.INTRODUCTION,
    title: "维度之门",
    subtitle: "为什么要逃离像素空间？",
    description: "想象一下，如果要你在 512x512 的画布上作画，你需要控制 26万个像素点 (R,G,B)。这对计算机来说计算量太恐怖了。所以，LDM 的第一步思想就是：我们不做“像素层面”的计算，太慢了。我们要去一个更抽象、更精简的世界。",
    academicNote: "Pixel Space (像素空间) 维度极高且包含大量感知冗余。直接在像素空间进行扩散模型训练（如 DALL-E 1）计算成本极其昂贵。",
    logicLink: "既然像素空间太拥挤，我们去哪？"
  },
  {
    id: StepType.VAE_ENCODER,
    title: "打包行李 (压缩)",
    subtitle: "VAE Encoder (E)",
    description: "我们在进入新世界前，必须先“打包行李”。VAE 编码器就像一个超级压缩软件，它把图片中人类肉眼不太关注的高频细节（比如树叶的微小噪点）丢掉，只保留最重要的“语义信息”（比如这是一棵树）。",
    academicNote: "感知压缩 (Perceptual Compression)：将图像 x 映射到潜在编码 z = E(x)。我们将空间维度压缩了 8 倍 (f=8)，数据量减少了 48 倍，但保留了语义本质。",
    logicLink: "压缩完了，我们现在身处何方？"
  },
  {
    id: StepType.LATENT_SPACE,
    title: "潜空间 (概念世界)",
    subtitle: "Latent Space / Manifold",
    description: "欢迎来到“潜空间”。这里不再有红绿蓝的像素点，只有数学构成的“概念”。在这里，坐标轴代表特征。往左走一点可能是“猫”，往右走一点可能是“狗”。在这里做计算，比在像素空间快几十倍。",
    academicNote: "流形 (Manifold)：这是一个低维、紧凑且数据分布连续的空间。扩散模型的扩散与去噪过程，实际上完全是在这个潜空间 (z-space) 内进行的，而不是在原图上。",
    logicLink: "在这个世界里，我们要怎么创造新东西？"
  },
  {
    id: StepType.FORWARD_DIFFUSION,
    title: "通过毁灭来学习",
    subtitle: "Forward Diffusion (Noise Injection)",
    description: "想要学会修文物，先要学会怎么砸文物。我们在潜空间里，把一张清晰的“概念图”不断加上雪花点（高斯噪声），直到它变成一团完全随机的乱码。如果AI能看懂这个破坏过程，它就能学会怎么反过来“复原”它。",
    academicNote: "前向过程 (Forward Process)：这是一个固定的马尔可夫链 q(z_t | z_{t-1})，逐步向数据添加高斯噪声，直到分布趋近于标准正态分布 N(0, I)。",
    logicLink: "既然是一团乱码，我们怎么控制它变成猫而不是狗？"
  },
  {
    id: StepType.TEXT_ENCODER,
    title: "翻译官 (CLIP)",
    subtitle: "Text Conditioning",
    description: "计算机听不懂“赛博朋克风格的猫”这句话。我们需要一个翻译官（Text Encoder），把人类的语言翻译成一串计算机能听懂的数学向量。这个向量就像是给 AI 的“施工图纸”。",
    academicNote: "条件机制 (Conditioning)：利用预训练模型（如 CLIP ViT-L/14）将文本 prompt 转化为 embedding 序列。这些向量并不直接改变噪声，而是作为引导信号。",
    logicLink: "有了图纸（文字）和材料（噪声），谁来干活？"
  },
  {
    id: StepType.CROSS_ATTENTION,
    title: "指挥棒 (Attention)",
    subtitle: "Cross-Attention Mechanism",
    description: "这就是“听话”的关键。U-Net 模型在修图的时候，会不断地查看你的文字向量。当它修到左上角时，Cross-Attention 机制会告诉它：“嘿，这里看 Prompt 的第3个词，应该是蓝色的天空。”",
    academicNote: "Spatial Transformer：通过 Attention(Q, K, V) 将文本特征注入到 U-Net 的空间特征中。Q 是图像特征，K/V 是文本特征。这实现了像素级位置与语义的解耦。",
    logicLink: "谁是那个真正干苦力修图的工人？"
  },
  {
    id: StepType.UNET_CORE,
    title: "预测引擎 (U-Net)",
    subtitle: "The Noise Predictor",
    description: "U-Net 是整个系统的核心打工仔。它的工作极其枯燥但重要：给它看一张带噪声的图，它要预测出“这张图里哪里是噪声，哪里是原本的内容”。只要能精准预测噪声，我们减去噪声，剩下的就是画了。",
    academicNote: "U-Net 结构：包含下采样（ResNet blocks）和上采样层，中间通过 Skip Connections 连接。它的输入是噪声图 z_t 和时间步 t，输出是预测的噪声 ε_theta。",
    logicLink: "如果我不想凭空创造，而是想改图（图生图）呢？"
  },
  {
    id: StepType.IMG2IMG_STRENGTH,
    title: "起跑线 (Strength)",
    subtitle: "Init Latent & Denoising Strength",
    description: "文生图是从“纯乱码”开始修。而图生图，是把你的原图先加一点点噪（变得模糊一点），然后让 AI 从这个“半模糊”的状态开始修。重绘幅度（Strength）就是决定我们把原图破坏到什么程度再开始修。",
    academicNote: "SDE Edit / Img2Img：我们不再从 T=1000 开始采样，而是先将原图加噪到 T_start = Strength * T，然后从 T_start 开始逆向去噪。Strength 越大，保留的原始结构越少。",
    logicLink: "准备工作就绪，开始执行修复循环。"
  },
  {
    id: StepType.REVERSE_DIFFUSION,
    title: "逆向雕刻",
    subtitle: "Reverse Process (Sampling)",
    description: "奇迹发生的时刻。AI 从一团混沌中，依据你的文字指挥，一步步减去预测的噪声。像米开朗基罗从石头中雕刻出大卫像一样，图像的轮廓、纹理逐渐在潜空间中清晰浮现。",
    academicNote: "采样 (Sampling)：从 z_T 开始，利用 U-Net 预测的梯度，迭代计算 z_{t-1}。常用的采样器如 DDIM、Euler a 决定了每一步如何迈进以加速收敛。",
    logicLink: "修好了，但它还在那个抽象的潜空间里，人类看不懂。"
  },
  {
    id: StepType.VAE_DECODER,
    title: "冲印照片",
    subtitle: "VAE Decoder (D)",
    description: "最后一步。我们将修复完美、充满细节的“潜空间矩阵”交给 VAE 解码器。它负责把这些数学概念“翻译”回我们可以看到的 RGB 像素。至此，一张 AI 绘画诞生了。",
    academicNote: "像素重构：x_recon = D(z)。解码器不仅是恢复尺寸，更重要的是恢复高频细节和纹理，消除压缩带来的块状伪影。",
    logicLink: "流程结束。你已掌握图生图完整闭环。"
  }
];

const LogicFlowConnector: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center py-8 opacity-80 group">
        <div className="h-8 w-px bg-gradient-to-b from-transparent to-zinc-600"></div>
        <div className="border border-zinc-700 bg-zinc-900/80 backdrop-blur px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transform transition-transform group-hover:scale-105">
            <div className="bg-zinc-800 p-1.5 rounded-full">
                <GitCommit size={14} className="text-zinc-400" />
            </div>
            <span className="text-xs font-mono text-zinc-300">逻辑链条: {text}</span>
        </div>
        <div className="h-8 w-px bg-gradient-to-b from-zinc-600 to-transparent"></div>
    </div>
);

const SectionLayout: React.FC<{ data: SectionData; index: number; children: React.ReactNode }> = ({ data, index, children }) => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-4 md:p-12 relative">
      
      {/* Background Index Number */}
      <div className="absolute top-20 left-4 md:left-10 text-[6rem] md:text-[10rem] font-bold text-white/[0.02] select-none pointer-events-none font-mono z-0">
        {String(index + 1).padStart(2, '0')}
      </div>
      
      {/* Logic Link Connector from Previous Section */}
      {data.logicLink && index > 0 && (
          <div className="absolute top-0 left-0 right-0 flex justify-center -mt-16 z-20">
              <LogicFlowConnector text={data.logicLink} />
          </div>
      )}
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-center z-10">
        {/* Text Content */}
        <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
                 <Badge>{data.subtitle}</Badge>
                 <div className="h-px bg-zinc-800 flex-1"></div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 leading-tight">
                {data.title}
            </h2>
            
            <div className="prose prose-invert">
                <p className="text-lg text-zinc-300 leading-relaxed font-light border-l-2 border-white/10 pl-4">
                    {data.description}
                </p>
            </div>
          </div>

          <div className="bg-zinc-950/40 rounded-xl overflow-hidden border border-white/5">
            <div className="bg-white/5 px-4 py-2 flex items-center gap-2 border-b border-white/5">
              <BookOpen size={14} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Deep Dive / 学术原理解析</span>
            </div>
            <div className="p-4">
                <p className="text-sm text-zinc-500 font-mono leading-relaxed text-justify">
                {data.academicNote}
                </p>
            </div>
          </div>
        </div>

        {/* Interactive Visualizer */}
        <div className="lg:col-span-7 w-full order-1 lg:order-2">
           <div className="relative">
                {/* Decoration */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl opacity-20 pointer-events-none" />
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                    {children}
                </Card>
           </div>
        </div>
      </div>
      
      {index < SECTIONS.length - 1 && (
        <div className="absolute bottom-4 animate-bounce text-zinc-700">
          <ArrowDown size={20} />
        </div>
      )}
    </section>
  );
};

const Header = () => (
  <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center px-6 justify-between transition-all duration-300">
    <div className="flex items-center gap-2 group cursor-pointer">
        <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Activity size={18} className="text-primary" />
        </div>
        <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-none text-white">Latent Diffusion <span className="text-zinc-500 font-light">Explorer</span></span>
            <span className="text-[10px] text-zinc-600 font-mono leading-none mt-1">INTERACTIVE PAPER REVIEW</span>
        </div>
    </div>
    <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> ONLINE</span>
            <span className="w-px h-3 bg-zinc-800"></span>
            <span className="text-zinc-400">CVPR 2022</span>
        </div>
    </div>
  </header>
);

const Hero = () => (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-background to-background">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="z-10 text-center space-y-8 max-w-5xl px-4 relative">
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 backdrop-blur-sm mb-6 hover:bg-white/10 transition-colors cursor-default">
                <Terminal size={14} className="text-secondary" />
                <span className="text-xs font-mono text-zinc-300 tracking-wider">SYSTEM.INIT(LDM_V1.4)</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-tight">
                图生图 <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary animate-pulse-slow">全链路深度解析</span>
            </h1>
            
            <div className="flex flex-col items-center gap-6">
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                    专为 <TechText>人类理解</TechText> 设计的交互式指南。
                    <br/>
                    抛弃枯燥的公式，用指尖触碰感知的边界，彻底搞懂 <span className="text-white font-medium">Latent Diffusion Models</span> 的每一个齿轮。
                </p>
                
                <div className="flex gap-4 mt-4">
                     <div className="px-4 py-2 rounded bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-500">
                        10 交互模块
                     </div>
                     <div className="px-4 py-2 rounded bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-500">
                        模拟器实战
                     </div>
                </div>
            </div>

            <div className="pt-16 animate-bounce opacity-50">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 tracking-[0.2em]">SCROLL TO EXPLORE</span>
                    <ArrowDown size={16} className="text-zinc-500" />
                </div>
            </div>
        </div>
    </section>
);

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.LEARNING);

  // Mapping steps to visualizers
  const renderVisualizer = (id: StepType) => {
    switch (id) {
        case StepType.INTRODUCTION: return <DimensionPortal />;
        case StepType.VAE_ENCODER: return <VAEEncoderViz />;
        case StepType.LATENT_SPACE: return <LatentNavViz />;
        case StepType.FORWARD_DIFFUSION: return <ForwardDiffusionViz />;
        case StepType.TEXT_ENCODER: return <AttentionViz />; 
        case StepType.CROSS_ATTENTION: return <AttentionViz />; // Reusing viz but context is different
        case StepType.UNET_CORE: return <UnetViz />;
        case StepType.IMG2IMG_STRENGTH: return <Img2ImgViz />;
        case StepType.REVERSE_DIFFUSION: return (
             <div className="flex flex-col items-center justify-center h-64 gap-6">
                 <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                     <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-secondary to-transparent w-1/2 animate-[shimmer_2s_infinite]" />
                 </div>
                 <div className="grid grid-cols-5 gap-3 opacity-50">
                    {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="w-12 h-12 bg-zinc-800 rounded border border-white/5 animate-pulse flex items-center justify-center" style={{animationDelay: `${i*0.2}s`}}>
                            <span className="text-[10px] font-mono text-zinc-600">{5-i}</span>
                        </div>
                    ))}
                 </div>
                 <p className="text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-1 rounded border border-white/5">
                    Iterative Denoising Loop: <span className="text-secondary">x_t-1 ← x_t - ε</span>
                 </p>
             </div>
        );
        case StepType.VAE_DECODER: return <DecoderViz />;
        default: return <div className="text-zinc-500">Module Loading...</div>;
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen selection:bg-primary/30 font-sans">
      <Header />
      
      {appMode === AppMode.LEARNING && (
        <>
            <Hero />
            <div className="relative z-10 pb-20">
                {SECTIONS.map((section, index) => (
                <SectionLayout key={section.id} data={section} index={index}>
                    {renderVisualizer(section.id)}
                </SectionLayout>
                ))}
            </div>

            {/* CTA for Simulation Mode */}
            <section className="py-32 flex flex-col items-center justify-center bg-zinc-950 border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                
                <Card className="max-w-4xl w-full text-center space-y-10 py-16 px-8 bg-black/40 border-primary/20 backdrop-blur-xl relative z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    
                    <div className="flex justify-center">
                        <div className="p-6 rounded-full bg-primary/5 border border-primary/20 animate-pulse-slow shadow-[0_0_60px_rgba(139,92,246,0.15)] relative">
                            <Gamepad2 size={64} className="text-primary relative z-10" />
                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">准备好实战部署了吗？</h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            所有的理论都只是为了这一刻。<br/>
                            现在，请进入 <TechText>Operator Mode (操作员模式)</TechText>。<br/>
                            你将作为 LDM 模型的“大脑”，亲自控制 VAE 压缩率、校准 CLIP 语义对齐，并精准掌控去噪时序。
                        </p>
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button 
                            onClick={() => setAppMode(AppMode.SIMULATION)} 
                            className="text-lg px-10 py-5 bg-white text-black hover:bg-zinc-200 hover:text-black border-none font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
                        >
                            启动模拟器 / LAUNCH SIMULATION
                        </Button>
                    </div>
                    
                    <div className="pt-4 flex justify-center gap-8 text-xs font-mono text-zinc-600">
                        <span className="flex items-center gap-1"><CheckCircleIcon size={12}/> VAE READY</span>
                        <span className="flex items-center gap-1"><CheckCircleIcon size={12}/> UNET READY</span>
                        <span className="flex items-center gap-1"><CheckCircleIcon size={12}/> GPU CLUSTER ONLINE</span>
                    </div>
                </Card>
            </section>
        </>
      )}

      {appMode === AppMode.SIMULATION && (
          <SimulationGame onExit={() => setAppMode(AppMode.LEARNING)} />
      )}

      <footer className="py-20 text-center text-zinc-600 border-t border-white/5 bg-black">
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Activity size={16} className="text-zinc-500" />
            </div>
            <p className="font-mono text-sm tracking-widest uppercase opacity-70">Designed for Academic Clarity</p>
            <p className="text-xs max-w-md mx-auto leading-5 opacity-40">
                Visualizing "High-Resolution Image Synthesis with Latent Diffusion Models"<br/>
                Rombach et al. (CVPR 2022)
            </p>
        </div>
      </footer>
    </main>
  );
}

const CheckCircleIcon = ({size}:{size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
)