
import React, { useState, useEffect, useRef } from 'react';
import { GamePhase } from '../types';
import { Card, Button, Slider, TechText, ProgressBar, Badge } from './UI';
import { Cpu, Zap, Radio, CheckCircle, AlertTriangle, Layers, Play, RefreshCw, Maximize, ArrowRight, Activity, Terminal } from 'lucide-react';

// --- Game Logic Constants ---
const TARGET_COMPRESSION = 0.75; // The sweet spot for VAE (f=8)
const TARGET_ALIGNMENT = 128;    // Target frequency for CLIP
const TARGET_DENOISE = 65;       // Optimal denoising step count (balance between noise and artifacts)

interface GameState {
  phase: GamePhase;
  score: number;
  logs: string[];
  
  // Phase 1: Encoding
  compressionVal: number;
  
  // Phase 2: Conditioning
  alignmentVal: number;
  
  // Phase 3: Denoising
  denoiseLevel: number; // 0 (Noise) -> 100 (Clean)
  isDenoising: boolean;
  
  // Result
  finalQuality: '崩坏' | '模糊' | '清晰' | '完美';
  rankTitle: string;
}

const INITIAL_STATE: GameState = {
  phase: GamePhase.BRIEFING,
  score: 0,
  logs: [],
  compressionVal: 0.1,
  alignmentVal: 50,
  denoiseLevel: 0,
  isDenoising: false,
  finalQuality: '模糊',
  rankTitle: '见习研究员'
};

export const SimulationGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  
  // Audio context ref could go here for sound effects

  // Helper to add log
  const addLog = (msg: string) => {
    setState(prev => ({ ...prev, logs: [`[SYSTEM] ${msg}`, ...prev.logs].slice(0, 5) }));
  };

  // --- Phase 3: Denoising Loop ---
  useEffect(() => {
    let interval: number;
    if (state.phase === GamePhase.DENOISING && state.isDenoising) {
        // The closer to target, the slower/faster? Linear for now.
        interval = window.setInterval(() => {
            setState(prev => {
                const nextLevel = prev.denoiseLevel + 0.8; // Speed of denoising
                if (nextLevel >= 100) {
                    return { ...prev, denoiseLevel: 100, isDenoising: false };
                }
                return { ...prev, denoiseLevel: nextLevel };
            });
        }, 16); // 60fps approx
    }
    return () => clearInterval(interval);
  }, [state.phase, state.isDenoising]);


  // --- Actions ---

  const startGame = () => {
      setState({ ...INITIAL_STATE, phase: GamePhase.ENCODING });
      addLog("初始化 VAE 编码器模块...");
      addLog("任务目标: 生成 '雨夜赛博朋克猫' (512x512)");
  };

  const submitEncoding = () => {
      // Calculate Score for Phase 1
      const dist = Math.abs(state.compressionVal - TARGET_COMPRESSION);
      let points = 0;
      let msg = "";
      
      if (dist < 0.05) { points = 100; msg = "完美压缩! 潜空间特征极度精简且无损。"; }
      else if (dist < 0.15) { points = 70; msg = "压缩尚可，存在轻微特征丢失。"; }
      else { points = 30; msg = "警告: 压缩率异常，特征严重失真或冗余。"; }

      addLog(msg);
      addLog(`感知压缩得分: ${points}/100`);
      
      setTimeout(() => {
          setState(prev => ({
              ...prev,
              score: prev.score + points,
              phase: GamePhase.CONDITIONING
          }));
      }, 800);
  };

  const submitConditioning = () => {
      // Calculate Score for Phase 2
      const dist = Math.abs(state.alignmentVal - TARGET_ALIGNMENT);
      let points = 0;
      let msg = "";

      if (dist < 5) { points = 100; msg = "语义共振频率完全锁定！Text Embedding 精准注入。"; }
      else if (dist < 15) { points = 75; msg = "语义对齐略有偏差，可能导致 Prompt 遵循性下降。"; }
      else { points = 40; msg = "警告: 语义漂移严重，Cross-Attention 注意力分散。"; }

      addLog(msg);
      addLog(`CLIP 对齐得分: ${points}/100`);
      
      setTimeout(() => {
          setState(prev => ({
              ...prev,
              score: prev.score + points,
              phase: GamePhase.DENOISING
          }));
      }, 800);
  };

  const finishDenoise = () => {
      if (state.denoiseLevel === 0) return;

      setState(prev => ({ ...prev, isDenoising: false }));
      
      // Calculate Score for Phase 3
      const dist = Math.abs(state.denoiseLevel - TARGET_DENOISE);
      let points = 0;
      let quality: GameState['finalQuality'] = '模糊';
      let msg = "";

      if (dist < 5) { 
          points = 100; quality = '完美'; 
          msg = "去噪时机神乎其技！处于能量最低点。";
      } else if (dist < 15) { 
          points = 80; quality = '清晰'; 
          msg = "图像结构完整，纹理略有瑕疵。";
      } else if (state.denoiseLevel < 30) { 
          points = 20; quality = '崩坏'; 
          msg = "去噪不足，结果仍是一团噪声。";
      } else { 
          points = 40; quality = '崩坏'; 
          msg = "过度去噪，图像细节被抹平或烧毁。";
      }

      addLog(msg);
      
      setState(prev => ({
          ...prev,
          score: prev.score + points,
          finalQuality: quality,
          phase: GamePhase.DECODING
      }));

      // Auto transition to result after delay
      setTimeout(() => {
          setState(prev => ({ ...prev, phase: GamePhase.RESULT }));
      }, 2500);
  };

  // --- Renderers ---

  const renderBriefing = () => (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/50 shadow-[0_0_50px_rgba(139,92,246,0.2)] animate-pulse-slow">
                  <Terminal size={40} className="text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-zinc-800 text-xs px-2 py-0.5 rounded border border-zinc-700 font-mono">
                  v1.4.0
              </div>
          </div>
          
          <div>
              <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">神经连接就绪</h2>
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-zinc-500 to-transparent mx-auto my-4" />
              <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                  欢迎进入 <TechText>LDM 核心控制台</TechText>。<br/>
                  你将不再依赖自动驾驶，而是手动操作数学引擎。<br/>
                  请平衡压缩率、对齐语义向量，并掌控去噪节奏。
              </p>
          </div>

          <div className="bg-zinc-900/80 p-5 rounded-lg border border-white/10 text-left w-full max-w-sm shadow-xl">
              <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-widest">Target Prompt</div>
              <div className="text-green-400 font-mono text-sm border-l-2 border-green-500 pl-3">
                  "A neon hologram cat in rain, 8k resolution, cyberpunk style"
              </div>
          </div>

          <Button onClick={startGame} className="bg-primary hover:bg-primary/80 text-white w-56 h-12 text-lg shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              启动生成管线 <Play size={18} fill="currentColor" />
          </Button>
      </div>
  );

  const renderEncoder = () => (
      <div className="space-y-8 animate-in slide-in-from-right duration-500 h-full flex flex-col justify-center">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
                 <div className="bg-primary/20 p-2 rounded text-primary"><Layers size={20} /></div>
                 <div>
                    <h3 className="font-bold text-white">步骤 1: 变分自编码 (VAE)</h3>
                    <p className="text-xs text-zinc-500 font-mono">OBJECTIVE: MAXIMIZE LATENT EFFICIENCY</p>
                 </div>
             </div>
             <div className="text-right">
                 <div className="text-xs text-zinc-500">当前压缩因子</div>
                 <div className="font-mono text-cyan-400">f={ (4 + state.compressionVal * 12).toFixed(1) }</div>
             </div>
          </div>

          <div className="flex items-center justify-center gap-8 py-8 relative">
              {/* Input */}
              <div className="text-center space-y-3 group">
                  <div className="w-28 h-28 bg-zinc-800 rounded-lg border border-zinc-700 grid grid-cols-8 gap-0.5 p-1 transition-all duration-500 group-hover:border-zinc-500">
                      {Array.from({length: 64}).map((_, i) => <div key={i} className="bg-zinc-600 rounded-[1px]" />)}
                  </div>
                  <div className="text-xs font-mono text-zinc-500">Pixel Space<br/>(512x512x3)</div>
              </div>

              <div className="flex flex-col items-center gap-2 text-zinc-600">
                  <ArrowRight size={24} />
                  <span className="text-[10px] font-mono">E(x)</span>
              </div>

              {/* Latent */}
              <div className="text-center space-y-3 relative group">
                  <div 
                    className="bg-primary/10 rounded-lg border border-primary/50 flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.1)] group-hover:shadow-[0_0_50px_rgba(139,92,246,0.3)]"
                    style={{ 
                        width: `${Math.max(40, 112 * (1 - state.compressionVal * 0.8))}px`,
                        height: `${Math.max(40, 112 * (1 - state.compressionVal * 0.8))}px`
                    }}
                  >
                     <Zap size={20} className="text-primary animate-pulse" />
                  </div>
                  <div className="text-xs font-mono text-primary">Latent Space<br/>(64x64x4)</div>
              </div>
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
             <div className="flex justify-between text-xs text-zinc-400 font-mono">
                 <span>保留细节 (Low)</span>
                 <span><span className="text-green-500">◆</span> 最佳平衡点 (Optimal)</span>
                 <span>节省算力 (High)</span>
             </div>
             <Slider 
                min={0} max={1} step={0.01} 
                value={state.compressionVal} 
                onChange={(v) => setState({...state, compressionVal: v})} 
                label="调整下采样率 (Downsampling Rate)"
             />
             <p className="text-xs text-zinc-500 mt-2">
                 <span className="text-primary font-bold">提示：</span> LDM 论文建议压缩因子 f=8 是感知质量与计算效率的最佳平衡点。试着找到那个黄金分割点。
             </p>
          </div>

          <Button onClick={submitEncoding} className="w-full h-12 text-lg">确认潜在特征 (Embed Latents)</Button>
      </div>
  );

  const renderConditioning = () => (
      <div className="space-y-8 animate-in slide-in-from-right duration-500 h-full flex flex-col justify-center">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
                 <div className="bg-secondary/20 p-2 rounded text-secondary"><Radio size={20} /></div>
                 <div>
                    <h3 className="font-bold text-white">步骤 2: CLIP 语义对齐</h3>
                    <p className="text-xs text-zinc-500 font-mono">OBJECTIVE: ALIGN TEXT EMBEDDINGS</p>
                 </div>
             </div>
          </div>

          <div className="h-48 bg-black rounded-xl border border-zinc-800 relative overflow-hidden flex items-center justify-center shadow-inner">
              <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(10,1fr)] opacity-10">
                  {Array.from({length: 200}).map((_, i) => <div key={i} className="border-[0.5px] border-zinc-700" />)}
              </div>
              
              {/* Visualizing Waves */}
              <svg className="absolute inset-0 w-full h-full opacity-80" preserveAspectRatio="none">
                  {/* Target Wave (Cyan) */}
                  <path 
                    d={`M0,100 ` + Array.from({length: 20}).map((_, i) => {
                        const x = (i + 1) * (400/20);
                        const y = 100 + Math.sin(i * 0.8) * (TARGET_ALIGNMENT / 3);
                        return `L${x},${y}`;
                    }).join(" ")}
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="opacity-50"
                  />
                  {/* User Wave (Purple) - Dynamic */}
                  <path 
                    d={`M0,100 ` + Array.from({length: 20}).map((_, i) => {
                        const x = (i + 1) * (400/20);
                        const y = 100 + Math.sin(i * 0.8) * (state.alignmentVal / 3);
                        return `L${x},${y}`;
                    }).join(" ")}
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="3"
                    className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                  />
              </svg>
              
              <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur p-2 rounded border border-white/10 text-xs font-mono text-right">
                  <div className="text-cyan-400">目标特征: 赛博朋克霓虹</div>
                  <div className="text-purple-400">当前注入: {state.alignmentVal.toFixed(1)} Hz</div>
              </div>
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 space-y-4">
              <p className="text-sm text-zinc-400">
                  调节 <TechText>Cross-Attention</TechText> 的频率。如果不一致，U-Net 将无法理解“霓虹”和“猫”的空间关系。
                  <br/>
                  <span className="text-xs opacity-50 mt-1 block">操作指南：拖动滑块，使紫色波形与青色虚线波形完美重合。</span>
              </p>
              <Slider 
                min={0} max={200} step={0.5} 
                value={state.alignmentVal} 
                onChange={(v) => setState({...state, alignmentVal: v})} 
                label="Embedding Frequency Adjustment" 
              />
          </div>

          <Button onClick={submitConditioning} className="w-full h-12 text-lg">注入条件信号 (Inject Conditions)</Button>
      </div>
  );

  const renderDenoising = () => {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-500 h-full flex flex-col">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
                 <div className="bg-red-500/20 p-2 rounded text-red-400"><Activity size={20} /></div>
                 <div>
                    <h3 className="font-bold text-white">步骤 3: 逆向扩散 (U-Net)</h3>
                    <p className="text-xs text-zinc-500 font-mono">OBJECTIVE: HALT AT ENERGY MINIMUM</p>
                 </div>
             </div>
             <div className="text-right font-mono text-xs">
                 <div className="text-zinc-500">TIME STEP</div>
                 <div className={state.isDenoising ? "text-white animate-pulse" : "text-zinc-400"}>t = {Math.max(0, 1000 - Math.floor(state.denoiseLevel * 10))}</div>
             </div>
          </div>

          <div className="flex-1 relative bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center group select-none">
              {/* The Image Logic */}
              <div className="absolute inset-0 flex items-center justify-center">
                  {/* Base Image (Cat) */}
                  <img 
                    src="https://picsum.photos/id/119/800/800" 
                    className="w-full h-full object-cover transition-all duration-100"
                    style={{ 
                        filter: `
                            blur(${(100 - state.denoiseLevel) / 4}px) 
                            contrast(${0.5 + state.denoiseLevel/120}) 
                            brightness(${0.3 + state.denoiseLevel/110})
                            grayscale(${Math.max(0, 1 - state.denoiseLevel/50)})
                        `
                    }}
                  />
                  {/* Noise Overlay - Fades out as level increases */}
                  <div 
                    className="absolute inset-0 bg-repeat mix-blend-hard-light transition-opacity duration-75"
                    style={{ 
                        opacity: Math.max(0, 1 - state.denoiseLevel/80),
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                    }} 
                  />
              </div>

              {/* Status Overlay */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
                  <div className={`text-xs font-mono px-2 py-1 rounded bg-black/50 backdrop-blur border ${state.denoiseLevel > 55 && state.denoiseLevel < 75 ? 'border-green-500 text-green-400' : 'border-white/20 text-white'}`}>
                      SNR: {(state.denoiseLevel / 5).toFixed(1)} dB
                  </div>
              </div>

              {state.isDenoising && (
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                      <div className="w-full h-0.5 bg-red-500/50 absolute top-[50%] animate-ping" />
                      <div className="h-full w-0.5 bg-red-500/50 absolute left-[50%] animate-ping" />
                  </div>
              )}
          </div>

          <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono text-zinc-400 px-1">
                  <span>纯噪声 (Pure Noise)</span>
                  <span>过拟合 (Artifacts)</span>
              </div>
              <div className="relative">
                 <ProgressBar 
                    value={state.denoiseLevel} 
                    max={100} 
                    color={state.denoiseLevel > 75 ? 'bg-red-500 shadow-[0_0_15px_red]' : state.denoiseLevel > 55 ? 'bg-green-400 shadow-[0_0_15px_#4ade80]' : 'bg-primary'} 
                 />
                 {/* Target Zone Marker */}
                 <div className="absolute top-0 bottom-0 left-[55%] w-[15%] bg-green-500/10 border-x border-green-500/30 pointer-events-none h-full" />
                 <div className="absolute -top-4 left-[62%] -translate-x-1/2 text-[9px] text-green-500 font-mono animate-bounce">
                    TARGET
                 </div>
              </div>
          </div>

          <div className="flex gap-4 mt-2">
              <button 
                onMouseDown={() => { if(state.denoiseLevel < 100) setState(p => ({...p, isDenoising: true})) }}
                onMouseUp={finishDenoise}
                onMouseLeave={() => setState(p => ({...p, isDenoising: false}))}
                onTouchStart={() => { if(state.denoiseLevel < 100) setState(p => ({...p, isDenoising: true})) }}
                onTouchEnd={finishDenoise}
                disabled={state.denoiseLevel >= 100}
                className={`flex-1 font-bold rounded-xl h-14 text-lg tracking-wider transition-all select-none flex items-center justify-center gap-2 border
                    ${state.isDenoising 
                        ? 'bg-red-500 border-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-95' 
                        : 'bg-white text-black border-white hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02]'}
                `}
              >
                  {state.isDenoising ? <><Activity className="animate-spin" /> 去噪计算中...</> : "按住注入去噪算力 (HOLD)"}
              </button>
          </div>
          <p className="text-center text-xs text-zinc-600 font-mono">
              松开按钮以锁定当前的潜空间状态。请在绿色区间内停止。
          </p>
      </div>
    );
  };

  const renderDecoding = () => (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-1000 space-y-6">
           <div className="relative">
               <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full animate-pulse" />
               <RefreshCw className="text-secondary w-20 h-20 animate-spin relative z-10" />
           </div>
           <div className="text-center space-y-2">
                <h2 className="text-2xl font-mono text-white tracking-widest">UPSCALING...</h2>
                <p className="text-zinc-500 font-mono">
                    运行解码器 D(z)<br/>
                    潜空间 (64px) → 像素空间 (512px)
                </p>
           </div>
      </div>
  );

  const renderResult = () => {
      let resultImage = "https://picsum.photos/id/119/800/800"; // Perfect
      if (state.finalQuality === '崩坏') resultImage = "https://grainy-gradients.vercel.app/noise.svg"; // Noise
      if (state.finalQuality === '模糊') resultImage = "https://picsum.photos/id/119/100/100"; // Blurry

      // Calculate Rank
      let finalRank = "实习生";
      if (state.score >= 280) finalRank = "首席架构师";
      else if (state.score >= 220) finalRank = "资深研究员";
      else if (state.score >= 150) finalRank = "博士研究生";
      else finalRank = "本科实习生";

      return (
        <div className="space-y-6 text-center animate-in slide-in-from-bottom duration-500 h-full flex flex-col justify-center">
            <div className="flex justify-center mb-2">
                <Badge>模拟完成报告</Badge>
            </div>
            
            <div className="relative w-56 h-56 mx-auto bg-black rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl group">
                <img src={resultImage} className={`w-full h-full object-cover transition-all duration-700 ${state.finalQuality === '模糊' ? 'blur-[4px]' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                    <span className="text-white font-mono text-sm">{state.finalQuality} Quality</span>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white tracking-tight">{finalRank}</h2>
            <div className="text-zinc-400 text-sm">操作总评分</div>

            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto w-full">
                <div className="bg-zinc-900/50 p-2 rounded border border-white/5 flex flex-col items-center">
                    <div className="text-[10px] text-zinc-500 uppercase">压缩</div>
                    <div className="text-lg font-bold text-white">{state.logs.some(l => l.includes("压缩得分")) ? state.logs.find(l => l.includes("压缩得分"))?.match(/(\d+)/)?.[0] : "-"}</div>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded border border-white/5 flex flex-col items-center">
                    <div className="text-[10px] text-zinc-500 uppercase">对齐</div>
                    <div className="text-lg font-bold text-white">{state.logs.some(l => l.includes("对齐得分")) ? state.logs.find(l => l.includes("对齐得分"))?.match(/(\d+)/)?.[0] : "-"}</div>
                </div>
                <div className="bg-primary/20 p-2 rounded border border-primary/30 flex flex-col items-center shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                    <div className="text-[10px] text-primary/80 uppercase">总分</div>
                    <div className="text-lg font-bold text-primary">{state.score}</div>
                </div>
            </div>

            <div className="flex gap-4 justify-center mt-6">
                <Button onClick={onExit} className="border-white/10 hover:bg-white/5">退出系统</Button>
                <Button onClick={startGame} className="bg-white text-black hover:bg-zinc-200">再次模拟</Button>
            </div>
        </div>
      );
  };

  // --- Main Render Switch ---

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
        {/* Background Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        {/* Console / Log Panel */}
        <div className="absolute top-6 left-6 w-72 hidden lg:block space-y-2 font-mono text-[11px] p-4 rounded-lg bg-black/40 border border-white/5 backdrop-blur-md">
            <div className="text-zinc-400 border-b border-white/5 pb-2 flex justify-between">
                <span>SYSTEM_LOGS</span>
                <span className="text-green-500 animate-pulse">● LIVE</span>
            </div>
            <div className="flex flex-col gap-1.5 h-32 overflow-hidden mask-image-b">
                {state.logs.map((log, i) => (
                    <div key={i} className="text-green-400/80 truncate border-l-2 border-green-500/20 pl-2 animate-in slide-in-from-left duration-300">
                        <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                        {log.replace('[SYSTEM]', '')}
                    </div>
                ))}
            </div>
        </div>

        {/* Header HUD */}
        <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-zinc-900/80 backdrop-blur border border-white/10 px-4 py-1 rounded-full text-xs font-mono text-zinc-500 flex gap-4">
                <span>MODE: INTERACTIVE</span>
                <span className="text-zinc-700">|</span>
                <span>LATENT DIFFUSION SIMULATOR</span>
            </div>
        </div>

        {/* Exit Button */}
        <button onClick={onExit} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full z-50">
            <Maximize size={24} className="rotate-45" />
        </button>

        {/* Main Game Container */}
        <Card className="w-full max-w-2xl h-[600px] flex flex-col justify-between border-primary/20 bg-zinc-950/90 shadow-2xl relative overflow-hidden">
            {/* Decorative Grid */}
            <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] opacity-[0.03] pointer-events-none">
                {Array.from({length: 1600}).map((_, i) => <div key={i} className="border-[0.5px] border-white" />)}
            </div>

            {state.phase === GamePhase.BRIEFING && renderBriefing()}
            {state.phase === GamePhase.ENCODING && renderEncoder()}
            {state.phase === GamePhase.CONDITIONING && renderConditioning()}
            {state.phase === GamePhase.DENOISING && renderDenoising()}
            {state.phase === GamePhase.DECODING && renderDecoding()}
            {state.phase === GamePhase.RESULT && renderResult()}
        </Card>
    </div>
  );
};
