export interface Document {
    id: string
    publicationNumberType: number
    publicationValue: string
    externalRecipient: string
    subject: string
    body: string
    type: string
    priority: number | null
    step: number
    status: number
    updatedAt: string
    isApprover: boolean
    currentApprovalName: string
    lastRejector: LastRejector | null
    attachments: Attachments[] | null
}
  
export interface LastRejector {
    name: string
    reason: string
}

export interface Attachments {
    id: string
    fileName: string
    originalName: string
    path: string
    size: string
    type: string
}
