import { apiclient } from './apiclient'

/* =======================
   TYPES (NOW EXPORTED)
======================= */

export interface FirmProfile {
  id?: number
  firm_name?: string
  firm_size?: string
  work_email?: string
  phone_number?: string
  firm_website?: string
  branding_guidelines?: string
  industry_specialties?: string[]
  primary_brand_color?: string
  secondary_brand_color?: string
  preferred_font_style?: string
  location?: string
}

export interface LeadMagnetGeneration {
  lead_magnet_type: string
  main_topic: string
  target_audience: string[]
  audience_pain_points: string[]
  desired_outcome: string
  call_to_action: string
  special_requests?: string
}

export interface PDFTemplate {
  id: string
  name: string
  preview_url?: string | null
  hover_preview_url?: string | null
  secondary_preview_url?: string | null
}

/* =======================
   API OBJECT
======================= */

const dashboardApi = {
  async getFirmProfile(): Promise<FirmProfile> {
    const res = await apiclient.get('/api/firm-profile/')
    return res.data
  },

  async updateFirmProfile(data: Partial<FirmProfile>): Promise<FirmProfile> {
    const res = await apiclient.put('/api/firm-profile/', data)
    return res.data
  },

  async getTemplates(): Promise<PDFTemplate[]> {
    const res = await apiclient.get('/api/templates/')
    return res.data
  },

  async generateSlogan(payload: {
    user_answers: Record<string, unknown>
    firm_profile: Record<string, unknown>
  }): Promise<{ slogan: string }> {
    const res = await apiclient.post('/api/generate-slogan/', payload)
    return res.data
  },
}

/* =======================
   EXPORTS
======================= */

// ✅ keep default export (do NOT break existing imports)
export default dashboardApi

// ✅ add named export (fixes TS2305 errors)
export { dashboardApi }
