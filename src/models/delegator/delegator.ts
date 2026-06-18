export interface DelegatorUserInfo {
  id: string
  first_name: string
  last_name: string
  email: string
}

export interface Delegator {
  id: string
  owner_id: string
  owner: DelegatorUserInfo | null
  delegate: DelegatorUserInfo | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateDelegatorPayload {
  delegate_id: string
  start_date: string
  end_date: string
}

export interface UpdateDelegatorPayload {
  delegate_id: string
  start_date: string
  end_date: string
}
