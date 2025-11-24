
import React, { useState, useEffect, useRef } from 'react';
import { GamePhase } from '../types';
import { Card, Button, Slider, TechText, ProgressBar, Badge } from './UI';
import { Cpu, Zap, Radio, AlertTriangle, Play, RefreshCw, Maximize, ArrowRight, Activity, Terminal, Database, Target, Clock } from 'lucide-react';

interface GameState {
  phase: GamePhase;
  score: number;
  logs: string[];
  
  // VAE State
  vramUsage: number;
  infoRetention: number;
  vaeCompression: number; // User control
  
  // CLIP State
  clipTargetX: number;
  clipTargetY: number;
  clipUserX: number; // User control
  clipUserY: number; // User control
  clipLockProgress: number;

  // UNet State
  denoiseProgress: number;
  isDenoising: boolean;
  
  finalQuality: '崩坏' | '模糊' | '清晰' | '完美';
}

const INITIAL_STATE: GameState = {
  phase: GamePhase.BRIEFING,
  score: 0,
  logs: [],
  
  vramUsage: 120, // Start failing
  infoRetention: 100,
  vaeCompression: 0, // 0 = No compression (Huge VRAM)

  clipTargetX: 50,
  clipTargetY: 50,
  clipUserX: 0,
  clipUserY: 0,
  clipLockProgress: 0,

  denoiseProgress: 0,
  isDenoising: false,
  
  finalQuality: '模糊',
};

export const SimulationGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const requestRef = useRef<number>();
  
  const addLog = (msg: string) => {
    setState(prev => ({ ...prev, logs: [`> ${msg}`, ...prev.logs].slice(0, 6) }));
  };

  // --- Game Loop ---
  const gameLoop = () => {
    setState(prev => {
        let next = { ...prev };

        // PHASE 1: VAE Logic
        if (prev.phase === GamePhase.ENCODING) {
             // Logic: Higher Compression (slider -> 1) = Lower VRAM, Lower Retention
             // Formula: 
             // VRAM = 100 - (compression * 90) + noise
             // Retention = 100 - (compression * 60)
             // Goal: VRAM < 100 AND Retention > 60
             next.vramUsage = 150 - (prev.vaeCompression * 130);
             next.infoRetention = 100 - (Math.pow(prev.vaeCompression, 2) * 80);
        }

        // PHASE 2: CLIP Logic (Drifting Target)
        if (prev.phase === GamePhase.CONDITIONING) {
            // Move Target Randomly
            const driftSpeed = 0.5;
            let tx = prev.clipTargetX + (Math.random() - 0.5) * driftSpeed;
            let ty = prev.clipTargetY + (Math.random() - 0.5) * driftSpeed;
            // Clamp
            tx = Math.max(0, Math.min(100, tx));
            ty = Math.max(0, Math.min(100, ty));
            next.clipTargetX = tx;
            next.clipTargetY = ty;

            // Check Distance
            const dist = Math.sqrt(Math.pow(next.clipUserX - tx, 2) + Math.pow(next.clipUserY - ty, 2));
            if (dist < 10) {
                next.clipLockProgress = Math.min(100, prev.clipLockProgress + 0.8);
            } else {
                next.clipLockProgress = Math.max(0, prev.clipLockProgress - 0.5);
            }
        }

        // PHASE 3: UNET Logic (Denoising)
        if (prev.phase === GamePhase.DENOISING && prev.isDenoising) {
            // Nonlinear progress?
            next.denoiseProgress = prev.denoiseProgress + 0.5;
            if (next.denoiseProgress > 120) {
                 // Overcooked
                 next.isDenoising = false;
                 // Trigger fail state logic inside the render or effect, but here we just clamp
            }
        }

        return next;
    });
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  // --- Actions ---

  const startGame = () => {
      setState({ ...INITIAL_STATE, phase: GamePhase.ENCODING });
      addLog("任务开始: 压缩高维数据...");
  };

  const submitEncoding = () => {
      const { vramUsage, infoRetention } = state;
      if (vramUsage > 100) {
          addLog("错误: 显存溢出 (OOM)！压缩率不足。");
          return; // Fail to proceed
      }
      if (infoRetention < 50) {
          addLog("警告: 图像特征严重丢失，无法通过质量检测。");
          return;
      }
      
      let points = 0;
      // Bonus for being close to limits efficiently
      if (vramUsage > 80 && infoRetention > 70) points = 100;
      else points = 70;

      addLog(`VAE 编码成功。效率得分: ${points}`);
      setState(prev => ({ ...prev, score: prev.score + points, phase: GamePhase.CONDITIONING }));
  };

  const submitConditioning = () => {
      if (state.clipLockProgress < 100) {
          addLog("错误: 语义尚未锁定！请继续追踪目标。");
          return;
      }
      addLog("CLIP 语义注入完成。");
      setState(prev => ({ ...prev, score: prev.score + 100, phase: GamePhase.DENOISING }));
  };

  const finishDenoise = () => {
      if (state.denoiseProgress < 10) return;
      setState(prev => ({ ...prev, isDenoising: false }));

      const p = state.denoiseProgress;
      let q: GameState['finalQuality'] = '模糊';
      let pts = 0;
      let msg = "";

      if (p >= 60 && p <= 80) {
          q = '完美'; pts = 100; msg = "完美的去噪时机！";
      } else if (p > 80 && p < 100) {
          q = '清晰'; pts = 80; msg = "略微过度，纹理有些生硬。";
      } else if (p > 100) {
          q = '崩坏'; pts = 20; msg = "图像已烧毁 (Overcooked)。";
      } else {
          q = '模糊'; pts = 40; msg = "去噪不足，残留噪声。";
      }

      addLog(msg);
      setState(prev => ({ ...prev, score: prev.score + pts, finalQuality: q, phase: GamePhase.DECODING }));
      setTimeout(() => setState(prev => ({...prev, phase: GamePhase.RESULT})), 2000);
  };


  // --- Renderers ---

  const renderBriefing = () => (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="p-6 bg-primary/10 rounded-full border border-primary/40 animate-pulse">
            <Terminal size={48} className="text-primary" />
        </div>
        <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl font-bold text-white">操作员简报</h2>
            <p className="text-zinc-400">
                系统检测到新的生成任务：<span className="text-cyan-400">"赛博朋克风格的雨夜侦探"</span>。
                <br/><br/>
                你的任务是手动控制 LDM 的三个核心模块。这一过程非常精密，任何参数错误都会导致生成失败。
            </p>
            <div className="grid grid-cols-1 gap-2 text-left bg-zinc-900 p-4 rounded text-sm text-zinc-500">
                <div className="flex items-center gap-2"><Database size={14} /> 1. VAE: 压缩图像以适应显存，但不能丢失细节。</div>
                <div className="flex items-center gap-2"><Target size={14} /> 2. CLIP: 追踪漂移的语义目标，确保理解正确。</div>
                <div className="flex items-center gap-2"><Clock size={14} /> 3. U-Net: 在图像清晰的瞬间停止去噪。</div>
            </div>
        </div>
        <Button onClick={startGame} className="bg-white text-black font-bold px-8 py-3 hover:bg-zinc-200">开始任务</Button>
    </div>
  );

  const renderEncoder = () => {
    // Determine bar colors
    const vramColor = state.vramUsage > 100 ? 'bg-red-500' : 'bg-green-500';
    const infoColor = state.infoRetention < 50 ? 'bg-red-500' : 'bg-blue-500';

    return (
        <div className="h-full flex flex-col p-8 gap-8 animate-in slide-in-from-right">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Database className="text-primary" /> 模块 1: VAE 压缩机</h3>
                <div className="text-xs font-mono text-zinc-500">MISSION: BALANCE RESOURCES</div>
            </div>

            <div className="flex-1 flex gap-8 items-center justify-center">
                <div className="w-1/2 space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span>VRAM 占用 (必须 &lt; 100%)</span>
                            <span className={state.vramUsage > 100 ? "text-red-500" : "text-green-500"}>{state.vramUsage.toFixed(0)}%</span>
                        </div>
                        <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full ${vramColor} transition-all duration-300`} style={{width: `${Math.min(100, state.vramUsage)}%`}} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span>信息保留率 (必须大于 50%)</span>
                            <span className={state.infoRetention < 50 ? "text-red-500" : "text-blue-500"}>{state.infoRetention.toFixed(0)}%</span>
                        </div>
                        <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full ${infoColor} transition-all duration-300`} style={{width: `${state.infoRetention}%`}} />
                        </div>
                    </div>
                </div>

                <div className="w-48 h-48 bg-black border border-zinc-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                     {/* Preview Visualization */}
                     <div 
                        className="absolute inset-0 bg-[url('https://picsum.photos/id/237/400/400')] bg-cover transition-all duration-200"
                        style={{ 
                            filter: `blur(${state.vaeCompression * 10}px) grayscale(${state.vaeCompression * 100}%)`,
                            opacity: state.infoRetention / 100
                        }}
                     />
                     {state.vramUsage > 100 && (
                         <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center font-bold text-white animate-pulse">OOM ERROR</div>
                     )}
                </div>
            </div>

            <div className="bg-zinc-900 p-6 rounded-xl border border-white/5">
                <Slider 
                    label="压缩强度 (Compression Ratio)" 
                    min={0} max={1} step={0.01} 
                    value={state.vaeCompression} 
                    onChange={(v) => setState({...state, vaeCompression: v})} 
                />
                <p className="text-xs text-zinc-500 mt-2">
                    向右拖动以压缩图片。压缩越多，显存占用越低，但图片细节丢失越严重。
                </p>
            </div>

            <Button onClick={submitEncoding} disabled={state.vramUsage > 100 || state.infoRetention < 50} className="w-full h-12">
                提交潜空间数据
            </Button>
        </div>
    );
  };

  const renderConditioning = () => (
      <div className="h-full flex flex-col p-8 gap-6 animate-in slide-in-from-right">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><Target className="text-secondary" /> 模块 2: CLIP 导航仪</h3>
            <div className="text-xs font-mono text-zinc-500">MISSION: TRACK TARGET VECTOR</div>
        </div>

        <div className="flex-1 relative bg-black rounded-xl border border-zinc-800 overflow-hidden cursor-crosshair">
            {/* Grid */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-20 pointer-events-none">
                {Array.from({length: 100}).map((_, i) => <div key={i} className="border border-zinc-800" />)}
            </div>

            {/* Target */}
            <div 
                className="absolute w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all duration-1000 ease-linear"
                style={{ left: `${state.clipTargetX}%`, top: `${state.clipTargetY}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-cyan-400 whitespace-nowrap">Prompt Target</div>
            </div>

            {/* User Cursor (Visualized via sliders, not mouse, to simulate controls) */}
            <div 
                className={`absolute w-12 h-12 border-2 rounded-full transition-all duration-75 flex items-center justify-center
                    ${state.clipLockProgress > 0 ? 'border-green-500 scale-110' : 'border-white/50'}
                `}
                style={{ left: `${state.clipUserX}%`, top: `${state.clipUserY}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="w-1 h-1 bg-white rounded-full" />
            </div>

            {/* Lock Progress Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-4 py-2 rounded border border-white/10">
                <div className="text-xs text-zinc-400 mb-1">LOCK STATUS</div>
                <div className="w-32 h-2 bg-zinc-800 rounded overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-200" style={{width: `${state.clipLockProgress}%`}} />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8 bg-zinc-900 p-6 rounded-xl border border-white/5">
            <Slider label="语义经度 (Syntax X)" min={0} max={100} value={state.clipUserX} onChange={(v) => setState({...state, clipUserX: v})} />
            <Slider label="语义纬度 (Semantics Y)" min={0} max={100} value={state.clipUserY} onChange={(v) => setState({...state, clipUserY: v})} />
        </div>

        <Button onClick={submitConditioning} disabled={state.clipLockProgress < 100} className="w-full h-12">
            {state.clipLockProgress < 100 ? "等待信号锁定..." : "注入条件向量"}
        </Button>
      </div>
  );

  const renderDenoising = () => (
      <div className="h-full flex flex-col p-8 gap-6 animate-in slide-in-from-right">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><Clock className="text-red-500" /> 模块 3: U-Net 暗房</h3>
            <div className="text-xs font-mono text-zinc-500">MISSION: STOP AT PERFECTION</div>
        </div>

        <div className="flex-1 bg-black rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-800">
            {/* Image State */}
            <div 
                className="w-64 h-64 bg-cover bg-center transition-all duration-100"
                style={{
                    backgroundImage: 'url(https://picsum.photos/id/433/500/500)',
                    // Logic: 0 -> Blurry/Noisy. 60-80 -> Perfect. >100 -> Burned.
                    filter: state.denoiseProgress > 100 
                        ? `contrast(${1 + (state.denoiseProgress-100)/20}) brightness(${1 + (state.denoiseProgress-100)/50}) hue-rotate(${state.denoiseProgress}deg)` 
                        : `blur(${Math.max(0, (80 - state.denoiseProgress)/5)}px) brightness(${0.5 + state.denoiseProgress/160})`,
                    opacity: Math.min(1, state.denoiseProgress / 30)
                }}
            />
            
            {/* Noise Overlay */}
            {state.denoiseProgress < 80 && (
                <div className="absolute inset-0 pointer-events-none opacity-50" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${1 - state.denoiseProgress/100}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }} 
                />
            )}

            {/* Overcooked Warning */}
            {state.denoiseProgress > 90 && (
                <div className="absolute top-4 text-red-500 font-bold animate-pulse border-2 border-red-500 px-4 py-1 rounded">WARNING: OVERCOOKING</div>
            )}
        </div>

        <div className="space-y-4">
             <div className="h-6 w-full bg-zinc-800 rounded-full overflow-hidden relative border border-white/10">
                 {/* The Target Zone */}
                 <div className="absolute top-0 bottom-0 left-[60%] width-[20%] w-[20%] bg-green-500/20 border-x border-green-500/50 z-10 flex items-center justify-center">
                    <span className="text-[10px] text-green-400 font-bold tracking-widest">PERFECT ZONE</span>
                 </div>
                 {/* Progress Bar */}
                 <div className="h-full bg-primary relative z-0" style={{ width: `${Math.min(100, state.denoiseProgress)}%`}} />
                 {state.denoiseProgress > 100 && <div className="h-full bg-red-500 absolute left-0 top-0 z-20" style={{ width: `${Math.min(100, state.denoiseProgress)}%`}} />}
             </div>
             
             <div className="text-center text-xs text-zinc-500">
                 长按按钮进行去噪。在图像变得清晰但未“烧毁”前松手。
             </div>

             <button
                 className={`w-full h-16 rounded-xl font-bold text-xl tracking-widest transition-all
                    ${state.isDenoising 
                        ? 'bg-red-600 scale-95 shadow-[0_0_30px_rgba(220,38,38,0.5)] text-white' 
                        : 'bg-white text-black hover:bg-zinc-200'}
                 `}
                 onMouseDown={() => setState(p => ({...p, isDenoising: true}))}
                 onMouseUp={finishDenoise}
                 onTouchStart={() => setState(p => ({...p, isDenoising: true}))}
                 onTouchEnd={finishDenoise}
             >
                 {state.isDenoising ? "DENOISING..." : "HOLD TO DENOISE"}
             </button>
        </div>
      </div>
  );

  const renderDecoding = () => (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-700">
          <RefreshCw size={64} className="text-white animate-spin mb-4" />
          <h2 className="text-2xl font-mono text-white">UPSCALING 64px to 512px...</h2>
      </div>
  );

  const renderResult = () => (
      <div className="flex flex-col items-center justify-center h-full animate-in slide-in-from-bottom duration-500 text-center gap-6 p-8">
          <div className="relative group">
            <img 
                src="https://picsum.photos/id/433/500/500" 
                className={`w-48 h-48 rounded-lg shadow-2xl transition-all duration-1000 ${state.finalQuality === '模糊' ? 'blur-sm grayscale' : ''} ${state.finalQuality === '崩坏' ? 'contrast-200 hue-rotate-90' : ''}`} 
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                {state.finalQuality} Quality
            </div>
          </div>
          
          <div>
              <h2 className="text-4xl font-bold text-white mb-2">{state.score} PTS</h2>
              <p className="text-zinc-400">Task Completion Report</p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-sm text-xs font-mono">
              <div className="bg-zinc-900 p-3 rounded">
                  <div className="text-zinc-500">VAE EFFICIENCY</div>
                  <div className="text-white text-lg">{Math.round(state.infoRetention)}%</div>
              </div>
              <div className="bg-zinc-900 p-3 rounded">
                  <div className="text-zinc-500">CLIP ACCURACY</div>
                  <div className="text-white text-lg">{Math.round(state.clipLockProgress)}%</div>
              </div>
              <div className="bg-zinc-900 p-3 rounded">
                  <div className="text-zinc-500">UNET TIMING</div>
                  <div className="text-white text-lg">{state.denoiseProgress > 80 && state.denoiseProgress < 100 ? 'PERFECT' : 'BAD'}</div>
              </div>
          </div>

          <div className="flex gap-4">
               <Button onClick={onExit} className="bg-transparent border border-white/20 text-white">返回教程</Button>
               <Button onClick={() => setState(INITIAL_STATE)} className="bg-white text-black">重试任务</Button>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 font-sans">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
        
        {/* Log Console */}
        <div className="absolute top-6 left-6 w-64 hidden xl:block space-y-1 font-mono text-[10px] text-green-500/80 p-4 bg-black border border-green-900/30 rounded h-48 overflow-hidden">
            {state.logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>

        <Card className="w-full max-w-4xl h-[700px] border-white/10 bg-black/80 shadow-2xl relative overflow-hidden flex flex-col">
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
