export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          date_of_birth: string | null
          address: string | null
          city: string | null
          country: string | null
          type: 'single' | 'family'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          type?: 'single' | 'family'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          type?: 'single' | 'family'
          created_at?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          customer_id: string
          name: string
          date_of_birth: string
          relationship: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          name: string
          date_of_birth: string
          relationship: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          name?: string
          date_of_birth?: string
          relationship?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}