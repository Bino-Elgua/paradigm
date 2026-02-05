/**
 * Claude LLM Provider Integration
 * Phase 2: LLM Integration
 * 
 * Real LLM support for RLM core reasoning
 */

import Anthropic from '@anthropic-ai/sdk';
import { llmLogger } from '../utils/logger';

export interface LLMResponse {
  content: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  stopReason: string;
}

export interface LLMConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class ClaudeProvider {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: LLMConfig = {}) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      llmLogger.warn('No ANTHROPIC_API_KEY found, using mock mode');
    }

    this.client = new Anthropic({ apiKey: apiKey || 'mock-key' });
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.maxTokens = config.maxTokens || 1024;
    this.temperature = config.temperature || 0.7;

    llmLogger.info(
      { model: this.model, maxTokens: this.maxTokens },
      'Claude provider initialized'
    );
  }

  /**
   * Generate response from Claude
   */
  async generateResponse(prompt: string): Promise<LLMResponse> {
    try {
      llmLogger.debug(
        { promptLength: prompt.length },
        'Generating response from Claude'
      );

      const message = await (this.client as any).messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content =
        message.content[0].type === 'text' ? message.content[0].text : '';

      const response: LLMResponse = {
        content,
        tokenUsage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
          totalTokens: message.usage.input_tokens + message.usage.output_tokens,
        },
        model: this.model,
        stopReason: message.stop_reason,
      };

      llmLogger.info(
        {
          tokenUsage: response.tokenUsage,
          contentLength: content.length,
        },
        'Claude response generated'
      );

      return response;
    } catch (error) {
      llmLogger.error({ error }, 'Claude API error');
      throw error;
    }
  }

  /**
   * Streaming response (for real-time responses)
   */
  async* streamResponse(prompt: string): AsyncGenerator<string> {
    try {
      llmLogger.debug(
        { promptLength: prompt.length },
        'Streaming response from Claude'
      );

      const stream = await (this.client as any).messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text;
        }
      }

      llmLogger.info({}, 'Claude stream completed');
    } catch (error) {
      llmLogger.error({ error }, 'Claude streaming error');
      throw error;
    }
  }

  /**
   * Batch processing for multiple prompts
   */
  async batchGenerate(prompts: string[]): Promise<LLMResponse[]> {
    llmLogger.info(
      { batchSize: prompts.length },
      'Starting batch generation'
    );

    const results = await Promise.all(
      prompts.map(prompt => this.generateResponse(prompt))
    );

    llmLogger.info(
      {
        completedCount: results.length,
        totalTokens: results.reduce((sum, r) => sum + r.tokenUsage.totalTokens, 0),
      },
      'Batch generation complete'
    );

    return results;
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LLMConfig>) {
    if (config.model) this.model = config.model;
    if (config.maxTokens) this.maxTokens = config.maxTokens;
    if (config.temperature !== undefined) this.temperature = config.temperature;

    llmLogger.info(
      { model: this.model, maxTokens: this.maxTokens },
      'LLM configuration updated'
    );
  }
}

// Singleton instance
export const claudeProvider = new ClaudeProvider();
