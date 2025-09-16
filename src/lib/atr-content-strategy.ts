// Стратегия контента для рынков АТР
export interface ATRContentGenre {
  id: string;
  name: string;
  displayName: Record<string, string>;
  region: string[];
  popularity: number; // 1-100
  marketSize: string;
  keyArtists: string[];
  characteristics: string[];
  targetAudience: string[];
  monetizationPotential: 'high' | 'medium' | 'low';
}

export interface ATRContentStrategy {
  region: string;
  primaryGenres: ATRContentGenre[];
  secondaryGenres: ATRContentGenre[];
  contentMix: {
    local: number; // percentage
    international: number;
    regional: number;
  };
  languageDistribution: Record<string, number>;
  platformPreferences: string[];
  consumptionPatterns: {
    peakHours: string[];
    preferredDevices: string[];
    socialFeatures: string[];
  };
}

export const ATR_GENRES: ATRContentGenre[] = [
  // Восточная Азия
  {
    id: 'c-pop',
    name: 'C-pop',
    displayName: {
      'zh-CN': '华语流行',
      'zh-TW': '華語流行',
      'en': 'Chinese Pop',
      'ja': '中国ポップ',
      'ko': '중국 팝'
    },
    region: ['China', 'Taiwan', 'Singapore', 'Malaysia'],
    popularity: 95,
    marketSize: '$2.8B',
    keyArtists: ['周杰伦', '邓紫棋', '林俊杰', '王嘉尔'],
    characteristics: ['Melodic', 'Emotional', 'Ballad-heavy', 'Mandarin lyrics'],
    targetAudience: ['18-35', 'Urban', 'Middle-class'],
    monetizationPotential: 'high'
  },
  {
    id: 'j-pop',
    name: 'J-pop',
    displayName: {
      'ja': 'J-POP',
      'en': 'Japanese Pop',
      'zh-CN': '日本流行',
      'ko': '제이팝'
    },
    region: ['Japan'],
    popularity: 90,
    marketSize: '$1.2B',
    keyArtists: ['嵐', 'AKB48', 'Perfume', 'ONE OK ROCK'],
    characteristics: ['Catchy', 'Visual', 'Idol culture', 'Diverse subgenres'],
    targetAudience: ['13-30', 'Fashion-conscious', 'Tech-savvy'],
    monetizationPotential: 'high'
  },
  {
    id: 'k-pop',
    name: 'K-pop',
    displayName: {
      'ko': '케이팝',
      'en': 'Korean Pop',
      'zh-CN': '韩流音乐',
      'ja': 'K-POP',
      'th': 'เค-ป็อป',
      'vi': 'K-pop'
    },
    region: ['South Korea', 'Global'],
    popularity: 98,
    marketSize: '$3.1B',
    keyArtists: ['BTS', 'BLACKPINK', 'TWICE', 'NewJeans'],
    characteristics: ['High production', 'Choreography', 'Global appeal', 'Fan culture'],
    targetAudience: ['12-35', 'Global', 'Social media active'],
    monetizationPotential: 'high'
  },

  // Юго-Восточная Азия
  {
    id: 'bollywood',
    name: 'Bollywood',
    displayName: {
      'hi': 'बॉलीवुड संगीत',
      'en': 'Bollywood Music',
      'zh-CN': '宝莱坞音乐',
      'ja': 'ボリウッド音楽'
    },
    region: ['India', 'Global'],
    popularity: 85,
    marketSize: '$1.8B',
    keyArtists: ['A.R. Rahman', 'Shreya Ghoshal', 'Arijit Singh', 'Neha Kakkar'],
    characteristics: ['Cinematic', 'Diverse languages', 'Fusion', 'Emotional'],
    targetAudience: ['All ages', 'Family-oriented', 'Diaspora'],
    monetizationPotential: 'high'
  },
  {
    id: 'dangdut',
    name: 'Dangdut',
    displayName: {
      'id': 'Dangdut',
      'en': 'Dangdut',
      'zh-CN': '当杜特',
      'ja': 'ダンドゥット'
    },
    region: ['Indonesia'],
    popularity: 80,
    marketSize: '$0.3B',
    keyArtists: ['Roma Irama', 'Inul Daratista', 'Rhoma Irama', 'Elvy Sukaesih'],
    characteristics: ['Traditional fusion', 'Danceable', 'Local language', 'Religious themes'],
    targetAudience: ['25-50', 'Traditional', 'Rural-urban'],
    monetizationPotential: 'medium'
  },
  {
    id: 'luk-thung',
    name: 'Luk Thung',
    displayName: {
      'th': 'ลูกทุ่ง',
      'en': 'Luk Thung',
      'zh-CN': '泰国民谣',
      'ja': 'ルークトゥン'
    },
    region: ['Thailand'],
    popularity: 75,
    marketSize: '$0.2B',
    keyArtists: ['Poompuang Duangjan', 'Siriporn Ampaipong', 'Yodrak Salakjai'],
    characteristics: ['Country-style', 'Thai language', 'Rural themes', 'Emotional'],
    targetAudience: ['30-60', 'Rural', 'Traditional'],
    monetizationPotential: 'medium'
  },
  {
    id: 'v-pop',
    name: 'V-pop',
    displayName: {
      'vi': 'V-pop',
      'en': 'Vietnamese Pop',
      'zh-CN': '越南流行',
      'ja': 'ベトナムポップ'
    },
    region: ['Vietnam'],
    popularity: 70,
    marketSize: '$0.4B',
    keyArtists: ['Sơn Tùng M-TP', 'Hòa Minzy', 'Đen Vâu', 'Suboi'],
    characteristics: ['Modern', 'Hip-hop influence', 'Vietnamese language', 'Youth-oriented'],
    targetAudience: ['15-30', 'Urban', 'Tech-savvy'],
    monetizationPotential: 'medium'
  },
  {
    id: 'opm',
    name: 'OPM',
    displayName: {
      'tl': 'Original Pilipino Music',
      'en': 'OPM',
      'zh-CN': '菲律宾原创音乐',
      'ja': 'フィリピンオリジナル音楽'
    },
    region: ['Philippines'],
    popularity: 65,
    marketSize: '$0.3B',
    keyArtists: ['Sarah Geronimo', 'Moira Dela Torre', 'Ben&Ben', 'IV of Spades'],
    characteristics: ['Emotional', 'Ballad-heavy', 'Tagalog/English', 'Romantic'],
    targetAudience: ['18-40', 'Family-oriented', 'Emotional'],
    monetizationPotential: 'medium'
  },
  {
    id: 'malay-pop',
    name: 'Malay Pop',
    displayName: {
      'ms': 'Pop Melayu',
      'en': 'Malay Pop',
      'zh-CN': '马来流行',
      'ja': 'マレーシアポップ'
    },
    region: ['Malaysia', 'Singapore', 'Brunei'],
    popularity: 60,
    marketSize: '$0.2B',
    keyArtists: ['Siti Nurhaliza', 'Yuna', 'Faizal Tahir', 'Dayang Nurfaizah'],
    characteristics: ['Melodic', 'Malay language', 'Contemporary', 'Cultural fusion'],
    targetAudience: ['20-45', 'Multi-cultural', 'Urban'],
    monetizationPotential: 'medium'
  },

  // Океания
  {
    id: 'aussie-rock',
    name: 'Aussie Rock',
    displayName: {
      'en-AU': 'Australian Rock',
      'en': 'Aussie Rock',
      'zh-CN': '澳洲摇滚',
      'ja': 'オーストラリアロック'
    },
    region: ['Australia'],
    popularity: 55,
    marketSize: '$0.4B',
    keyArtists: ['AC/DC', 'INXS', 'Crowded House', 'Tame Impala'],
    characteristics: ['Alternative', 'Indie', 'Rock', 'Unique sound'],
    targetAudience: ['20-50', 'Alternative', 'Music enthusiasts'],
    monetizationPotential: 'medium'
  }
];

export const ATR_CONTENT_STRATEGIES: ATRContentStrategy[] = [
  {
    region: 'East Asia',
    primaryGenres: ATR_GENRES.filter(g => ['c-pop', 'j-pop', 'k-pop'].includes(g.id)),
    secondaryGenres: ATR_GENRES.filter(g => ['bollywood', 'v-pop'].includes(g.id)),
    contentMix: {
      local: 60,
      international: 25,
      regional: 15
    },
    languageDistribution: {
      'zh-CN': 40,
      'ja': 25,
      'ko': 20,
      'en': 15
    },
    platformPreferences: ['Mobile apps', 'Streaming', 'Social media', 'Music videos'],
    consumptionPatterns: {
      peakHours: ['19:00-23:00', '12:00-14:00'],
      preferredDevices: ['Smartphone', 'Laptop', 'Tablet'],
      socialFeatures: ['Sharing', 'Comments', 'Playlists', 'Live streaming']
    }
  },
  {
    region: 'Southeast Asia',
    primaryGenres: ATR_GENRES.filter(g => ['bollywood', 'dangdut', 'luk-thung', 'v-pop', 'opm', 'malay-pop'].includes(g.id)),
    secondaryGenres: ATR_GENRES.filter(g => ['k-pop', 'c-pop'].includes(g.id)),
    contentMix: {
      local: 70,
      international: 20,
      regional: 10
    },
    languageDistribution: {
      'hi': 25,
      'id': 20,
      'th': 15,
      'vi': 12,
      'tl': 10,
      'ms': 8,
      'en': 10
    },
    platformPreferences: ['Mobile apps', 'Social media', 'Free streaming', 'Video platforms'],
    consumptionPatterns: {
      peakHours: ['18:00-22:00', '07:00-09:00'],
      preferredDevices: ['Smartphone', 'Feature phone'],
      socialFeatures: ['Sharing', 'Comments', 'User-generated content', 'Community features']
    }
  },
  {
    region: 'Oceania',
    primaryGenres: ATR_GENRES.filter(g => ['aussie-rock'].includes(g.id)),
    secondaryGenres: ATR_GENRES.filter(g => ['k-pop', 'c-pop', 'j-pop'].includes(g.id)),
    contentMix: {
      local: 30,
      international: 50,
      regional: 20
    },
    languageDistribution: {
      'en-AU': 80,
      'en': 15,
      'other': 5
    },
    platformPreferences: ['Streaming services', 'Mobile apps', 'Desktop', 'Smart speakers'],
    consumptionPatterns: {
      peakHours: ['17:00-21:00', '08:00-10:00'],
      preferredDevices: ['Smartphone', 'Desktop', 'Smart speaker'],
      socialFeatures: ['Playlists', 'Sharing', 'Reviews', 'Discovery']
    }
  }
];

export const getContentStrategyByRegion = (region: string): ATRContentStrategy | undefined => {
  return ATR_CONTENT_STRATEGIES.find(strategy => strategy.region === region);
};

export const getGenresByRegion = (region: string): ATRContentGenre[] => {
  const strategy = getContentStrategyByRegion(region);
  if (!strategy) return [];
  
  return [...strategy.primaryGenres, ...strategy.secondaryGenres];
};

export const getGenreById = (id: string): ATRContentGenre | undefined => {
  return ATR_GENRES.find(genre => genre.id === id);
};

export const getGenreDisplayName = (genreId: string, language: string): string => {
  const genre = getGenreById(genreId);
  if (!genre) return genreId;
  
  return genre.displayName[language] || genre.name;
};

export const getRecommendedContentMix = (region: string, userPreferences?: string[]): ATRContentGenre[] => {
  const strategy = getContentStrategyByRegion(region);
  if (!strategy) return [];
  
  let recommended = [...strategy.primaryGenres];
  
  if (userPreferences) {
    const preferredGenres = strategy.secondaryGenres.filter(genre => 
      userPreferences.some(pref => 
        genre.characteristics.some(char => 
          char.toLowerCase().includes(pref.toLowerCase())
        )
      )
    );
    recommended = [...recommended, ...preferredGenres];
  }
  
  return recommended.sort((a, b) => b.popularity - a.popularity);
};
