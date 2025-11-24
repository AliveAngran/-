
export enum StepType {
    INTRODUCTION = 'INTRODUCTION',
    VAE_ENCODER = 'VAE_ENCODER',
    LATENT_SPACE = 'LATENT_SPACE',
    FORWARD_DIFFUSION = 'FORWARD_DIFFUSION',
    TEXT_ENCODER = 'TEXT_ENCODER',
    CROSS_ATTENTION = 'CROSS_ATTENTION',
    UNET_CORE = 'UNET_CORE',
    IMG2IMG_STRENGTH = 'IMG2IMG_STRENGTH',
    REVERSE_DIFFUSION = 'REVERSE_DIFFUSION',
    VAE_DECODER = 'VAE_DECODER'
  }
  
  export interface SectionData {
    id: StepType;
    title: string;
    subtitle: string;
    description: string;
    academicNote: string;
    logicLink?: string; // The "Why this step follows the previous one" explanation
    guide?: string; // Short "Try this" instruction
  }

  export enum AppMode {
    LEARNING = 'LEARNING',
    SIMULATION = 'SIMULATION'
  }

  export enum GamePhase {
    BRIEFING = 'BRIEFING',
    ENCODING = 'ENCODING',       // VAE
    CONDITIONING = 'CONDITIONING', // CLIP
    DENOISING = 'DENOISING',     // U-Net
    DECODING = 'DECODING',       // VAE Decoder
    RESULT = 'RESULT'
  }
