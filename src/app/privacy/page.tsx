import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-6 sm:p-10" style={{ background: '#060510' }}>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Назад
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <img src="/forge-logo.svg" alt="Forge" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-white">Политика конфиденциальности</h1>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed"
          style={{ background: '#0d0b18', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-white/40 text-xs">Последнее обновление: апрель 2025</p>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Что мы собираем</h2>
            <p className="text-white/50">При регистрации и использовании Forge мы собираем:</p>
            <ul className="list-disc list-inside space-y-1 text-white/50 ml-2">
              <li>Email адрес и имя</li>
              <li>Записи дневника</li>
              <li>Задачи, расписание и активности</li>
              <li>API ключ Anthropic (если ты его добавляешь)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Где хранятся данные</h2>
            <p className="text-white/50">
              Все данные хранятся в базе данных <span className="text-white/70">Supabase</span> — облачном сервисе с шифрованием данных на уровне инфраструктуры. Данные защищены так, что один пользователь не может получить доступ к данным другого.
            </p>
            <p className="text-white/50">
              Владелец сервиса (разработчик) имеет административный доступ к базе данных.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">AI анализ дневника</h2>
            <p className="text-white/50">
              Если ты используешь функцию психологического профиля, записи дневника передаются в <span className="text-white/70">Anthropic (Claude AI)</span> для обработки. Anthropic не хранит эти данные постоянно и не использует их для обучения моделей.
            </p>
            <p className="text-white/50">
              Анализ происходит только по твоему явному запросу — кнопка "Обновить базу".
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Чего мы не делаем</h2>
            <ul className="list-disc list-inside space-y-1 text-white/50 ml-2">
              <li>Не продаём твои данные</li>
              <li>Не передаём данные третьим лицам (кроме Supabase и Anthropic, указанных выше)</li>
              <li>Не используем данные для рекламы</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Твои права</h2>
            <ul className="list-disc list-inside space-y-1 text-white/50 ml-2">
              <li>Экспортировать свои данные (раздел Профиль)</li>
              <li>Удалить аккаунт и все данные — напиши на <span className="text-white/70">support@forgeyou.dev</span></li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">Контакт</h2>
            <p className="text-white/50">
              Вопросы по конфиденциальности: <span className="text-white/70">support@forgeyou.dev</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
