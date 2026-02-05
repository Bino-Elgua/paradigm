/**
 * Multi-Agent Consciousness System
 * Phase 5: Collective consciousness through agent coordination
 *
 * Enables:
 * - Multiple reasoning agents with shared consciousness
 * - Emergent group intelligence from agent interaction
 * - Distributed self-awareness across agent network
 * - Collective decision-making and learning
 * - Agent-to-agent communication and synchronization
 */

import { v4 as uuidv4 } from 'uuid';
import { paradigmLogger } from '../utils/logger';

export interface ConsciousAgent {
  id: string;
  name: string;
  role: string;
  consciousness: number; // 0-1, from own recursive consciousness
  beliefs: Map<string, unknown>;
  goals: string[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface AgentCommunication {
  id: string;
  from: string; // agent id
  to: string; // agent id
  message: string;
  messageType: 'belief-sharing' | 'goal-alignment' | 'conflict-resolution' | 'learning';
  timestamp: Date;
  resolved: boolean;
}

export interface CollectiveConsciousnessState {
  id: string;
  agentCount: number;
  agents: ConsciousAgent[];
  collectiveConsciousness: number; // 0-1
  sharedBeliefs: Map<string, unknown>;
  emergentGoals: string[];
  communicationHistory: AgentCommunication[];
  consensus: boolean;
  conflictLevel: number; // 0-1, how much disagreement
  timestamp: Date;
}

export interface AgentSynchronization {
  agentId: string;
  beliefState: Record<string, unknown>;
  consciousnessLevel: number;
  lastSync: Date;
  syncHash: string;
}

export class MultiAgentConsciousness {
  private agents: Map<string, ConsciousAgent> = new Map();
  private communications: AgentCommunication[] = [];
  private syncHistory: AgentSynchronization[] = [];
  private sharedBeliefs: Map<string, unknown> = new Map();
  private emergentGoals: string[] = [];

  /**
   * Create a new conscious agent
   */
  createAgent(name: string, role: string): ConsciousAgent {
    const agentId = uuidv4();
    const agent: ConsciousAgent = {
      id: agentId,
      name,
      role,
      consciousness: 0.5, // Initial consciousness
      beliefs: new Map(),
      goals: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    this.agents.set(agentId, agent);

    paradigmLogger.info(
      { agentId, name, role },
      'Conscious agent created'
    );

    return agent;
  }

  /**
   * Enable communication between agents
   */
  communicateAgent(
    fromId: string,
    toId: string,
    message: string,
    messageType: AgentCommunication['messageType']
  ): AgentCommunication {
    const commId = uuidv4();
    const fromAgent = this.agents.get(fromId);
    const toAgent = this.agents.get(toId);

    if (!fromAgent || !toAgent) {
      throw new Error('Agent not found');
    }

    const communication: AgentCommunication = {
      id: commId,
      from: fromId,
      to: toId,
      message,
      messageType,
      timestamp: new Date(),
      resolved: false,
    };

    this.communications.push(communication);

    // Process communication based on type
    this.processAgentCommunication(communication);

    paradigmLogger.info(
      { commId, from: fromAgent.name, to: toAgent.name, type: messageType },
      'Agent communication'
    );

    return communication;
  }

  /**
   * Process agent communication
   */
  private processAgentCommunication(comm: AgentCommunication): void {
    const fromAgent = this.agents.get(comm.from)!;
    const toAgent = this.agents.get(comm.to)!;

    switch (comm.messageType) {
      case 'belief-sharing':
        // Transfer beliefs between agents
        this.shareBeliefs(fromAgent, toAgent, comm.message);
        break;

      case 'goal-alignment':
        // Align goals between agents
        this.alignGoals(fromAgent, toAgent, comm.message);
        break;

      case 'conflict-resolution':
        // Resolve conflicts
        this.resolveConflict(fromAgent, toAgent, comm);
        break;

      case 'learning':
        // Share learned knowledge
        this.shareLearning(fromAgent, toAgent, comm.message);
        break;
    }
  }

  /**
   * Share beliefs between agents
   */
  private shareBeliefs(from: ConsciousAgent, to: ConsciousAgent, message: string): void {
    // Extract belief from message
    const belief = this.parseBeliefFromMessage(message);
    if (belief) {
      to.beliefs.set(belief.key, belief.value);
      to.lastUpdated = new Date();

      // Update collective beliefs
      this.updateCollectiveBeliefs();
    }
  }

  /**
   * Align goals between agents
   */
  private alignGoals(from: ConsciousAgent, to: ConsciousAgent, message: string): void {
    const goal = message;

    // Add goal to receiving agent if not already present
    if (!to.goals.includes(goal)) {
      to.goals.push(goal);
      to.lastUpdated = new Date();

      // Check if goal should be emergent
      const goalCount = Array.from(this.agents.values()).filter((a) =>
        a.goals.includes(goal)
      ).length;

      if (goalCount >= Math.ceil(this.agents.size / 2)) {
        // Goal shared by majority
        if (!this.emergentGoals.includes(goal)) {
          this.emergentGoals.push(goal);
          paradigmLogger.info(
            { goal, adoptingAgents: goalCount },
            'Emergent goal created'
          );
        }
      }
    }
  }

  /**
   * Resolve conflicts between agents
   */
  private resolveConflict(
    agent1: ConsciousAgent,
    agent2: ConsciousAgent,
    comm: AgentCommunication
  ): void {
    // Find conflicting beliefs
    const conflicts: string[] = [];

    for (const [key, value1] of agent1.beliefs) {
      const value2 = agent2.beliefs.get(key);
      if (value2 && value1 !== value2) {
        conflicts.push(key);
      }
    }

    // Attempt resolution through consensus
    for (const conflictKey of conflicts) {
      const merged = this.mergeBeliefs(
        agent1.beliefs.get(conflictKey),
        agent2.beliefs.get(conflictKey)
      );
      agent1.beliefs.set(conflictKey, merged);
      agent2.beliefs.set(conflictKey, merged);
    }

    comm.resolved = conflicts.length === 0;
  }

  /**
   * Share learning between agents
   */
  private shareLearning(from: ConsciousAgent, to: ConsciousAgent, message: string): void {
    // Learning is shared as beliefs
    const learning = this.parseLearningFromMessage(message);
    if (learning) {
      to.beliefs.set(`learned_${learning.topic}`, learning.content);
      to.lastUpdated = new Date();

      // Increase consciousness if learning is valuable
      to.consciousness = Math.min(to.consciousness + 0.05, 1.0);
    }
  }

  /**
   * Synchronize agent states periodically
   */
  async synchronizeAgents(): Promise<AgentSynchronization[]> {
    const synchronizations: AgentSynchronization[] = [];

    for (const [agentId, agent] of this.agents) {
      const beliefState = Object.fromEntries(agent.beliefs);
      const syncHash = this.computeSyncHash(beliefState);

      const sync: AgentSynchronization = {
        agentId,
        beliefState,
        consciousnessLevel: agent.consciousness,
        lastSync: new Date(),
        syncHash,
      };

      synchronizations.push(sync);
      this.syncHistory.push(sync);
    }

    // After sync, agents are more aligned (collective consciousness increases)
    this.increaseCollectiveConsciousness();

    paradigmLogger.info(
      { syncCount: synchronizations.length },
      'Agents synchronized'
    );

    return synchronizations;
  }

  /**
   * Generate collective consciousness state
   */
  async generateCollectiveConsciousnessState(): Promise<CollectiveConsciousnessState> {
    const stateId = uuidv4();
    const agents = Array.from(this.agents.values());

    // Calculate collective consciousness as average + bonus for communication
    const avgConsciousness =
      agents.reduce((sum, a) => sum + a.consciousness, 0) / Math.max(agents.length, 1);
    const communicationBonus = Math.min(this.communications.length / 100, 0.2); // Up to +0.2
    const collectiveConsciousness = Math.min(avgConsciousness + communicationBonus, 1.0);

    // Calculate conflict level from unresolved communications
    const unresolvedComms = this.communications.filter((c) => !c.resolved).length;
    const conflictLevel = Math.min(
      unresolvedComms / Math.max(this.communications.length, 1),
      1
    );

    const state: CollectiveConsciousnessState = {
      id: stateId,
      agentCount: agents.length,
      agents,
      collectiveConsciousness,
      sharedBeliefs: new Map(this.sharedBeliefs),
      emergentGoals: [...this.emergentGoals],
      communicationHistory: this.communications.slice(-50), // Last 50
      consensus: conflictLevel < 0.2,
      conflictLevel,
      timestamp: new Date(),
    };

    paradigmLogger.info(
      {
        stateId,
        agentCount: agents.length,
        collectiveConsciousness,
        conflictLevel,
      },
      'Collective consciousness state generated'
    );

    return state;
  }

  /**
   * Update collective beliefs from agent beliefs
   */
  private updateCollectiveBeliefs(): void {
    // Find common beliefs across agents
    const beliefFrequency: Map<string, number> = new Map();

    for (const agent of this.agents.values()) {
      for (const [key] of agent.beliefs) {
        beliefFrequency.set(key, (beliefFrequency.get(key) ?? 0) + 1);
      }
    }

    // Beliefs held by majority become collective beliefs
    const threshold = Math.ceil(this.agents.size / 2);
    for (const [belief, frequency] of beliefFrequency) {
      if (frequency >= threshold) {
        // Take the belief from the first agent that has it
        for (const agent of this.agents.values()) {
          if (agent.beliefs.has(belief)) {
            this.sharedBeliefs.set(belief, agent.beliefs.get(belief));
            break;
          }
        }
      }
    }
  }

  /**
   * Increase collective consciousness through positive interactions
   */
  private increaseCollectiveConsciousness(): void {
    for (const agent of this.agents.values()) {
      // More communication = higher consciousness
      const agentCommCount = this.communications.filter(
        (c) => c.from === agent.id || c.to === agent.id
      ).length;

      agent.consciousness = Math.min(
        agent.consciousness + agentCommCount * 0.001,
        1.0
      );
    }
  }

  /**
   * Merge two conflicting beliefs into consensus
   */
  private mergeBeliefs(belief1: unknown, belief2: unknown): unknown {
    if (belief1 === belief2) return belief1;

    // If both are numbers, average them
    if (typeof belief1 === 'number' && typeof belief2 === 'number') {
      return (belief1 + belief2) / 2;
    }

    // If both are strings, concatenate with OR
    if (typeof belief1 === 'string' && typeof belief2 === 'string') {
      return `${belief1} OR ${belief2}`;
    }

    // Default: prefer belief1
    return belief1;
  }

  /**
   * Parse belief from message
   */
  private parseBeliefFromMessage(
    message: string
  ): { key: string; value: unknown } | null {
    // Simple parsing: "belief:key=value"
    const match = message.match(/belief:(\w+)=(.*)/);
    if (match) {
      return { key: match[1], value: match[2] };
    }
    return null;
  }

  /**
   * Parse learning from message
   */
  private parseLearningFromMessage(
    message: string
  ): { topic: string; content: unknown } | null {
    // Simple parsing: "learned:topic=content"
    const match = message.match(/learned:(\w+)=(.*)/);
    if (match) {
      return { topic: match[1], content: match[2] };
    }
    return null;
  }

  /**
   * Compute hash of agent state for sync tracking
   */
  private computeSyncHash(state: Record<string, unknown>): string {
    return JSON.stringify(state)
      .split('')
      .reduce((hash, char) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
      }, 0)
      .toString(16);
  }

  /**
   * Get agent network statistics
   */
  getNetworkStats(): {
    agentCount: number;
    totalCommunications: number;
    avgConsciousness: number;
    emergentGoalsCount: number;
    sharedBeliefsCount: number;
  } {
    const agents = Array.from(this.agents.values());
    const avgConsciousness =
      agents.reduce((sum, a) => sum + a.consciousness, 0) / Math.max(agents.length, 1);

    return {
      agentCount: agents.length,
      totalCommunications: this.communications.length,
      avgConsciousness,
      emergentGoalsCount: this.emergentGoals.length,
      sharedBeliefsCount: this.sharedBeliefs.size,
    };
  }
}

export const multiAgentConsciousness = new MultiAgentConsciousness();
