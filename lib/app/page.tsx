import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Навигация */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-600">📚 УчёбаПлюс</h1>
        <div className="flex gap-4">
          <Link href="/login"
            className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition">
            Войти
          </Link>
          <Link href="/register"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Регистрация
          </Link>
        </div>
      </nav>

      {/* Герой-секция */}
      <section className="text-center py-24 px-4">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">
          Управление домашними заданиями<br />
          <span className="text-indigo-600">стало проще</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Платформа для колледжей, где учителя легко выдают задания,
          а студенты всегда знают что нужно сделать и когда.
        </p>
        <Link href="/register"
          className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-xl hover:bg-indigo-700 transition shadow-lg">
          Начать бесплатно →
        </Link>
      </section>

      {/* Фичи */}
      <section className="py-16 px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '👩‍🏫', title: 'Для учителей', desc: 'Выдавайте задания студентам в несколько кликов. Отслеживайте прогресс.' },
            { icon: '🎓', title: 'Для студентов', desc: 'Видите все свои задания по периодам. Ничего не потеряется.' },
            { icon: '🔒', title: 'Безопасно', desc: 'Каждый видит только своё. Данные надёжно защищены.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}