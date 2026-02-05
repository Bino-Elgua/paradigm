/**
 * Approval Controller
 * 
 * Manages execution approval workflow
 * Phase 2: Week 2 Implementation
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface Approval {
  approval_id: string;
  query_id: string;
  user_id?: string;
  action: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  created_at: Date;
  expires_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  approval_decision?: string;
  execution_status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  execution_id?: string;
}

export class ApprovalController {
  private approvals = new Map<string, Approval>();

  async create(req: Request, res: Response): Promise<void> {
    const { query_id, action, risk_level, execution_timeframe } = req.body;

    const approval_id = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    const approval: Approval = {
      approval_id,
      query_id,
      user_id: (req as any).user?.id,
      action,
      risk_level: risk_level || 'MEDIUM',
      status: 'pending',
      created_at: now,
      expires_at: expiresAt
    };

    this.approvals.set(approval_id, approval);

    res.json({
      approval_id,
      status: 'pending',
      created_at: approval.created_at.toISOString(),
      expires_at: approval.expires_at.toISOString(),
      review_url: `https://paradigm-stack.local/approvals/${approval_id}`
    });
  }

  async getStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const approval = this.approvals.get(id);
    if (!approval) {
      res.status(404).json({
        error: {
          code: 'APPROVAL_NOT_FOUND',
          message: 'Approval request not found'
        }
      });
      return;
    }

    // Check if expired
    if (approval.status === 'pending' && new Date() > approval.expires_at) {
      approval.status = 'expired';
    }

    res.json({
      approval_id: approval.approval_id,
      status: approval.status,
      approved_by: approval.reviewed_by,
      approved_at: approval.reviewed_at?.toISOString(),
      execution_status: approval.execution_status,
      execution_id: approval.execution_id
    });
  }

  async approve(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { reviewed_by } = req.body;

    const approval = this.approvals.get(id);
    if (!approval) {
      res.status(404).json({
        error: { code: 'APPROVAL_NOT_FOUND', message: 'Not found' }
      });
      return;
    }

    approval.status = 'approved';
    approval.reviewed_at = new Date();
    approval.reviewed_by = reviewed_by || (req as any).user?.id;
    approval.execution_status = 'pending';
    approval.execution_id = uuidv4();

    res.json({
      approval_id: approval.approval_id,
      status: 'approved',
      execution_id: approval.execution_id
    });
  }

  async reject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const approval = this.approvals.get(id);
    if (!approval) {
      res.status(404).json({
        error: { code: 'APPROVAL_NOT_FOUND', message: 'Not found' }
      });
      return;
    }

    approval.status = 'rejected';
    approval.reviewed_at = new Date();
    approval.reviewed_by = (req as any).user?.id;

    res.json({
      approval_id: approval.approval_id,
      status: 'rejected'
    });
  }
}

export const approvalController = new ApprovalController();
