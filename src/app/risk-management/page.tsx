// src/app/risk-management/page.tsx
export default function RiskManagementPage() {
  return (
    <main className="max-w-4xl mx-auto p-8 text-sm text-neutral-100 bg-[#0a0a0a]">
      <h1 className="text-2xl font-bold mb-2">🛡️ План минимизации рисков NORMAL DANCE 2025</h1>
      <p className="text-neutral-400 mb-6">4-ступенчатая модель страховки • Анти-хрупкая архитектура</p>

      <section className="mb-6">
        <h2 className="font-semibold uppercase tracking-wide text-neutral-300 mb-2">1. Стратегические реформы</h2>
        <table className="w-full text-left text-neutral-200">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="pb-2">Ступень</th>
              <th>Реформа</th>
              <th>Действия</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="py-1">1. Организационная</td><td>«Гибкая ячейка»</td><td>3 автономные Squads</td><td>↓ риск простоя на 40%</td></tr>
            <tr><td className="py-1">2. Финансовая</td><td>«Мульти-резерв»</td><td>3 банка + USDT кошелёк</td><td>↓ валютные потери до 5%</td></tr>
            <tr><td className="py-1">3. Технологическая</td><td>«Полигон-фоллбэк»</td><td>Polygon + Solana</td><td>↓ блокчейн-риски на 60%</td></tr>
            <tr><td className="py-1">4. Рыночная</td><td>«Локальный якорь»</td><td>30% бюджета на русскоязычных</td><td>↓ отток пользователей на 25%</td></tr>
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold uppercase tracking-wide text-neutral-300 mb-2">2. Тактические меры по ключевым рискам</h2>
        
        <div className="mb-4">
          <h3 className="font-semibold text-neutral-300 mb-2">2.1 Удержание талантов (High Impact / High Probability)</h3>
          <div className="bg-neutral-800 p-4 rounded text-neutral-200 text-xs">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Golden Handcuffs 2.0:</strong> 15% годового дохода в токенах NORMAL с 1-year cliff</li>
              <li><strong>Виртуальный Офис + Номад:</strong> работа из 5 стран без потери статуса</li>
              <li><strong>Карьерный лифт за 90 дней:</strong> квартальные хакатоны → повышение грейда</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-neutral-300 mb-2">2.2 Технические сбои (Medium Probability / High Impact)</h3>
          <div className="bg-neutral-800 p-4 rounded text-neutral-200 text-xs">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Chaos Engineering Fridays:</strong> Netflix-style «Chaos Monkey» на стейдже</li>
              <li><strong>SRE-бюджет 8%:</strong> автоматизация и мониторинг (Prometheus + PagerDuty)</li>
              <li><strong>Договор SLA 99.9%:</strong> компенсация в NFT при нарушении</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-neutral-300 mb-2">2.3 Регуляторные изменения (Medium Probability / High Impact)</h3>
          <div className="bg-neutral-800 p-4 rounded text-neutral-200 text-xs">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Юридический Radar:</strong> подписка на Bot-канал Минцифры + ежемесячный аудит</li>
              <li><strong>Двойная структура:</strong> ООО «Нормал Дэнс РУ» + DAO «NORMAL LATAM» (Панама)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold uppercase tracking-wide text-neutral-300 mb-2">3. Финансовые инструменты хеджирования</h2>
        <table className="w-full text-left text-neutral-200">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="pb-2">Риск</th>
              <th>Инструмент</th>
              <th>Параметры</th>
              <th>Премия (₽/год)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="py-1">Курс USD/RUB</td><td>Опцион «колл-спрэд»</td><td>Strike 90-100 ₽, 6 мес</td><td>420,000</td></tr>
            <tr><td className="py-1">Индекс крипто-страха</td><td>Перпетуал «Short Vol»</td><td>5% портфеля USDT</td><td>600,000</td></tr>
            <tr><td className="py-1">Инфляция оборудования</td><td>Форвард-контракты</td><td>Apple & Dell до Q2 2025</td><td>350,000</td></tr>
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold uppercase tracking-wide text-neutral-300 mb-2">4. Операционные чек-листы</h2>
        
        <div className="mb-4">
          <h3 className="font-semibold text-neutral-300 mb-2">Day-0 (Pre-launch)</h3>
          <div className="bg-green-900/20 border border-green-500/30 p-4 rounded text-green-200 text-xs">
            <ul className="list-disc list-inside space-y-1">
              <li>✅ Код в 3 репозиториях (GitHub + GitLab + Bitbucket)</li>
              <li>✅ Тестовые 10,000 USDT на аварийном кошельке Gnosis Safe 3-of-5</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-neutral-300 mb-2">Day-1 (Launch Week)</h3>
          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded text-yellow-200 text-xs">
            <ul className="list-disc list-inside space-y-1">
              <li>✅ «Red button» — мгновенный откат деплоя через Helm rollback 60 сек</li>
              <li>✅ Публичный статус-страница (status.normaldance.io) на Netlify + DNS-failover</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-neutral-300 mb-2">Day-2 (Post-launch)</h3>
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded text-blue-200 text-xs">
            <ul className="list-disc list-inside space-y-1">
              <li>✅ «Runbook-as-Code» в Notion: 50 типовых инцидентов → 1-click решения</li>
              <li>✅ Еженедельный «Failure Game Day»: рандомный инженер ломает прод, команда чинит</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold uppercase tracking-wide text-neutral-300 mb-2">5. Реформа бюджета: «Anti-Fragile Pie»</h2>
        <table className="w-full text-left text-neutral-200">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="pb-2">Категория</th>
              <th>Старый %</th>
              <th>Новый %</th>
              <th>Реформа</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="py-1">Персонал</td><td>73.4%</td><td>65%</td><td>10% → токен-бонусы, 5% → аутсорс</td></tr>
            <tr><td className="py-1">Маркетинг</td><td>7.3%</td><td>9%</td><td>50% → performance, 30% → партнёрства</td></tr>
            <tr><td className="py-1">Оборудование</td><td>9.2%</td><td>8%</td><td>IaaC + аренда GPU вместо покупки</td></tr>
            <tr><td className="py-1">Резерв</td><td>18%</td><td>18%</td><td>3 «кубика»: Tech, Market, Regulation</td></tr>
          </tbody>
        </table>
        <div className="mt-2 text-xs text-neutral-400">
          <p><strong>Итоговый бюджет:</strong> 109 млн ₽ (не меняется)</p>
          <p><strong>Устойчивость:</strong> ↑ на 35%</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold uppercase tracking-wide text-neutral-300 mb-2">6. Метрики контроля «0-30-60-90»</h2>
        <table className="w-full text-left text-neutral-200">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="pb-2">День</th>
              <th>Метрика</th>
              <th>Порог тревоги</th>
              <th>Ответственный</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="py-1">0</td><td>% тестов покрытия</td><td>< 80%</td><td>Lead QA</td></tr>
            <tr><td className="py-1">30</td><td>Churn dev-team</td><td>> 5%</td><td>HR-Director</td></tr>
            <tr><td className="py-1">60</td><td>CAC vs LTV</td><td>> 1:3</td><td>Head of Growth</td></tr>
            <tr><td className="py-1">90</td><td>Reg-события</td><td>> 1 кейс</td><td>Legal Counsel</td></tr>
          </tbody>
        </table>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold uppercase tracking-wide text-neutral-300 mb-2">7. Squad Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-neutral-200">
          <div className="bg-neutral-800 p-4 rounded">
            <h3 className="font-semibold text-neutral-300 mb-2">Core Squad</h3>
            <ul className="text-xs space-y-1">
              <li>• Backend разработка</li>
              <li>• Blockchain интеграция</li>
              <li>• Security & Compliance</li>
              <li>• DevOps & Infrastructure</li>
            </ul>
          </div>
          <div className="bg-neutral-800 p-4 rounded">
            <h3 className="font-semibold text-neutral-300 mb-2">Growth Squad</h3>
            <ul className="text-xs space-y-1">
              <li>• Frontend & Mobile</li>
              <li>• Marketing & Acquisition</li>
              <li>• Partnerships & BD</li>
              <li>• Analytics & Data</li>
            </ul>
          </div>
          <div className="bg-neutral-800 p-4 rounded">
            <h3 className="font-semibold text-neutral-300 mb-2">Stability Squad</h3>
            <ul className="text-xs space-y-1">
              <li>• QA & Testing</li>
              <li>• Monitoring & Alerting</li>
              <li>• Risk Management</li>
              <li>• Legal & Finance</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold uppercase tracking-wide text-neutral-300 mb-2">8. Emergency Procedures</h2>
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded text-red-200">
          <h3 className="font-semibold mb-2">«Red Button» Protocol</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li><strong>0-5 мин:</strong> Автоматический rollback через Helm</li>
            <li><strong>5-15 мин:</strong> Активация backup инфраструктуры</li>
            <li><strong>15-30 мин:</strong> Уведомление пользователей через статус-страницу</li>
            <li><strong>30-60 мин:</strong> Root cause analysis и hotfix</li>
            <li><strong>1-4 часа:</strong> Полное восстановление сервиса</li>
          </ol>
        </div>
      </section>

      <section>
        <h2 className="font-semibold uppercase tracking-wide text-neutral-300 mb-2">9. Итог: «Проект-Хамелеон»</h2>
        <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded text-purple-200">
          <p className="font-semibold mb-2">NORMAL DANCE становится анти-хрупким:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Не просто выдерживает шоки, а <strong>выигрывает от них</strong></li>
            <li>Каждая реформа = микро-страховой полис с <strong>ROI ≥ 300%</strong> в первый год</li>
            <li>4-ступенчатая модель страховки покрывает все критические риски</li>
            <li>Автономные Squads обеспечивают непрерывность работы</li>
          </ul>
          <p className="mt-2 text-xs text-purple-300">
            <strong>Next step:</strong> 48-часовой финальный аудит всех процессов + публикация отчёта в блокчейне (IPFS-hash)
          </p>
        </div>
      </section>
    </main>
  );
}
