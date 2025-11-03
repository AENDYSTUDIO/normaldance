export const i18nConfig = {
  locales: ['en', 'ru', 'es', 'fr', 'de', 'zh'],
  defaultLocale: 'en',
  namespaces: ['common', 'audio', 'wallet', 'nft'],
} as const;

export type Locale = typeof i18nConfig.locales[number];
export type Namespace = typeof i18nConfig.namespaces[number];

export const translations = {
  en: {
    common: {
      play: 'Play',
      pause: 'Pause',
      connect_wallet: 'Connect Wallet',
      upload: 'Upload',
    },
    audio: {
      now_playing: 'Now Playing',
      queue: 'Queue',
      volume: 'Volume',
    },
    wallet: {
      balance: 'Balance',
      transaction: 'Transaction',
      confirm: 'Confirm',
    },
    nft: {
      mint: 'Mint NFT',
      collection: 'Collection',
      marketplace: 'Marketplace',
    },
  },
  ru: {
    common: {
      play: 'Играть',
      pause: 'Пауза',
      connect_wallet: 'Подключить кошелек',
      upload: 'Загрузить',
    },
    audio: {
      now_playing: 'Сейчас играет',
      queue: 'Очередь',
      volume: 'Громкость',
    },
    wallet: {
      balance: 'Баланс',
      transaction: 'Транзакция',
      confirm: 'Подтвердить',
    },
    nft: {
      mint: 'Создать NFT',
      collection: 'Коллекция',
      marketplace: 'Маркетплейс',
    },
  },
} as const;