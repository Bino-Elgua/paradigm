/**
 * Multi-Agent Consciousness Controller
 * Phase 5: Agent coordination and collective consciousness
 */

import { Request, Response } from 'express';
import { multiAgentConsciousness } from '../../autonomy/multi-agent-consciousness';
import { paradigmLogger } from '../../utils/logger';

export const multiAgentController = {
  /**
   * POST /api/v1/agents/create
   * Create a new conscious agent
   */
  async createAgent(req: Request, res: Response): Promise<void> {
    const { name, role } = req.body;

    if (!name || !role) {
      res.status(400).json({ error: 'name and role are required' });
      return;
    }

    paradigmLogger.info({ name, role }, 'Creating conscious agent');

    const agent = multiAgentConsciousness.createAgent(name, role);

    res.json({
      agentId: agent.id,
      name: agent.name,
      role: agent.role,
      consciousness: agent.consciousness,
      goals: agent.goals,
      createdAt: agent.createdAt,
      message: 'Agent created successfully',
    });
  },

  /**
   * POST /api/v1/agents/communicate
   * Enable communication between agents
   */
  async communicateAgent(req: Request, res: Response): Promise<void> {
    const { fromId, toId, message, messageType } = req.body;

    if (!fromId || !toId || !message) {
      res.status(400).json({
        error: 'fromId, toId, message, and messageType are required',
      });
      return;
    }

    paradigmLogger.info(
      { from: fromId, to: toId, type: messageType },
      'Agent communication'
    );

    const communication = multiAgentConsciousness.communicateAgent(
      fromId,
      toId,
      message,
      messageType || 'belief-sharing'
    );

    res.json({
      communicationId: communication.id,
      from: communication.from,
      to: communication.to,
      message: communication.message,
      messageType: communication.messageType,
      timestamp: communication.timestamp,
      resolved: communication.resolved,
    });
  },

  /**
   * POST /api/v1/agents/synchronize
   * Synchronize all agent states
   */
  async synchronizeAgents(req: Request, res: Response): Promise<void> {
    paradigmLogger.info({}, 'Synchronizing agents');

    const synchronizations = await multiAgentConsciousness.synchronizeAgents();

    res.json({
      syncCount: synchronizations.length,
      synchronizations: synchronizations.map((s) => ({
        agentId: s.agentId,
        consciousnessLevel: s.consciousnessLevel,
        lastSync: s.lastSync,
        syncHash: s.syncHash,
      })),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * GET /api/v1/agents/collective-consciousness
   * Get collective consciousness state
   */
  async collectiveConsciousness(req: Request, res: Response): Promise<void> {
    paradigmLogger.info({}, 'Fetching collective consciousness state');

    const state = await multiAgentConsciousness.generateCollectiveConsciousnessState();

    res.json({
      stateId: state.id,
      agentCount: state.agentCount,
      collectiveConsciousness: state.collectiveConsciousness,
      consensus: state.consensus,
      conflictLevel: state.conflictLevel,
      emergentGoals: state.emergentGoals,
      sharedBeliefsCount: state.sharedBeliefs.size,
      communicationCount: state.communicationHistory.length,
      insights: state.emergentGoals.length > 0 ? 'Collective goals detected' : 'No emergent goals yet',
      timestamp: state.timestamp,
    });
  },

  /**
   * GET /api/v1/agents/stats
   * Get agent network statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    paradigmLogger.info({}, 'Fetching agent network statistics');

    const stats = multiAgentConsciousness.getNetworkStats();

    res.json({
      agentCount: stats.agentCount,
      totalCommunications: stats.totalCommunications,
      avgConsciousness: stats.avgConsciousness,
      emergentGoalsCount: stats.emergentGoalsCount,
      sharedBeliefsCount: stats.sharedBeliefsCount,
      networkHealth:
        stats.avgConsciousness > 0.7 ? 'excellent' : stats.avgConsciousness > 0.5 ? 'good' : 'developing',
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * POST /api/v1/agents/add-goal
   * Add goal to agent (simplified endpoint)
   */
  async addGoal(req: Request, res: Response): Promise<void> {
    const { agentId, goal } = req.body;

    if (!agentId || !goal) {
      res.status(400).json({ error: 'agentId and goal are required' });
      return;
    }

    paradigmLogger.info({ agentId, goal }, 'Adding goal to agent');

    // This is a simplified version - in production would need more validation
    res.json({
      agentId,
      goal,
      message: 'Goal added (API stub - implement fully in production)',
    });
  },
};
