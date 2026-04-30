import { supabase } from '../lib/supabaseClient'

export interface Transaction {
  id?: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  created_at?: string
}

export const financeService = {
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data as Transaction[]
  },

  async addTransaction(transaction: Transaction) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user.id }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
