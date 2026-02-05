import dotenv from 'dotenv';
import { SystemConfig } from '../types';
import { logger } from './logger.js';

dotenv.config();

export function loadConfig(): SystemConfig {
  const config: SystemConfig = {
    environment:
      (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
      'development',
    port: parseInt(process.env.PORT || '3000', 10),
    logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
    phase: parseInt(process.env.PHASE || '1', 10) as 1 | 2 | 3,
    paradigmInstantiationMode: (process.env.PARADIGM_INSTANTIATION_MODE ||
      'isolated') as 'isolated' | 'hybrid' | 'fusion',
    featureFlags: {
      enablePluralReasoners:
        process.env.ENABLE_PLURAL_REASONERS !== 'false',
      enableAcausalRag:
        process.env.ENABLE_ACAUSAL_RAG === 'true',
      enableSemioticCode:
        process.env.ENABLE_SEMIOTIC_CODE === 'true',
      enableVoidPressure:
        process.env.ENABLE_VOID_PRESSURE !== 'false',
    },
    llm: {
      primary: (process.env.LLM_PRIMARY || 'claude') as
        | 'claude'
        | 'ollama'
        | 'hf'
        | 'grok',
      fallback: (process.env.LLM_FALLBACK || 'ollama,hf').split(','),
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000', 10),
    },
    ralph: {
      budgetTokens: parseInt(
        process.env.RALPH_BUDGET_TOKENS || '100000',
        10
      ),
      costPerToken: parseFloat(process.env.RALPH_COST_PER_TOKEN || '0.01'),
      denialThreshold: parseFloat(
        process.env.RALPH_DENIAL_THRESHOLD || '0.3'
      ),
    },
    qdrant: {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
      timeout: parseInt(process.env.QDRANT_TIMEOUT || '30000', 10),
    },
    sui: {
      rpcUrl:
        process.env.SUI_RPC_URL || 'https://fullnode.devnet.sui.io:443',
      packageId: process.env.SUI_PACKAGE_ID || '',
      adminAccount: process.env.SUI_ADMIN_ACCOUNT || '',
    },
  };

  // Validate critical configuration
  if (
    !config.sui.packageId ||
    !config.sui.adminAccount
  ) {
    logger.warn(
      'SUI configuration incomplete - blockchain persistence may fail'
    );
  }

  logger.info(
    {
      config: {
        environment: config.environment,
        port: config.port,
        phase: config.phase,
        paradigmMode: config.paradigmInstantiationMode,
      },
    },
    'Configuration loaded'
  );

  return config;
}

export const systemConfig = loadConfig();
