import { supabase } from '../lib/supabaseClient'

export interface Project {
  id?: string
  client_id: string
  title: string
  type: 'music' | 'video'
  progress: number
  preview_url?: string
  final_url?: string
  is_paid: boolean
  created_at?: string
  client_name?: string // Virtual field from join
}

export const projectService = {
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:client_id (full_name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data.map(p => ({
      ...p,
      client_name: p.profiles?.full_name || 'Desconocido'
    })) as Project[]
  },

  async getClientProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Project[]
  },

  async createProject(project: Project) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateProject(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getClients() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'cliente')
    
    if (error) throw error
    return data
  }
}
