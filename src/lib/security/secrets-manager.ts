export class SecretsManager {
  private static secrets = new Map<string, string>();

  static init() {
    // Load from environment only
    this.secrets.set('TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN || '');
    this.secrets.set('ENCRYPTION_KEY', process.env.ENCRYPTION_KEY || '');
    this.secrets.set('JWT_SECRET', process.env.JWT_SECRET || '');
  }

  static get(key: string): string {
    const value = this.secrets.get(key);
    if (!value) throw new Error(`Secret ${key} not found`);
    return value;
  }

  static has(key: string): boolean {
    return this.secrets.has(key) && !!this.secrets.get(key);
  }
}