#!/usr/bin/env node

/**
 * Скрипт поиска и привлечения первого артиста
 * Цель: найти первого реального артиста для NORMAL DANCE
 */

const fs = require('fs');
const path = require('path');

// Список потенциальных артистов для outreach
const ARTIST_TARGETS = [
  {
    name: "Indie Music Producers",
    platform: "SoundCloud",
    description: "Независимые продюсеры на SoundCloud",
    searchTerms: ["indie", "electronic", "ambient", "experimental"],
    outreachMessage: `🎵 Привет! Я из NORMAL DANCE - новой Web3 музыкальной платформы.

Мы предлагаем:
• 50% от дохода напрямую артисту
• NFT-франшизы для треков
• Децентрализованное хранение на IPFS
• Глобальная аудитория без посредников

Хочешь стать нашим первым артистом? Это бесплатно и займет 5 минут!

Сайт: http://localhost:3000
Telegram: @normaldance`
  },
  {
    name: "Crypto Music Community",
    platform: "Twitter",
    description: "Крипто-музыкальное сообщество",
    searchTerms: ["cryptomusic", "web3music", "nftmusic", "blockchainmusic"],
    outreachMessage: `🚀 Привет! NORMAL DANCE ищет первых артистов!

Мы создаем первую Web3 музыкальную платформу с:
• Прямыми выплатами артистам (50%)
• NFT-франшизами для треков
• Solana + IPFS технологиями
• Честной экономикой без лейблов

Стань частью музыкальной революции! 

Сайт: http://localhost:3000
#Web3Music #NFTMusic #CryptoMusic`
  },
  {
    name: "Electronic Music Producers",
    platform: "Reddit",
    description: "Сообщество электронной музыки на Reddit",
    searchTerms: ["r/edmproduction", "r/electronicmusic", "r/wearethemusicmakers"],
    outreachMessage: `🎧 Hey fellow producers! 

I'm building NORMAL DANCE - a Web3 music platform that gives artists:
• 50% direct revenue share
• NFT franchises for tracks
• Decentralized storage on IPFS
• Global reach without labels

Looking for our first artists to join the revolution!

Website: http://localhost:3000
No fees, no middlemen, just music!`
  },
  {
    name: "Local Music Scene",
    platform: "Instagram",
    description: "Локальная музыкальная сцена",
    searchTerms: ["#localmusic", "#indieartist", "#newmusic", "#undergroundmusic"],
    outreachMessage: `🎤 Привет! NORMAL DANCE ищет талантливых артистов!

Мы - новая Web3 платформа, которая:
• Платит артистам 50% от дохода
• Создает NFT-франшизы для треков
• Использует блокчейн для честности
• Дает глобальную аудиторию

Хочешь стать нашим первым артистом? Это бесплатно!

Сайт: http://localhost:3000
Telegram: @normaldance`
  }
];

// Создаем план outreach
function createOutreachPlan() {
  console.log('🎵 NORMAL DANCE - План привлечения первого артиста');
  console.log('================================================');
  
  const plan = {
    phase1: {
      name: "Подготовка (1-2 часа)",
      tasks: [
        "Создать аккаунты в социальных сетях",
        "Подготовить демо-материалы",
        "Настроить аналитику",
        "Создать шаблоны сообщений"
      ]
    },
    phase2: {
      name: "Поиск артистов (2-3 часа)",
      tasks: [
        "Найти 50+ потенциальных артистов",
        "Изучить их контент и стиль",
        "Составить список приоритетов",
        "Подготовить персонализированные сообщения"
      ]
    },
    phase3: {
      name: "Outreach (3-4 часа)",
      tasks: [
        "Отправить 20+ сообщений в день",
        "Отвечать на вопросы и комментарии",
        "Предлагать демо-встречи",
        "Отслеживать результаты"
      ]
    },
    phase4: {
      name: "Онбординг (1-2 часа)",
      tasks: [
        "Помочь загрузить первый трек",
        "Настроить NFT-франшизу",
        "Провести тестовую транзакцию",
        "Запустить первую кампанию"
      ]
    }
  };
  
  return plan;
}

// Создаем шаблоны сообщений
function createMessageTemplates() {
  const templates = {
    twitter: {
      short: `🎵 NORMAL DANCE ищет первых артистов! Web3 платформа с 50% дохода артистам. Без лейблов, без посредников. Кто готов к музыкальной революции? 🚀 #Web3Music`,
      medium: `🎵 Привет! Я создаю NORMAL DANCE - Web3 музыкальную платформу.

Что мы предлагаем:
• 50% дохода напрямую артисту
• NFT-франшизы для треков  
• Децентрализованное хранение
• Глобальная аудитория

Хочешь стать нашим первым артистом? Это бесплатно!

Сайт: http://localhost:3000
#Web3Music #NFTMusic #CryptoMusic`
    },
    telegram: {
      personal: `🎵 Привет! Я из NORMAL DANCE - новой Web3 музыкальной платформы.

Мы предлагаем артистам:
• 50% от дохода напрямую
• NFT-франшизы для треков
• Децентрализованное хранение на IPFS
• Глобальную аудиторию без посредников

Хочешь стать нашим первым артистом? Это бесплатно и займет 5 минут!

Сайт: http://localhost:3000
Telegram: @normaldance`
    },
    email: {
      subject: "🎵 NORMAL DANCE - Приглашение стать первым артистом",
      body: `Привет!

Меня зовут [ИМЯ], я создаю NORMAL DANCE - первую Web3 музыкальную платформу.

Мы ищем талантливых артистов, которые хотят:
• Получать 50% дохода напрямую (без лейблов)
• Создавать NFT-франшизы для своих треков
• Использовать блокчейн для честности
• Достигать глобальной аудитории

NORMAL DANCE уже работает:
• Продакшен сервер: http://localhost:3000
• Smart-contracts готовы
• IPFS интеграция настроена
• 0 пользователей (честный старт)

Хочешь стать нашим первым артистом? Это бесплатно!

С уважением,
[ИМЯ]
NORMAL DANCE Team`
    }
  };
  
  return templates;
}

// Создаем список потенциальных артистов
function createArtistList() {
  const artists = [
    {
      name: "SoundCloud Indie Artists",
      platform: "SoundCloud",
      searchUrl: "https://soundcloud.com/search/people?q=indie%20electronic",
      priority: "high",
      notes: "Активные независимые артисты"
    },
    {
      name: "Twitter Crypto Music",
      platform: "Twitter",
      searchUrl: "https://twitter.com/search?q=%23cryptomusic%20OR%20%23web3music",
      priority: "high",
      notes: "Крипто-музыкальное сообщество"
    },
    {
      name: "Reddit EDM Producers",
      platform: "Reddit",
      searchUrl: "https://reddit.com/r/edmproduction",
      priority: "medium",
      notes: "Сообщество продюсеров"
    },
    {
      name: "Instagram Local Music",
      platform: "Instagram",
      searchUrl: "https://instagram.com/explore/tags/localmusic/",
      priority: "medium",
      notes: "Локальная музыкальная сцена"
    },
    {
      name: "YouTube Music Channels",
      platform: "YouTube",
      searchUrl: "https://youtube.com/results?search_query=indie+music+producer",
      priority: "low",
      notes: "Музыкальные каналы"
    }
  ];
  
  return artists;
}

// Создаем метрики для отслеживания
function createTrackingMetrics() {
  const metrics = {
    outreach: {
      messagesSent: 0,
      responsesReceived: 0,
      artistsContacted: 0,
      positiveResponses: 0,
      negativeResponses: 0,
      noResponse: 0
    },
    conversion: {
      artistsInterested: 0,
      artistsOnboarded: 0,
      firstTrackUploaded: 0,
      firstRevenue: 0
    },
    timeline: {
      startDate: new Date().toISOString(),
      targetFirstArtist: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней
      targetFirstTrack: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 дней
    }
  };
  
  return metrics;
}

// Главная функция
function main() {
  console.log('🎵 NORMAL DANCE - Стратегия привлечения первого артиста');
  console.log('======================================================');
  
  // Создаем план
  const plan = createOutreachPlan();
  console.log('\n📋 ПЛАН ДЕЙСТВИЙ:');
  Object.entries(plan).forEach(([phase, data]) => {
    console.log(`\n${phase.toUpperCase()}: ${data.name}`);
    data.tasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task}`);
    });
  });
  
  // Создаем шаблоны
  const templates = createMessageTemplates();
  console.log('\n📝 ШАБЛОНЫ СООБЩЕНИЙ:');
  console.log('Twitter (короткое):', templates.twitter.short);
  console.log('\nTelegram (личное):', templates.telegram.personal);
  
  // Создаем список артистов
  const artists = createArtistList();
  console.log('\n🎯 ЦЕЛЕВЫЕ ПЛАТФОРМЫ:');
  artists.forEach((artist, index) => {
    console.log(`${index + 1}. ${artist.name} (${artist.platform}) - ${artist.priority} приоритет`);
    console.log(`   Ссылка: ${artist.searchUrl}`);
    console.log(`   Заметки: ${artist.notes}\n`);
  });
  
  // Создаем метрики
  const metrics = createTrackingMetrics();
  console.log('📊 МЕТРИКИ ДЛЯ ОТСЛЕЖИВАНИЯ:');
  console.log('Outreach:', JSON.stringify(metrics.outreach, null, 2));
  console.log('Conversion:', JSON.stringify(metrics.conversion, null, 2));
  console.log('Timeline:', JSON.stringify(metrics.timeline, null, 2));
  
  // Сохраняем все в файлы
  const outputDir = 'outreach-materials';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'outreach-plan.json'),
    JSON.stringify(plan, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'message-templates.json'),
    JSON.stringify(templates, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'artist-targets.json'),
    JSON.stringify(artists, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'tracking-metrics.json'),
    JSON.stringify(metrics, null, 2)
  );
  
  console.log('\n💾 Материалы сохранены в папку outreach-materials/');
  
  console.log('\n🎯 СЛЕДУЮЩИЕ ШАГИ:');
  console.log('1. Откройте outreach-materials/ и изучите материалы');
  console.log('2. Начните с высокоприоритетных платформ');
  console.log('3. Отправляйте 20+ сообщений в день');
  console.log('4. Отслеживайте результаты в tracking-metrics.json');
  console.log('5. Цель: первый артист в течение 7 дней!');
  
  console.log('\n🚀 УДАЧИ! Первый артист ждет вас!');
}

// Запускаем
if (require.main === module) {
  main();
}

module.exports = {
  createOutreachPlan,
  createMessageTemplates,
  createArtistList,
  createTrackingMetrics
};
