#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

class NormalDanceMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "normaldance-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // Инструменты для работы с музыкой
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: "get_track_info",
          description: "Получить информацию о треке",
          inputSchema: {
            type: "object",
            properties: {
              trackId: { type: "string", description: "ID трека" }
            },
            required: ["trackId"]
          }
        },
        {
          name: "get_recommendations",
          description: "Получить AI рекомендации",
          inputSchema: {
            type: "object",
            properties: {
              userId: { type: "string", description: "ID пользователя" },
              limit: { type: "number", description: "Количество рекомендаций" }
            },
            required: ["userId"]
          }
        },
        {
          name: "stake_tokens",
          description: "Стейкинг NDT токенов",
          inputSchema: {
            type: "object",
            properties: {
              amount: { type: "number", description: "Количество токенов" },
              type: { type: "string", enum: ["fixed", "flexible"], description: "Тип стейкинга" }
            },
            required: ["amount", "type"]
          }
        }
      ]
    }));

    // Обработчик вызова инструментов
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "get_track_info":
          return this.getTrackInfo(args.trackId);
        case "get_recommendations":
          return this.getRecommendations(args.userId, args.limit || 10);
        case "stake_tokens":
          return this.stakeTokens(args.amount, args.type);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async getTrackInfo(trackId) {
    return {
      content: [
        {
          type: "text",
          text: `Информация о треке ${trackId}:\n- Название: Sample Track\n- Артист: Sample Artist\n- Длительность: 3:45\n- Жанр: Electronic`
        }
      ]
    };
  }

  async getRecommendations(userId, limit) {
    return {
      content: [
        {
          type: "text",
          text: `AI рекомендации для пользователя ${userId}:\n1. Track A - Artist X\n2. Track B - Artist Y\n3. Track C - Artist Z`
        }
      ]
    };
  }

  async stakeTokens(amount, type) {
    const apy = type === 'fixed' ? '12%' : '8-15%';
    return {
      content: [
        {
          type: "text",
          text: `Стейкинг ${amount} NDT токенов (${type}):\n- APY: ${apy}\n- Статус: Активен\n- Период: ${type === 'fixed' ? '30 дней' : 'Гибкий'}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("NORMAL DANCE MCP Server запущен");
  }
}

const server = new NormalDanceMCPServer();
server.run().catch(console.error);