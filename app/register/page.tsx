'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    const supabase = getSupabase()
    e.preventDefault()
    setLoading(true)


    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, role: form.role }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/${form.role}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Регистрация</h2>
        <p className="text-gray-500 mb-8">Создайте аккаунт для работы с платформой</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
            <input type="text" required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Иван Иванов"
              value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="ivan@example.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input type="password" required minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Минимум 6 символов"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}>
              <option value="student">Студент</option>
              <option value="teacher">Учитель</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
            {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-4">
          Уже есть аккаунт? <Link href="/login" className="text-indigo-600 font-medium">Войти</Link>
        </p>
      </div>
    </div>
  )
}