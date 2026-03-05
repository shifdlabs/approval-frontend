export interface InProgressOverview {
    subject: string
    approvers: ApproverState[]
}

export interface ApproverState {
    name: string
    title: string
    approved: boolean | null
    date: string | null
    signature: boolean
    signatureUrl: string | null
}

export interface RejectedOverview {
    name: string
    title: string
    date: string
    subject: string
    reason: string
}

export interface CompletedOverview {
    isFinished: boolean
    name: string
    title: string
    date: string
    subject: string
    internalApprover: ApproverState[] | null
    externalApprover: string | null
}

export interface InternalRecipient {
    name: string
    title: string
}
