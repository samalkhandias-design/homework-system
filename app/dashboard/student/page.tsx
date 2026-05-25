'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Assignment = {
  id: string; title: string; description: string;
  period: string; due_date: string; is_completed: boolean
}

export default function StudentDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [studentName, setStudentName] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('Все')
  const [periods, setPeriods] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profile } = await supabase
        .from('profiles').select('full_name, role').eq('id', user.id).single()
      if (profile?.role !== 'student') return router.push('/login')
      setStudentName(profile.full_name)

      const { data: assigns } = await supabase
        .from('assignments')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (assigns) {
        setAssignments(assigns)
        const uniquePeriods = [...new Set(assigns.map(a => a.period))]
        setPeriods(uniquePeriods)
      }
    }
    load()
  }, [])

  const handleToggleComplete = async (id: string, current: boolean) => {
    await supabase.from('assignments').update({ is_completed: !current }).eq('id', id)
    setAssignments(prev => prev.map(a => a.id === id ? {...a, is_completed: !current} : a))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const filtered = selectedPeriod === 'Все'
    ? assignments
    : assignments.filter(a => a.period === selectedPeriod)

  const completed = filtered.filter(a => a.is_completed).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-indigo-600">📚 УчёбаПлюс</h1>
          <p className="text-sm text-gray-500">Мои задания — {studentName}</p>
        </div>
        <button onClick={handleLogout}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
          Выйти
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Всего заданий', value: filtered.length, color: 'text-gray-800' },
            { label: 'Выполнено', value: completed, color: 'text-green-600' },
            { label: 'Осталось', value: filtered.length - completed, color: 'text-orange-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Фильтр по периодам */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['Все', ...periods].map(p => (
            <button key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedPeriod === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200'
              }`}>
              {p}
            </button>
          ))}
        </div>

        {/* Список заданий */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-gray-500">Заданий нет. Отдыхай!</p>
            </div>
          )}
          {filtered.map(a => (
            <div key={a.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 transition ${
                a.is_completed ? 'border-green-400 opacity-70' : 'border-indigo-400'
              }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${a.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {a.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{a.description}</p>
                  <div className="flex gap-3 mt-3 text-sm">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">{a.period}</span>
                    {a.due_date && (
                      <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">
                        до {new Date(a.due_date).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleComplete(a.id, a.is_completed)}
                  className={`ml-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                    a.is_completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  }`}>
                  {a.is_completed && '✓'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}