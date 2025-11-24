
import React, { useState } from 'react';
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
import { BookOpen, Activity, ArrowDown, GitCommit, Terminal, Gamepad2 } from 'lucide-react';

const SECTIONS: SectionData[] = [
  {
    id: StepType.INTRODUCTION,
    title: "第一章：逃离像素监狱",
    subtitle: "Why Latent Space?",
    description: "想象你要画一幅画。如果在“像素空间”工作，就像是用显微镜对着画布，一个点一个点地填色（RGB）。你要填满 512x512 个点，总共 26 万次操作！这太笨重了。我们需要一种方法，不再纠结于“这个点红不红”，而是去思考“这里是不是一只猫”。",
    academicNote: "Pixel Space (像素空间) 维度极高 (H x W x 3) 且包含大量感知冗余。直接在像素空间进行扩散模型训练（如 DALL-E 1）计算成本极其昂贵，且收敛缓慢。",
    logicLink: "既然直接画太累，我们得先把画布“变小”但“不失真”。",
    guide: "点击图片，感受从“宏观现实”穿越到“微观潜空间”的视角转换。"
  },
  {
    id: StepType.VAE_ENCODER,
    title: "第二章：信息的压缩打包",
    subtitle: "VAE Encoder (E)",
    description: "VAE 编码器就像一个经验丰富的打包员。它把一张巨大的高清照片，折叠、压缩，扔掉那些人类肉眼根本注意不到的微小噪点，最后打包成一个极小的“压缩饼干”（Latent Block）。现在，我们只需要处理原本 1/48 的数据量了！",
    academicNote: "感知压缩 (Perceptual Compression)：将图像 x 映射到潜在编码 z = E(x)。LDM 通常使用 f=8 的下采样率，将 512x512x3 的图像压缩为 64x64x4 的张量。",
    logicLink: "现在手里有了压缩包，我们要在这个新世界里建立坐标系。",
    guide: "拖动滑块，找到“体积最小”但“还能看清是啥”的平衡点。"
  },
  {
    id: StepType.LATENT_SPACE,
    title: "第三章：潜空间导航",
    subtitle: "Latent Manifold",
    description: "欢迎来到“潜空间”。这里是概念的海洋。在这里，每一个坐标点不再代表一个颜色，而是代表一种“含义”。坐标 (0,1) 可能是“毛茸茸”，坐标 (10,5) 可能是“金属质感”。我们生成图片的过程，其实就是在这个地图上寻找一个特定的坐标点。",
    academicNote: "流形 (Manifold)：数据在潜空间中分布在一个低维流形上。通过在流形上插值，我们可以实现从“猫”平滑过渡到“狗”的语义渐变。",
    logicLink: "有了地图，我们如何创造从未存在过的东西？答案是：先毁灭，再重生。",
    guide: "移动鼠标探索这个抽象空间，看看能不能找到“猫”和“赛博朋克”的概念交汇点。"
  },
  {
    id: StepType.FORWARD_DIFFUSION,
    title: "第四章：毁灭的艺术",
    subtitle: "Forward Diffusion (Noise Injection)",
    description: "这是反直觉的一步：为了学会画画，AI 先学会了毁画。我们把刚才那个完美的“压缩饼干”拿出来，不断地往上撒沙子（高斯噪声），直到它变成一团完全看不清的雪花点。如果 AI 能看懂这个“变废”的过程，它就能学会怎么“变回”去。",
    academicNote: "前向过程 (Forward Process)：这是一个固定的马尔可夫链。我们逐步向数据添加高斯噪声，直到数据分布趋近于标准正态分布 N(0, I)。这是训练数据的准备阶段。",
    logicLink: "面对一团雪花点，AI 怎么知道该把它复原成猫还是狗？这需要人类的指令。",
    guide: "拖动滑块，目睹一张清晰图像是如何被“熵增”吞噬成纯噪声的。"
  },
  {
    id: StepType.TEXT_ENCODER,
    title: "第五章：AI 的翻译官",
    subtitle: "CLIP Text Encoder",
    description: "你对 AI 说“画一只猫”。AI 其实听不懂英语。我们需要 CLIP 这个翻译官，把你这句话翻译成一串数学向量（Embedding）。这串向量就像是给 AI 建筑队的“施工图纸”，告诉它们：“别乱复原，按这个要求修！”",
    academicNote: "条件机制 (Conditioning)：利用预训练模型（如 CLIP ViT-L/14）将文本 prompt 转化为 embedding 序列。这些向量是后续 Cross-Attention 层的 Key 和 Value。",
    logicLink: "图纸（Prompt）有了，原材料（噪声）也有了，谁来干活？",
    guide: "鼠标悬停在关键词上，看看哪些词在“点亮”潜空间的不同区域。"
  },
  {
    id: StepType.CROSS_ATTENTION,
    title: "第六章：注意力的指挥棒",
    subtitle: "Cross-Attention",
    description: "这是最神奇的地方。当 AI 在去噪时，它不是瞎干。Cross-Attention 机制就像一个指挥官，不断提醒干活的 U-Net：“喂，现在你在修左上角，请看图纸第 1 个词‘蓝天’；现在修中间，看图纸第 3 个词‘猫’。”它把文字信息“注入”到了图像的每一个角落。",
    academicNote: "Spatial Transformer：通过 Attention(Q, K, V) 将文本特征注入到网络中。这实现了像素级位置与语义的解耦，是 LDM 能够精准控制画面的核心。",
    logicLink: "指挥官就位，现在轮到真正的工匠登场了。",
    guide: "观察热力图，理解 AI 是如何把“文字”贴到“图片”的特定位置上的。"
  },
  {
    id: StepType.UNET_CORE,
    title: "第七章：去噪工匠 U-Net",
    subtitle: "The Noise Predictor",
    description: "U-Net 是整个系统的核心引擎。它的工作极其枯燥：给它看一张带噪点的图，再给它看时间步 t，它要预测出“这张图里这一层沙子长什么样”。只要预测准了，我们把这层沙子减掉，画面就清晰了一点点。",
    academicNote: "U-Net 结构：包含下采样（ResNet blocks）和上采样层，中间通过 Skip Connections 连接。它的输入是噪声图 z_t，输出是预测的噪声 ε_theta。",
    logicLink: "如果我们不是从零开始，而是想修改一张现有的图呢？",
    guide: "观察 U-Net 的“压缩-处理-放大”过程，感受数据流的脉动。"
  },
  {
    id: StepType.IMG2IMG_STRENGTH,
    title: "第八章：图生图的奥秘",
    subtitle: "Denoising Strength",
    description: "图生图其实就是“作弊”。文生图是从“全瞎”开始摸索。而图生图，是我们先把原图弄得“半瞎”（加一点噪，Strength），然后把这个半成品交给 AI：“接着这个画！”。Strength 越高，AI 自由发挥的空间越大，原图保留越少。",
    academicNote: "SDE Edit / Img2Img：我们不再从 T=1000 开始采样，而是先将原图加噪到 T_start = Strength * T，然后从 T_start 开始逆向去噪。",
    logicLink: "所有准备就绪，开始见证奇迹的循环。",
    guide: "调节 Strength，看看是想让 AI 只是“修修图”，还是彻底“大改动”。"
  },
  {
    id: StepType.REVERSE_DIFFUSION,
    title: "第九章：逆向循环",
    subtitle: "Sampling Loop",
    description: "这是一场接力赛。AI 预测一次噪声 -> 减去噪声 -> 得到稍清晰的图 -> 再预测下一层噪声。这个循环通常要进行 20 到 50 次。像雕刻家一样，一刀刀剔除多余的石料（噪声），直到大卫像显露出来。",
    academicNote: "采样 (Sampling)：从 z_T 开始，迭代计算 z_{t-1}。LDM 的高效性在于这个过程是在 64x64 的潜空间进行的，速度极快。",
    logicLink: "图修好了，但它还是个看不懂的压缩包。",
    guide: "观察倒计时，理解去噪是一个“迭代”过程，而不是一蹴而就。"
  },
  {
    id: StepType.VAE_DECODER,
    title: "第十章：重返现实",
    subtitle: "VAE Decoder (D)",
    description: "最后一步，解压缩。我们把那个精修过的 64x64 潜空间矩阵，交给 VAE 解码器。它把数据“展开”，恢复细节，填补纹理。瞬间，一张 512x512 的精美画作诞生了。",
    academicNote: "像素重构：x_recon = D(z)。解码器负责将低维特征重构为高维像素，消除压缩带来的伪影。",
    logicLink: "恭喜，你已经在大脑中跑通了一次完整的 LDM。",
    guide: "点击解码，见证“马赛克”变“高清大图”的瞬间。"
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
      <div className="absolute top-20 left-4 md:left-10 text-[6rem] md:text-[10rem] font-bold text-white/[0.02] select-none pointer-events-none font-mono z-0">
        {String(index + 1).padStart(2, '0')}
      </div>
      
      {data.logicLink && index > 0 && (
          <div className="absolute top-0 left-0 right-0 flex justify-center -mt-16 z-20">
              <LogicFlowConnector text={data.logicLink} />
          </div>
      )}
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-center z-10">
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Deep Dive / 论文原理</span>
            </div>
            <div className="p-4">
                <p className="text-sm text-zinc-500 font-mono leading-relaxed text-justify">
                {data.academicNote}
                </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 w-full order-1 lg:order-2">
           <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl opacity-20 pointer-events-none" />
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                    {data.guide && (
                        <div className="mb-4 pb-4 border-b border-white/5">
                            <p className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                                <Terminal size={12} />
                                交互任务: {data.guide}
                            </p>
                        </div>
                    )}
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
            <span className="text-[10px] text-zinc-600 font-mono leading-none mt-1">INTERACTIVE LEARNING</span>
        </div>
    </div>
    <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> ONLINE</span>
        </div>
    </div>
  </header>
);

const Hero = () => (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-background to-background">
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
                    别再死记硬背公式了。
                    <br/>
                    用直觉去触摸 <TechText>潜空间</TechText>，用交互去理解 <TechText>扩散原理</TechText>。
                </p>
            </div>

            <div className="pt-16 animate-bounce opacity-50">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 tracking-[0.2em]">向下滚动开始学习</span>
                    <ArrowDown size={16} className="text-zinc-500" />
                </div>
            </div>
        </div>
    </section>
);

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.LEARNING);

  const renderVisualizer = (id: StepType) => {
    switch (id) {
        case StepType.INTRODUCTION: return <DimensionPortal />;
        case StepType.VAE_ENCODER: return <VAEEncoderViz />;
        case StepType.LATENT_SPACE: return <LatentNavViz />;
        case StepType.FORWARD_DIFFUSION: return <ForwardDiffusionViz />;
        case StepType.TEXT_ENCODER: return <AttentionViz />; 
        case StepType.CROSS_ATTENTION: return <AttentionViz />;
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
                    正在执行：预测噪声 -> 减去噪声 -> 得到更清晰图像
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
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">实战演练：操作员模式</h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            看懂了原理不代表会操作。<br/>
                            进入模拟器，亲自调整 <TechText>VAE 压缩率</TechText>，校准 <TechText>CLIP 语义向量</TechText>，并掌控 <TechText>U-Net 去噪</TechText> 的黄金时机。
                        </p>
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button 
                            onClick={() => setAppMode(AppMode.SIMULATION)} 
                            className="text-lg px-10 py-5 bg-white text-black hover:bg-zinc-200 hover:text-black border-none font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
                        >
                            启动 LDM 模拟器
                        </Button>
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
            <p className="font-mono text-sm tracking-widest uppercase opacity-70">Designed for Human Understanding</p>
            <p className="text-xs max-w-md mx-auto leading-5 opacity-40">
                Visualizing "High-Resolution Image Synthesis with Latent Diffusion Models"<br/>
                Rombach et al. (CVPR 2022)
            </p>
        </div>
      </footer>
    </main>
  );
}
