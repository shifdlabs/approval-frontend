import { Position } from "../positions/position"

export interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    position: Position | null
    phone: string
    role: number
    access: boolean
    title: string
}
