export interface SignatureRequest {
  userId: string
  imageUrl: string
}

export interface UpdateSignatureRequest {
  imageUrl: string
}

export interface SignatureResponse {
  id: string
  userId: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}