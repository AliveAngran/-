
import React, { useState, useEffect } from 'react';
import { Slider, Button, TechText } from './UI';
import { Layers, Scan, Zap, Grid, Fingerprint, Image as ImageIcon, ArrowRight, Activity, Cpu, Sparkles } from 'lucide-react';

// --- 1. Introduction: Dimension Portal ---
export const DimensionPortal = () => {
  const [active, setActive] = useState(false);
  
  return (
    <div className="h-64 relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer" onClick={() => setActive(!active)}>
      <img 
        src="https://picsum.photos/800/400" 
        alt="Reality" 
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${active ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
      />
      <div className={`absolute inset-0 bg-black flex items-center justify-center transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
         {/* Representing Latent Noise */}
         <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 brightness-150 contrast-150 scale-150 animate-pulse"></div>
         <div className="absolute grid grid-cols-8 grid-rows-4 gap-2 w-3/4 h-3/4">
            {Array.from({length: 32}).map((_, i) => (
                <div key={i} className="bg-green-500/20 border border-green-500/30 rounded-sm animate-pulse" style={{animationDelay: `${i * 0.05}s`}} />
            ))}
         </div>
      </div>
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur px-3 py-1 rounded text-xs font-mono text-white/70 border border-white/10 pointer-events-none">
        {active ? 'LATENT SPACE (潜空间)' : 'PIXEL SPACE (像素空间)'}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <span className="bg-black/50 px-4 py-2 rounded-full text-white/80 backdrop-blur-md text-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100 border border-white/20">
            {active ? '点击返回现实视图' : '点击切换至机器视觉'}
         </span>
      </div>
    </div>
  );
};

// --- 2. VAE Encoder: Compression ---
export const VAEEncoderViz = () => {
  const [compression, setCompression] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center h-48 gap-8 relative">
        {/* Pixel Image */}
        <div 
            className="w-40 h-40 bg-cover bg-center rounded-lg shadow-lg transition-all duration-500 relative"
            style={{ 
                backgroundImage: 'url(https://picsum.photos/400/400)',
                transform: `scale(${1 - compression * 0.4})`,
                opacity: 1 - compression * 0.5
            }}
        >
            <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-zinc-500 font-mono">512x512px</div>
        </div>
        
        {/* The Encoder Arrow */}
        <div className="flex flex-col items-center justify-center text-zinc-500">
           <ArrowRight className={`w-8 h-8 transition-all duration-300 ${compression > 0.5 ? 'text-primary scale-125' : ''}`} />
           <span className="text-[10px] font-mono mt-1 text-primary">Encoder</span>
        </div>

        {/* Latent Block */}
        <div 
            className="w-16 h-16 rounded shadow-[0_0_20px_rgba(139,92,246,0.5)] bg-zinc-900 border border-primary transition-all duration-500 flex items-center justify-center overflow-hidden relative"
            style={{ 
                transform: `scale(${0.5 + compression * 0.5})`,
                opacity: 0.2 + compression * 0.8
            }}
        >
            <div className="grid grid-cols-4 gap-0.5 w-full h-full p-1 opacity-80">
                 {Array.from({length: 16}).map((_,i) => <div key={i} className="bg-primary/60 rounded-[1px]" />)}
            </div>
            <div className={`absolute -bottom-8 left-0 right-0 text-center text-xs text-primary font-mono w-32 -ml-8 transition-opacity ${compression > 0.2 ? 'opacity-100' : 'opacity-0'}`}>64x64px</div>
        </div>
      </div>
      <Slider min={0} max={1} step={0.01} value={compression} onChange={setCompression} label="压缩程度 (Simulated)" />
      <p className="text-xs text-zinc-500 text-center bg-zinc-900/50 p-2 rounded">
        拖动滑块体验：<span className="text-white">高维像素</span> 如何被“折叠”进 <span className="text-primary">低维潜空间</span>。
      </p>
    </div>
  );
};

// --- 3. Latent Space: Navigation ---
export const LatentNavViz = () => {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  return (
    <div 
        className="w-full h-64 bg-zinc-900 rounded-xl relative overflow-hidden cursor-crosshair border border-white/5 shadow-inner"
        onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setPos({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100
            });
        }}
    >
        {/* Abstract Gradients representing concepts */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-purple-900/40" />
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-orange-500/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-500/10 to-transparent" />
        
        {/* Dynamic Concept Label */}
        <div className="absolute top-4 left-4 text-xs font-mono text-white/50 pointer-events-none bg-black/50 p-1 rounded backdrop-blur">
            Coords: [{Math.round(pos.x)}, {Math.round(pos.y)}, ...]
        </div>

        <div className="absolute bottom-4 left-4 text-xs font-mono text-orange-300 pointer-events-none transition-opacity duration-300" style={{ opacity: 1 - pos.x/100 }}>
            概念区域: [猫]
        </div>
        <div className="absolute top-4 right-4 text-xs font-mono text-cyan-300 pointer-events-none transition-opacity duration-300" style={{ opacity: pos.x/100 }}>
            概念区域: [赛博朋克]
        </div>

        {/* Cursor/Vector */}
        <div 
            className="absolute w-6 h-6 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_white] pointer-events-none flex items-center justify-center transition-transform duration-75"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
            <div className="w-1 h-1 bg-white rounded-full" />
        </div>
        <div className="absolute bottom-2 right-2 text-[10px] text-zinc-600 font-mono">
            请在区域内移动鼠标寻找潜变量
        </div>
    </div>
  );
};

// --- 4. Forward Diffusion: Adding Noise ---
export const ForwardDiffusionViz = () => {
  const [timestep, setTimestep] = useState(0); // 0 to 1000

  return (
    <div className="flex flex-col gap-4">
      <div className="h-64 w-full relative rounded-lg overflow-hidden bg-zinc-950 flex items-center justify-center border border-white/10">
        {/* Base Image */}
        <img 
            src="https://picsum.photos/id/237/800/600" 
            alt="Dog"
            className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Noise Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: timestep / 1000 }}>
            <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch"/>
                <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" opacity={0.8 + (timestep/2000)}/>
        </svg>
        {/* Overlay to blend noise to gray/white eventually */}
        <div className="absolute inset-0 bg-zinc-400 mix-blend-overlay" style={{ opacity: timestep / 1000 }} />
      </div>
      
      <Slider 
        min={0} max={1000} value={timestep} onChange={setTimestep} 
        label={`时间步 (Timestep) t=${Math.floor(timestep)}`} 
      />
      <div className="flex justify-between text-xs text-zinc-500 font-mono">
        <span>t=0 (原始数据)</span>
        <span className="text-center">扩散过程 (熵增) &rarr;</span>
        <span>t=1000 (纯高斯噪声)</span>
      </div>
    </div>
  );
};

// --- 5 & 6. Text Encoder & Cross Attention ---
export const AttentionViz = () => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const prompt = ["一个", "未来主义", "机器人", "在画", "日落"];
  
  // Fake attention maps for demonstration
  const getOpacity = (idx: number, word: string | null) => {
    if (!word) return 0.2;
    // Simple mock logic for visualization
    if (word === '机器人' && (idx === 5 || idx === 6 || idx === 9 || idx === 10)) return 1;
    if (word === '日落' && (idx < 4)) return 1;
    if (word === '未来主义' && (idx === 0 || idx === 1 || idx === 4 || idx === 5)) return 0.8;
    return 0.1;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="text-xs text-zinc-400 font-mono uppercase">Prompt 输入 (Text Encoder 输出)</div>
        <div className="flex flex-wrap gap-2">
            {prompt.map((word) => (
                <span 
                    key={word}
                    onMouseEnter={() => setHoveredWord(word)}
                    onMouseLeave={() => setHoveredWord(null)}
                    className={`cursor-pointer px-3 py-1.5 rounded border transition-all duration-300 text-sm font-medium
                        ${hoveredWord === word 
                            ? 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_10px_rgba(6,182,212,0.3)] scale-105' 
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'}
                    `}
                >
                    {word}
                </span>
            ))}
        </div>
      </div>

      <div className="relative">
          <div className="absolute -top-6 right-0 text-xs text-zinc-500 font-mono">Attention Map (注意力热力图)</div>
          <div className="w-full aspect-video grid grid-cols-4 gap-1 p-2 bg-zinc-900 rounded-lg border border-white/10">
            {Array.from({ length: 16 }).map((_, i) => (
                <div 
                    key={i}
                    className="rounded bg-primary transition-all duration-300 border border-white/5"
                    style={{ 
                        opacity: getOpacity(i, hoveredWord),
                        transform: hoveredWord ? 'scale(0.95)' : 'scale(1)'
                    }}
                />
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-2 text-center">
            <span className="text-secondary font-bold">试一试：</span> 鼠标悬停上方的词语，观察模型在潜空间中“关注”哪个区域。
          </p>
      </div>
    </div>
  );
};

// --- 7. UNET Flow ---
export const UnetViz = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
        setStep(s => (s + 1) % 4);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-56 relative flex items-center justify-between px-6 bg-zinc-900/50 rounded-lg border border-white/5">
        {/* Downsample */}
        <div className="flex flex-col items-center gap-2">
            <div className={`w-14 h-28 border-2 border-zinc-700 rounded bg-zinc-800 flex flex-col items-center justify-center transition-colors ${step === 0 ? 'border-primary shadow-[0_0_15px_rgba(139,92,246,0.5)] bg-primary/10' : ''}`}>
                <span className="text-[10px] text-zinc-400 font-mono">Encoder</span>
                <span className="text-[8px] text-zinc-600">Down</span>
            </div>
            <span className={`text-[10px] transition-colors ${step === 0 ? 'text-primary' : 'text-zinc-600'}`}>特征提取</span>
        </div>
        
        {/* Connection Lines */}
        <div className="flex-1 h-1 bg-zinc-800 relative mx-2">
            <div className={`absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-linear w-full ${step === 1 ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-zinc-600">Time & Text Embeds</div>
        </div>

        {/* Middle/Bottleneck */}
        <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 border-2 border-zinc-700 rounded bg-zinc-800 flex items-center justify-center transition-colors ${step === 2 ? 'border-secondary shadow-[0_0_15px_rgba(6,182,212,0.5)] bg-secondary/20 scale-110' : ''}`}>
                <Zap size={16} className={step === 2 ? 'text-secondary' : 'text-zinc-600'} />
            </div>
            <span className={`text-[10px] transition-colors ${step === 2 ? 'text-secondary' : 'text-zinc-600'}`}>语义处理</span>
        </div>

        <div className="flex-1 h-1 bg-zinc-800 relative mx-2">
            <div className={`absolute top-0 left-0 h-full bg-secondary transition-all duration-1000 ease-linear w-full ${step === 3 ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Upsample */}
        <div className="flex flex-col items-center gap-2">
            <div className={`w-14 h-28 border-2 border-zinc-700 rounded bg-zinc-800 flex flex-col items-center justify-center transition-colors ${step === 3 ? 'border-secondary shadow-[0_0_15px_rgba(6,182,212,0.5)] bg-secondary/10' : ''}`}>
                <span className="text-[10px] text-zinc-400 font-mono">Decoder</span>
                <span className="text-[8px] text-zinc-600">Up</span>
            </div>
            <span className={`text-[10px] transition-colors ${step === 3 ? 'text-secondary' : 'text-zinc-600'}`}>噪声预测</span>
        </div>
        
        {/* Skip Connections (Abstract) */}
        <div className="absolute top-8 left-[20%] right-[20%] h-px border-t border-dashed border-zinc-600/30" />
        <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] text-zinc-600 font-mono bg-zinc-900 px-1">Skip Connections (Concat)</span>
    </div>
  );
};

// --- 8 & 9. Img2Img Strength & Reverse Diffusion ---
export const Img2ImgViz = () => {
    const [strength, setStrength] = useState(0.65);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Simulate the noise level visually
    const noiseOpacity = Math.min(1, strength * 1.2);
    
    const resultBlur = isProcessing ? 'blur(4px)' : 'blur(0px)';
    // Simplified logic for demo text
    const resultContent = strength > 0.75 ? '幻觉/全新构图' : strength < 0.35 ? '微调/原图保留' : '平衡/风格化';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-56">
                {/* Input */}
                <div className="relative rounded-lg overflow-hidden group border border-white/10">
                    <img src="https://picsum.photos/id/10/400/400" className="w-full h-full object-cover opacity-60" alt="Input" />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono border border-white/10">参考原图</div>
                </div>

                {/* Latent/Noise State - The middle step */}
                <div className="relative rounded-lg overflow-hidden border border-white/10 flex items-center justify-center bg-black">
                     <img 
                        src="https://picsum.photos/id/10/400/400" 
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-300" 
                        style={{ filter: `blur(${strength * 20}px) grayscale(100%)` }}
                        alt="Latent"
                     />
                     <div className="absolute inset-0 w-full h-full bg-noise opacity-50 z-10 pointer-events-none" 
                          style={{ 
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${noiseOpacity}'/%3E%3C/svg%3E")` 
                          }} 
                     />
                     <div className="z-20 text-center p-2">
                        <span className="text-xs font-mono text-primary bg-black/80 px-2 py-1 rounded border border-primary/30 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                            开始去噪点: t = {Math.round(strength * 1000)}
                        </span>
                     </div>
                </div>

                {/* Output */}
                <div className="relative rounded-lg overflow-hidden border border-white/10">
                    <img 
                        src="https://picsum.photos/id/15/400/400" // Different image to simulate "creation"
                        className="w-full h-full object-cover transition-all duration-1000"
                        style={{ filter: isProcessing ? `blur(10px) brightness(0.5)` : 'none' }}
                        alt="Output"
                    />
                    <div className="absolute bottom-2 left-2 bg-secondary/20 backdrop-blur border border-secondary/30 text-secondary px-2 py-1 rounded text-xs font-mono">
                        {resultContent}
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <Slider 
                    min={0} max={1} step={0.05} 
                    value={strength} 
                    onChange={(v) => { setStrength(v); setIsProcessing(true); setTimeout(() => setIsProcessing(false), 500); }} 
                    label="重绘幅度 (Denoising Strength)" 
                />
                <div className="mt-3 text-xs text-zinc-400 leading-relaxed grid grid-cols-2 gap-4">
                    <div className={`p-2 rounded transition-colors ${strength < 0.4 ? 'bg-white/5 border border-white/10' : ''}`}>
                         <strong className="text-white block mb-1">低幅度 (&lt;0.4)</strong>
                         保留大部分原始像素。AI 只能在细节上修修补补，适合高清修复或微调。
                    </div>
                    <div className={`p-2 rounded transition-colors ${strength > 0.6 ? 'bg-primary/10 border border-primary/20' : ''}`}>
                         <strong className="text-primary block mb-1">高幅度 (&gt;0.6)</strong>
                         大部分画面被噪声覆盖。AI 需要重新“脑补”画面，产生巨大的变化。
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 10. Decoder Viz ---
export const DecoderViz = () => {
    const [decoded, setDecoded] = useState(false);

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-64 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                    src="https://picsum.photos/id/50/600/600" 
                    alt="Result"
                    className={`w-full h-full object-cover transition-all duration-[2000ms] ease-out ${decoded ? 'blur-0 scale-100 saturate-100' : 'blur-xl scale-110 saturate-0'}`}
                />
                
                {/* Scanning line effect */}
                {!decoded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                         <div className="text-primary font-mono text-sm animate-pulse mb-2">LATENT TENSOR</div>
                         <div className="w-16 h-16 grid grid-cols-4 gap-1 opacity-50">
                            {Array.from({length: 16}).map((_, i) => <div key={i} className="bg-primary rounded-[1px] animate-pulse" style={{animationDelay: `${i*0.1}s`}} />)}
                         </div>
                    </div>
                )}
            </div>

            <Button onClick={() => setDecoded(!decoded)} active={decoded}>
                 {decoded ? <><Sparkles size={16} /> 像素重构完成 (Pixel Space)</> : <><Cpu size={16} /> 启动 VAE 解码器 (D)</>}
            </Button>
            
            <p className="text-xs text-zinc-500 max-w-md text-center bg-zinc-900/50 p-3 rounded">
                这是“解压缩”过程。计算机终于把那一堆人类看不懂的数学矩阵，翻译回了我们可以欣赏的图片。
            </p>
        </div>
    );
};