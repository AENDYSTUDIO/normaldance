import { SecureLogger } from '@/lib/security/secure-logger';
import { Telegraf, Context, Middleware } from 'telegraf'
import { Update, Message, CallbackQuery, PreCheckoutQuery, SuccessfulPayment } from 'telegraf/types'
import { BrowserProvider, ethers } from 'ethers'

// Types
interface TelegramUser {
  id: number
  first_name: string
  username?: string
  is_bot: boolean
}

interface GraveUser {
  telegramId: number
  username?: string
  walletAddress?: string
  memorials: string[]
  createdAt: Date
}

interface PaymentData {
  memorialId: string
  amount: number
  currency: string
  donorName: string
}

// Initialize Bot
const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set')
}

const bot = new Telegraf<Context<Update>>(token)
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://yourdomain.com/grave'

// Middleware for logging
bot.use((ctx, next) => {
  SecureLogger.log(`[Telegram] ${ctx.from?.username || ctx.from?.id} - ${ctx.update.update_id}`)
  return next()
})

// Error handling
bot.catch((err, ctx) => {
  SecureLogger.error(`[Telegram Error] ${err}`)
  ctx.reply('❌ An error occurred. Please try again later.')
})

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

// /start command
bot.start(async (ctx) => {
  const user = ctx.from as TelegramUser

  const welcomeText = `
🪦 **Welcome to G.rave** 🕯️

The eternal memorial for musicians.

Here you can:
• 🪦 Create a digital memorial for artists
• 💰 Light candles (make donations)
• 👥 Support bereaved families
• ♾️ Keep memories forever

Ready to begin?
  `.trim()

  await ctx.reply(welcomeText, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🪦 Open G.rave',
            web_app: { url: MINI_APP_URL }
          }
        ],
        [
          {
            text: '📚 How it works',
            callback_data: 'help'
          },
          {
            text: '⚙️ Settings',
            callback_data: 'settings'
          }
        ],
        [
          {
            text: '🕯️ Light a candle',
            callback_data: 'donate'
          }
        ]
      ]
    }
  })

  SecureLogger.log(`[Telegram] New user: ${user.id} (@${user.username})`)
})

// /help command
bot.command('help', async (ctx) => {
  const helpText = `
📖 **How G.rave Works**

**What is G.rave?**
G.rave is a decentralized platform to create eternal digital memorials for musicians.

**Key Features:**

🪦 **Memorials** - Digital NFT memorials on blockchain
💰 **Donations** - Support through "Candle 27" donations
♾️ **Eternal** - Memory stored forever on IPFS + blockchain
🌍 **Multi-chain** - Ethereum, Polygon, TON, Solana

**How to Create a Memorial:**
1. Click "Open G.rave" button
2. Connect your wallet
3. Upload artist info + IPFS hash
4. Add heirs (up to 10 addresses)
5. Done! Memorial is minted as NFT

**How to Light a Candle:**
1. Find a memorial
2. Donate crypto (ETH, TON, SOL)
3. Leave optional message
4. 98% goes to heirs, 2% to platform

**Distribution:**
• 98% of donations → Beneficiaries
• 2% → Platform maintenance

Questions? Use /contact
  `.trim()

  await ctx.reply(helpText, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '← Back', callback_data: 'back' }]
      ]
    }
  })
})

// /contact command
bot.command('contact', async (ctx) => {
  await ctx.reply('📧 Contact us:\n\n👥 Support: @grave_support\n🐛 Report issues: @grave_dev', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '← Back', callback_data: 'back' }]
      ]
    }
  })
})

// /memorials command
bot.command('memorials', async (ctx) => {
  try {
    const response = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/grave/memorials?limit=5`)
    const data = await response.json()

    if (!data.success || !data.data.memorials.length) {
      await ctx.reply('No memorials found yet. Be the first to create one! 🪦')
      return
    }

    let text = '🪦 **Recent Memorials**\n\n'

    for (const memorial of data.data.memorials.slice(0, 5)) {
      text += `
**${memorial.artistName}**
• Fund: ${memorial.fundBalance} ETH
• Donations: ${memorial.totalDonations || 0}
• Heirs: ${memorial.heirs.length}

`
    }

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🪦 View All',
              web_app: { url: MINI_APP_URL }
            }
          ]
        ]
      }
    })
  } catch (error) {
    SecureLogger.error('Error fetching memorials:', error)
    await ctx.reply('❌ Could not load memorials. Try again later.')
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// CALLBACK QUERIES (Button Handlers)
// ═══════════════════════════════════════════════════════════════════════════

bot.action('help', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.editMessageText(
    `
📖 **How G.rave Works**

🪦 **Memorials** - Digital NFT memorials
💰 **Donations** - Support through candles
♾️ **Eternal** - Forever on blockchain

Ready to start? Open G.rave now!
    `.trim(),
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🪦 Open G.rave',
              web_app: { url: MINI_APP_URL }
            }
          ],
          [{ text: '← Back', callback_data: 'back' }]
        ]
      }
    }
  )
})

bot.action('settings', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.editMessageText(
    `
⚙️ **Settings**

• Language: 🇺🇸 English
• Network: Ethereum
• Notifications: ON

[Settings available in Mini App]
    `.trim(),
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '⚙️ Manage',
              web_app: { url: `${MINI_APP_URL}/settings` }
            }
          ],
          [{ text: '← Back', callback_data: 'back' }]
        ]
      }
    }
  )
})

bot.action('donate', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.editMessageText(
    `
💰 **Light a Candle**

Choose how to support:

🕯️ 0.05 ETH (~$150)
🕯️ 0.1 ETH (~$300)
🕯️ 1 TON (~$2.50)
🕯️ Custom amount

Open G.rave to donate now!
    `.trim(),
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🕯️ Light Candle',
              web_app: { url: `${MINI_APP_URL}/donate` }
            }
          ],
          [{ text: '← Back', callback_data: 'back' }]
        ]
      }
    }
  )
})

bot.action('back', async (ctx) => {
  await ctx.answerCbQuery()
  const user = ctx.from as TelegramUser

  await ctx.editMessageText(
    `
🪦 **Welcome to G.rave** 🕯️

The eternal memorial for musicians.

Ready to begin?
    `.trim(),
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🪦 Open G.rave',
              web_app: { url: MINI_APP_URL }
            }
          ],
          [
            {
              text: '📚 How it works',
              callback_data: 'help'
            },
            {
              text: '⚙️ Settings',
              callback_data: 'settings'
            }
          ],
          [
            {
              text: '🕯️ Light a candle',
              callback_data: 'donate'
            }
          ]
        ]
      }
    }
  )
})

// ═══════════════════════════════════════════════════════════════════════════
// WEB APP MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════════

bot.on('web_app_data', async (ctx) => {
  const webAppData = ctx.webAppData?.data

  if (!webAppData) {
    await ctx.reply('❌ Invalid data received')
    return
  }

  try {
    const data = JSON.parse(webAppData)
    SecureLogger.log('[Telegram] Web App Data:', data)

    if (data.action === 'memorial_created') {
      await ctx.reply(
        `
✅ **Memorial Created!**

🪦 **${data.artistName}**
• IPFS: \`${data.ipfsHash.substring(0, 20)}...\`
• Heirs: ${data.heirs.length}
• Fund: ${data.fundBalance} ETH

The memorial is now eternal on the blockchain! 🕯️
        `.trim(),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '👁️ View',
                  web_app: { url: `${MINI_APP_URL}/memorial/${data.memorialId}` }
                }
              ]
            ]
          }
        }
      )
    } else if (data.action === 'donation_completed') {
      await ctx.reply(
        `
🕯️ **Candle Lit!**

• Memorial: ${data.artistName}
• Amount: ${data.amount} ${data.currency}
• Message: "${data.message || 'In memory'}"

Your candle will burn forever! ♾️
        `.trim(),
        {
          parse_mode: 'Markdown'
        }
      )
    }
  } catch (error) {
    SecureLogger.error('[Telegram] Error parsing web app data:', error)
    await ctx.reply('❌ Error processing data')
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT INTEGRATION (Telegram Stars / Optional)
// ═══════════════════════════════════════════════════════════════════════════

// Send invoice for payment
async function sendPaymentInvoice(ctx: Context, paymentData: PaymentData) {
  const { memorialId, amount, currency, donorName } = paymentData

  // Use Telegram Stars for payment
  const prices = [
    {
      label: `Candle for ${donorName}'s memorial`,
      amount: Math.round(amount * 100) // Amount in cents
    }
  ]

  await ctx.replyWithInvoice({
    title: '🕯️ Light a Candle',
    description: `Support ${donorName}'s eternal memorial with a donation`,
    payload: JSON.stringify({ memorialId, action: 'donate' }),
    provider_token: '', // Leave empty for Telegram Stars
    currency: 'XTR', // Telegram Stars
    prices,
    photo_url: 'https://yourdomain.com/candle.jpg',
    photo_width: 640,
    photo_height: 480
  })
}

// Pre-checkout query handler
bot.on('pre_checkout_query', async (ctx) => {
  SecureLogger.log('[Payment] Pre-checkout query:', ctx.preCheckoutQuery?.id)
  await ctx.answerPreCheckoutQuery(true)
})

// Successful payment handler
bot.on('successful_payment', async (ctx) => {
  const payment = ctx.message?.successful_payment

  if (!payment) return

  try {
    const payloadData = JSON.parse(payment.invoice_payload)
    const { memorialId } = payloadData

    SecureLogger.log(
      `[Payment] Successful! ${payment.total_amount} XTR for memorial ${memorialId}`
    )

    // Send confirmation
    await ctx.reply(
      `
✅ **Payment Successful!**

🕯️ You donated ${payment.total_amount / 100} XTR to the memorial

Your candle is now burning forever! ♾️

Thank you for supporting this eternal memory.
      `.trim(),
      {
        parse_mode: 'Markdown'
      }
    )

    // Notify backend
    try {
      await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/grave/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-telegram-init-data': ctx.update.update_id.toString()
        },
        body: JSON.stringify({
          memorialId,
          amount: payment.total_amount / 100,
          currency: 'XTR',
          message: '🕯️ Candle lit via Telegram Stars',
          donorAddress: `telegram:${ctx.from?.id}`,
          chainId: 'tg'
        })
      })
    } catch (error) {
      SecureLogger.error('[Payment] Error notifying backend:', error)
    }
  } catch (error) {
    SecureLogger.error('[Payment] Error processing payment:', error)
    await ctx.reply('❌ Error processing payment. Please contact support.')
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// INLINE QUERIES (Search Memorials)
// ═══════════════════════════════════════════════════════════════════════════

bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query

  try {
    const response = await fetch(
      `${process.env.API_URL || 'http://localhost:3000'}/api/grave/memorials?search=${encodeURIComponent(query)}&limit=5`
    )
    const data = await response.json()

    if (!data.success || !data.data.memorials.length) {
      await ctx.answerInlineQuery([
        {
          type: 'article',
          id: 'no_results',
          title: 'No memorials found',
          input_message_content: {
            message_text: 'No memorials match your search. Create one! 🪦'
          }
        }
      ])
      return
    }

    const results = data.data.memorials.map((memorial: any, index: number) => ({
      type: 'article',
      id: memorial.id,
      title: `🪦 ${memorial.artistName}`,
      description: `${memorial.fundBalance} ETH • ${memorial.totalDonations || 0} donations`,
      input_message_content: {
        message_text: `
🪦 **${memorial.artistName}**

Fund: ${memorial.fundBalance} ETH
Donations: ${memorial.totalDonations || 0}
Heirs: ${memorial.heirs.length}

[Open on G.rave](${MINI_APP_URL}/memorial/${memorial.id})
        `.trim(),
        parse_mode: 'Markdown'
      }
    }))

    await ctx.answerInlineQuery(results, {
      cache_time: 60,
      is_personal: false
    })
  } catch (error) {
    SecureLogger.error('[Inline Query] Error:', error)
    await ctx.answerInlineQuery([])
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// TEXT MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════════

bot.hears(/\/donate\s+(\d+)/, async (ctx) => {
  const memorialId = ctx.match[1]

  await ctx.reply(`
💰 **Donate to Memorial**

How much would you like to donate?

🕯️ 0.05 ETH (~$150)
🕯️ 0.1 ETH (~$300)
🕯️ Custom amount

Use the G.rave app to donate:
[Open G.rave](${MINI_APP_URL}/memorial/${memorialId}/donate)
  `.trim(), {
    parse_mode: 'Markdown'
  })
})

bot.hears(/memorial|memoriam|rip|rest in peace/i, async (ctx) => {
  await ctx.reply(`
🪦 Looking for a memorial?

Search directly in Telegram using @grave_bot:

@grave_bot DJ Eternal
@grave_bot Producer Ghost

Or use /memorials to see recent ones.
  `.trim())
})

// Catch-all for other messages
bot.on('message', async (ctx) => {
  const text = (ctx.message as Message.TextMessage).text || ''

  if (text.length > 0) {
    await ctx.reply(`
I don't understand that command.

Available commands:
• /start - Start
• /help - How it works
• /memorials - View memorials
• /donate - Light a candle
• /contact - Contact support

Or open G.rave: [G.rave](${MINI_APP_URL})
    `.trim(), {
      parse_mode: 'Markdown'
    })
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const telegramBot = bot

export async function sendNotification(
  chatId: number,
  text: string,
  options?: any
) {
  try {
    await bot.telegram.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...options
    })
  } catch (error) {
    SecureLogger.error('[Telegram] Error sending notification:', error)
  }
}

export async function sendMemorialNotification(
  chatId: number,
  memorial: any
) {
  await sendNotification(
    chatId,
    `
🪦 **New Memorial Created**

**${memorial.artistName}**
• Fund: ${memorial.fundBalance} ETH
• Heirs: ${memorial.heirs.length}

[View Memorial](${MINI_APP_URL}/memorial/${memorial.id})
    `.trim()
  )
}

export async function sendDonationNotification(
  chatId: number,
  donation: any,
  memorial: any
) {
  await sendNotification(
    chatId,
    `
🕯️ **New Candle Lit!**

**${memorial.artistName}** received a donation

• Amount: ${donation.amount} ${donation.currency}
• Message: "${donation.message || 'In memory'}"
• From: ${donation.isAnonymous ? 'Anonymous' : 'Supporter'}

[View](${MINI_APP_URL}/memorial/${memorial.id})
    `.trim()
  )
}

export async function setupWebhook(webhookUrl: string) {
  try {
    await bot.telegram.setWebhook(webhookUrl)
    SecureLogger.log(`✅ Telegram webhook set to ${webhookUrl}`)
  } catch (error) {
    SecureLogger.error('❌ Error setting webhook:', error)
  }
}

export async function removeWebhook() {
  try {
    await bot.telegram.deleteWebhook()
    SecureLogger.log('✅ Telegram webhook removed')
  } catch (error) {
    SecureLogger.error('❌ Error removing webhook:', error)
  }
}

export async function startPolling() {
  SecureLogger.log('🤖 Telegram bot started polling...')
  await bot.launch()
}
