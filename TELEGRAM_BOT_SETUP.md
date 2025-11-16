# Telegram Bot Setup Guide

This guide will help you set up the Telegram bot integration for NORMAL DANCE platform.

## Step 1: Create Bot with BotFather

1. Open Telegram and search for `@BotFather`
2. Start a conversation and send `/newbot`
3. Follow the prompts:
   - **Bot name**: `NORMAL DANCE` (or your preferred name)
   - **Bot username**: `NormalDanceBot` (must end with 'bot')
4. Save the **Bot Token** provided by BotFather (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Configure Bot Settings

### Set Bot Description
```
/setdescription
@NormalDanceBot
```
Description:
```
🎵 NORMAL DANCE - Web3 Music Platform

Discover, upload, and trade music NFTs on the blockchain.
Connect your wallet, stake tokens, and create eternal music memorials.
```

### Set Bot About Text
```
/setabouttext
@NormalDanceBot
```
About:
```
Web3 music platform with IPFS storage, NFT marketplace, and G.Rave memorial system.
```

### Set Bot Commands
```
/setcommands
@NormalDanceBot
```
Commands:
```
start - Start the bot and open Mini App
wallet - Connect your Web3 wallet
upload - Upload music to IPFS
nft - Browse NFT marketplace
staking - View staking pools
stats - View your statistics
grave - Create music memorial
settings - Manage settings
help - Get help
```

### Set Bot Profile Picture
Upload a square image (512x512px recommended) with your logo

## Step 3: Enable Inline Mode (Optional)
```
/setinline
@NormalDanceBot
```
Inline placeholder: `Search music...`

## Step 4: Configure Mini App

### Set Menu Button
```
/setmenubutton
@NormalDanceBot
```
- **Button text**: `Open NORMAL DANCE`
- **Web App URL**: `https://your-domain.manus.space`

### Enable Web App
```
/newapp
@NormalDanceBot
```
- **App title**: `NORMAL DANCE`
- **Description**: `Web3 Music Platform`
- **Photo**: Upload app screenshot
- **GIF**: Upload demo GIF (optional)
- **Web App URL**: `https://your-domain.manus.space`

## Step 5: Configure Telegram Stars (Payment)

1. Contact `@BotFather`
2. Send `/mybots`
3. Select your bot
4. Go to `Bot Settings` → `Payments`
5. Select `Telegram Stars` as payment provider
6. No additional configuration needed - Telegram Stars works out of the box!

## Step 6: Set Up Webhook

Add the bot token to your environment variables:

```bash
# In your .env or environment settings
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

The webhook will be automatically configured when you deploy your application.

Webhook URL format:
```
https://your-domain.manus.space/api/telegram/webhook
```

## Step 7: Test the Bot

1. Open Telegram and search for your bot username
2. Send `/start` to begin
3. Try the menu button to open the Mini App
4. Test wallet connection and other features

## Bot Features

### Commands Implementation

- **`/start`** - Welcome message + Mini App button
- **`/wallet`** - Show wallet connection status
- **`/upload`** - Quick upload interface
- **`/nft`** - Browse NFT marketplace
- **`/staking`** - View staking opportunities
- **`/stats`** - Personal statistics
- **`/grave`** - Create G.Rave memorial
- **`/settings`** - User preferences
- **`/help`** - Help and documentation

### Telegram Stars Integration

Telegram Stars can be used for:
- Premium features subscription
- NFT purchases
- Staking pool entry fees
- G.Rave memorial creation
- Tipping artists

### Notifications

The bot can send notifications for:
- New followers
- Track likes and comments
- NFT sales
- Staking rewards
- Memorial candle lighting
- System updates

## Security Best Practices

1. **Never share your bot token** - Keep it secret
2. **Use webhook instead of polling** - More secure and efficient
3. **Validate all incoming requests** - Check Telegram signature
4. **Rate limit API calls** - Prevent abuse
5. **Sanitize user input** - Prevent injection attacks

## Useful BotFather Commands

- `/mybots` - List all your bots
- `/deletebot` - Delete a bot
- `/token` - Get bot token
- `/revoke` - Revoke bot token
- `/setname` - Change bot name
- `/setuserpic` - Change bot profile picture
- `/setdescription` - Change bot description
- `/setabouttext` - Change about text
- `/setcommands` - Set bot commands

## Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Mini Apps Guide](https://core.telegram.org/bots/webapps)
- [Telegram Stars Documentation](https://core.telegram.org/bots/payments)
- [TON Connect 2.0 Docs](https://docs.ton.org/develop/dapps/ton-connect/overview)

## Support

If you encounter any issues:
1. Check the bot token is correct
2. Verify webhook URL is accessible
3. Check server logs for errors
4. Test with BotFather's `/mybots` command
5. Contact Telegram support if needed

---

**Ready to launch!** 🚀

Once configured, your Telegram bot will provide seamless access to the NORMAL DANCE platform directly from Telegram.
