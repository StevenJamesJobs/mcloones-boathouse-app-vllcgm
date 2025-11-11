
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      menu_categories: {
        Row: {
          id: string
          name: string
          display_order: number
          meal_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_order?: number
          meal_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_order?: number
          meal_type?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          category_id: string | null
          meal_type: string
          image_url: string | null
          is_available: boolean | null
          dietary_info: string[] | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          category_id?: string | null
          meal_type: string
          image_url?: string | null
          is_available?: boolean | null
          dietary_info?: string[] | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number | null
          category_id?: string | null
          meal_type?: string
          image_url?: string | null
          is_available?: boolean | null
          dietary_info?: string[] | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      weekly_specials: {
        Row: {
          id: string
          title: string
          description: string
          price: number | null
          valid_until: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price?: number | null
          valid_until?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number | null
          valid_until?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableName extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"]),
  TableName extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"]) = DefaultSchemaTableName
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<
  DefaultSchemaTableName extends keyof DefaultSchema["Tables"],
  TableName extends keyof DefaultSchema["Tables"] = DefaultSchemaTableName
> = DefaultSchema["Tables"][TableName] extends {
  Insert: infer I
}
  ? I
  : never

export type TablesUpdate<
  DefaultSchemaTableName extends keyof DefaultSchema["Tables"],
  TableName extends keyof DefaultSchema["Tables"] = DefaultSchemaTableName
> = DefaultSchema["Tables"][TableName] extends {
  Update: infer U
}
  ? U
  : never

export type Enums<
  DefaultSchemaEnumName extends keyof DefaultSchema["Enums"],
  EnumName extends keyof DefaultSchema["Enums"] = DefaultSchemaEnumName
> = DefaultSchema["Enums"][EnumName]
