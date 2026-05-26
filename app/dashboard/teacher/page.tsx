'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Student = { id: string; full_name: string }
type Assignment = {
  id: string; title: string; description: string;
  period: string; due_date: string; student_id: string;
  profiles: { full_name: string }
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [teacherName, setTeacherName] = useState('')
  const [form, setForm] = useState({
    studentId: '', title: '', description: '', period: '', dueDate: ''
  })
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // Профиль учителя
      const { data: profile } = await supabase
        .from('profiles').select('full_name, role').eq('id', user.id).single()
      if (profile?.role !== 'teacher') return router.push('/login')
      setTeacherName(profile.full_name)

      // Список студентов
      const { data: studs } = await supabase
        .from('profiles').select('id, full_name').eq('role', 'student')
      setStudents(studs || [])

      // Выданные задания
      const { data: assigns } = await supabase
        .from('assignments')
        .select('*, profiles!assignments_student_id_fkey(full_name)')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
      setAssignments(assigns || [])
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('assignments').insert({
      title: form.title,
      description: form.description,
      student_id: form.studentId,
      teacher_id: user!.id,
      period: form.period,
      due_date: form.dueDate || null
    })

    if (!error) {
      setSuccess('Задание успешно выдано!')
      setForm({ studentId: '', title: '', description: '', period: '', dueDate: '' })
      setTimeout(() => setSuccess(''), 3000)
      // Обновляем список
      const { data: assigns } = await supabase
        .from('assignments')
        .select('*, profiles!assignments_student_id_fkey(full_name)')
        .eq('teacher_id', user!.id)
        .order('created_at', { ascending: false })
      setAssignments(assigns || [])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-indigo-600">📚 УчёбаПлюс</h1>
          <p className="text-sm text-gray-500">Кабинет учителя — {teacherName}</p>
        </div>
        <button onClick={handleLogout}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
          Выйти
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Форма выдачи задания */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Выдать задание</h2>
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Студент</label>
              <select required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.studentId}
                onChange={e => setForm({...form, studentId: e.target.value})}>
                <option value="">Выберите студента...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название задания</label>
              <input type="text" required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Например: Решить задачи 1-5"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea required rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Подробное описание задания..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Период</label>
                <input type="text" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Май 2025"
                  value={form.period}
                  onChange={e => setForm({...form, period: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Срок сдачи</label>
                <input type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.dueDate}
                  onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
              {loading ? 'Отправка...' : 'Выдать задание'}
            </button>
          </form>
        </div>

        {/* Список студентов */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Студенты ({students.length})
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {students.length === 0 && (
              <p className="text-gray-400 text-center py-4">Студентов пока нет</p>
            )}
            {students.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {s.full_name[0]}
                </div>
                <span className="text-gray-700">{s.full_name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Выданные задания */}
        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Выданные задания ({assignments.length})
          </h2>
          <div className="space-y-3">
            {assignments.length === 0 && (
              <p className="text-gray-400 text-center py-8">Заданий пока не выдано</p>
            )}
            {assignments.map(a => (
              <div key={a.id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{a.description}</p>
                  </div>
                  <div className="text-right text-sm">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">{a.period}</span>
                    <p className="text-gray-400 mt-1">→ {a.profiles?.full_name}</p>
                    {a.due_date && <p className="text-gray-400">до {new Date(a.due_date).toLocaleDateString('ru-RU')}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}