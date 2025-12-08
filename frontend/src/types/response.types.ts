import type {
    Game,
    GameData,
    Message,
    Participant,
    SlideData,
    User,
    UserStatisticsData,
} from '../models/models'
import type { ApiResponse } from './api.types'

export type AuthResponse = ApiResponse<{ user: User; token: string }>
export type UserResponse = ApiResponse<{ user: User }>
export type GameResponse = ApiResponse<{ game: Game } | null>
export type GameDataResponse = ApiResponse<{ game: GameData } | null>
export type MessagesResponse = ApiResponse<{ messages: Message[] }>
export type ChatResponse = ApiResponse<{ messageId: string; timestamp: string }>
export type JoinGameResponse = ApiResponse<{ game: Game } | null>
export type ParticipantsResponse = ApiResponse<{ participants: Participant[] }>
export type VoidResponse = ApiResponse<null>
export type SlidesResponse = ApiResponse<{ slides: SlideData[] }>
export type UserStatisticResponse = ApiResponse<UserStatisticsData>
export type UsersListResponse = ApiResponse<{ users: User[] }>
