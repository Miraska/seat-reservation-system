export interface Event {
  id: number;
  name: string;
  total_seats: number;
}

export interface Booking {
  id: number;
  event_id: number;
  user_id: string;
  created_at: Date;
}

export interface BookingRequest {
  event_id: number;
  user_id: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  booking?: Booking;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
