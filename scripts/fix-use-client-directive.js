#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fix 'use client' directive placement in all files
 * 'use client' must be the first statement in the file
 */

const files = [
  'src/hooks/use-stats.ts',
  'src/hooks/use-ton-wallet.ts',
  'src/contexts/ton-connect-context.tsx',
  'src/hooks/use-telegram-stars.ts',
  'src/contexts/telegram-context.tsx',
  'src/contexts/i18n-context.tsx',
  'src/components/ai/ai-recommendations.tsx',
  'src/components/music/music-dashboard.tsx',
  'src/components/ui/performance-optimizer.tsx',
  'src/components/user/user-overview.tsx',
  'src/components/wallet/recovery-ui.tsx',
  'src/components/wallet/ton-wallet-info.tsx',
  'src/components/wallet/wallet-connect.tsx',
  'src/components/wallet/wallet-provider.tsx',
  'src/components/wallet/ton-wallet-overview.tsx',
  'src/components/wallet/ton-wallet-connect.tsx',
  'src/components/wallet/staking-manager.tsx',
  'src/components/wallet/music-nft-manager.tsx',
  'src/components/wallet/ndt-manager.tsx',
  'src/components/user/user-dashboard.tsx',
  'src/components/transactions/transaction-details.tsx',
  'src/components/telegram/telegram-stars-display.tsx',
  'src/components/telegram/telegram-stars-wallet.tsx',
  'src/components/telegram/telegram-user-profile.tsx',
  'src/components/telegram/telegram-user-card.tsx',
  'src/components/telegram/telegram-stars-info.tsx',
  'src/components/telegram/advanced/telegram-features.tsx',
  'src/components/rewards/referral-system.tsx',
  'src/components/recommendations/recommendation-engine.tsx',
  'src/components/payment/ton-payment-button.tsx',
  'src/components/payment/ton-connect-button.tsx',
  'src/components/payment/telegram-stars-button.tsx',
  'src/components/payment/payment-history.tsx',
  'src/components/integrations/music-services-integration.tsx',
  'src/components/nft/nft-marketplace.tsx',
  'src/components/grave/GraveyardGrid.tsx',
  'src/components/grave/MemorialCard.tsx',
  'src/components/gamification/secret-progress-bar.tsx',
  'src/components/grave/GraveDonateButton.tsx',
  'src/components/grave/digital-legacy-system.tsx',
  'src/components/grave/CreateMemorialModal.tsx',
  'src/components/dex/advanced-dashboard.tsx',
  'src/components/dex/dual-currency-system.tsx',
  'src/components/clubs/club-nft-system.tsx',
  'src/components/chat/chat-matrix.tsx',
  'src/components/atr/ATRPaymentMethods.tsx',
  'src/components/audio/optimized-audio-player.tsx',
  'src/components/audio/audio-player.tsx',
  'src/components/anti-pirate/anti-pirate-system.tsx',
  'src/app/nft/[id]/page.tsx',
  'src/app/upload/page.tsx',
  'src/app/tracks/page.tsx',
  'src/app/tracks/[id]/page.tsx',
  'src/app/demo/secret-progress/page.tsx',
  'src/app/grave/mini-app/page.tsx',
  'src/app/auth/signup/page.tsx',
  'src/app/auth/signin/page.tsx',
  'src/app/atr-demo/page.tsx',
  'src/app/admin/monitoring/page.tsx',
];

function fixFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');

    // Check if file has 'use client'
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      console.log(`ℹ️  No 'use client' in: ${filePath}`);
      return true;
    }

    // Remove 'use client' from anywhere in the file
    const useClientRegex = /^\s*['"]use client['"]\s*\n?/gm;
    content = content.replace(useClientRegex, '');

    // Add 'use client' at the very top
    content = "'use client'\n\n" + content;

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`❌ Error fixing ${filePath}:`, err.message);
    return false;
  }
}

console.log('🔧 Fixing "use client" directive placement...\n');

let fixed = 0;
let failed = 0;

files.forEach((file) => {
  if (fixFile(file)) {
    fixed++;
  } else {
    failed++;
  }
});

console.log(`\n✨ Done! Fixed: ${fixed}, Failed: ${failed}`);
