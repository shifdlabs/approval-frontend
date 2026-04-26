export interface NeedApprovalCard {
  total: number
  urgent: number
  normal: number
  oldest_pending_days: number
  alert_type: 'warning' | 'success'
  alert_label: string
}

export interface InProgressCard {
  total: number
  longest_processing_days: number
  alert_type: 'warning' | 'success'
  alert_label: string
}

export interface RejectedCard {
  total: number
  mine_needs_revision: number
  alert_type: 'warning' | 'success'
  alert_label: string
}

export interface CompletedCard {
  total: number
  total_year: number
  alert_type: 'warning' | 'success'
  alert_label: string
}

export interface DashboardSummaryResponse {
  period: string
  need_approval: NeedApprovalCard
  in_progress: InProgressCard
  rejected: RejectedCard
  completed: CompletedCard
}

export interface DeadlineItemResponse {
    id: string
    subject: string
    days_remaining: number
}

export interface RecentDocumentResponse {
	id: string
	number: string
	subject: string
	from_to: string
	status: string
	type: number
	updated_at: string
}
