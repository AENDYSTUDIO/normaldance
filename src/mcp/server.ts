import { SecureLogger } from '@/lib/security/secure-logger';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MusicContextProvider } from './providers/music.js';
import { UserContextProvider } from './providers/user.js';
import { NFTContextProvider } from './providers/nft.js';
import { StakingContextProvider } from './providers/staking.js';
import { FigmaContextProvider } from './providers/figma.js';

export class NormalDanceMCPServer {
  private server: Server;
  private providers: {
    music: MusicContextProvider;
    users: UserContextProvider;
    nft: NFTContextProvider;
    staking: StakingContextProvider;
    figma: FigmaContextProvider;
  };

  constructor() {
    this.server = new Server({
      name: 'normaldance-mcp',
      version: '1.0.0'
    }, {
      capabilities: {
        resources: Record<string, unknown>,
        tools: Record<string, unknown>,
        prompts: Record<string, unknown>
      }
    });

    this.providers = {
      music: new MusicContextProvider(),
      users: new UserContextProvider(),
      nft: new NFTContextProvider(),
      staking: new StakingContextProvider(),
      figma: new FigmaContextProvider()
    };

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler('resources/list', async () => ({
      resources: [
        { uri: 'track://', name: 'Music Tracks', mimeType: 'application/json' },
        { uri: 'user://', name: 'User Profiles', mimeType: 'application/json' },
        { uri: 'nft://', name: 'NFT Collections', mimeType: 'application/json' },
        { uri: 'staking://', name: 'Staking Data', mimeType: 'application/json' },
        { uri: 'design://', name: 'Design System', mimeType: 'application/json' },
        { uri: 'figma://', name: 'Figma Design Tokens', mimeType: 'application/json' }
      ]
    }));

    this.server.setRequestHandler('resources/read', async (request) => {
      const { uri } = request.params;
      const [protocol, path] = uri.split('://');
      
      let data;
      switch (protocol) {
        case 'track':
          data = await this.providers.music.getTrack(path);
          break;
        case 'user':
          data = await this.providers.users.getUser(path);
          break;
        case 'nft':
          data = await this.providers.nft.getNFT(path);
          break;
        case 'staking':
          data = await this.providers.staking.getPosition(path);
          break;
        case 'design':
          data = await this.providers.figma.generateDesignSystemReport();
          break;
        case 'figma':
          const [fileKey, token] = path.split('/');
          if (fileKey) {
            // Use token from path if provided, otherwise fallback to environment variable
            const figmaToken = token || process.env.FIGMA_ACCESS_TOKEN || '';
            data = await this.providers.figma.getFigmaTokens(fileKey, figmaToken);
          } else {
            // No fileKey provided, return local tokens
            data = { tokens: await this.providers.figma.getLocalDesignTokens() };
          }
          break;
        default:
          throw new Error(`Unknown protocol: ${protocol}`);
      }

      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data)
        }]
      };
    });

    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'search_music',
          description: 'Search for music tracks',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              genre: { type: 'string' },
              limit: { type: 'number', default: 10 }
            }
          }
        },
        {
          name: 'get_recommendations',
          description: 'Get personalized music recommendations',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              count: { type: 'number', default: 20 }
            }
          }
        },
        {
          name: 'analyze_component_design',
          description: 'Analyze UI component design and provide recommendations',
          inputSchema: {
            type: 'object',
            properties: {
              componentPath: { type: 'string', description: 'Path to component file' }
            },
            required: ['componentPath']
          }
        },
        {
          name: 'get_figma_tokens',
          description: 'Get design tokens from Figma file',
          inputSchema: {
            type: 'object',
            properties: {
              fileKey: { type: 'string', description: 'Figma file key' },
              accessToken: { type: 'string', description: 'Figma access token (optional, uses env var)' }
            },
            required: ['fileKey']
          }
        },
        {
          name: 'generate_design_recommendations',
          description: 'Generate design improvement recommendations',
          inputSchema: {
            type: 'object',
            properties: {
              componentPath: { type: 'string', description: 'Optional component path for specific analysis' }
            }
          }
        },
        {
          name: 'check_accessibility',
          description: 'Check component accessibility compliance (WCAG 2.1 AA)',
          inputSchema: {
            type: 'object',
            properties: {
              componentPath: { type: 'string', description: 'Path to component file' }
            },
            required: ['componentPath']
          }
        },
        {
          name: 'compare_design_systems',
          description: 'Compare Figma design system with local design tokens',
          inputSchema: {
            type: 'object',
            properties: {
              figmaFileKey: { type: 'string', description: 'Figma file key' },
              accessToken: { type: 'string', description: 'Figma access token (optional)' }
            },
            required: ['figmaFileKey']
          }
        }
      ]
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      let result;
      switch (name) {
        case 'search_music':
          result = await this.providers.music.searchTracks(args.query, args);
          break;
        case 'get_recommendations':
          result = await this.providers.music.getRecommendations(args.userId);
          break;
        case 'analyze_component_design':
          result = await this.providers.figma.analyzeComponent(args.componentPath);
          break;
        case 'get_figma_tokens':
          const token = args.accessToken || process.env.FIGMA_ACCESS_TOKEN || '';
          result = await this.providers.figma.getFigmaTokens(args.fileKey, token);
          break;
        case 'generate_design_recommendations':
          result = await this.providers.figma.generateDesignRecommendations(args.componentPath);
          break;
        case 'check_accessibility':
          result = await this.providers.figma.checkAccessibility(args.componentPath);
          break;
        case 'compare_design_systems':
          const figmaToken = args.accessToken || process.env.FIGMA_ACCESS_TOKEN || '';
          const figmaTokens = await this.providers.figma.getFigmaTokens(args.figmaFileKey, figmaToken);
          const localTokens = await this.providers.figma.getLocalDesignTokens();
          result = await this.providers.figma.compareWithFigma(figmaTokens, localTokens);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      };
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    SecureLogger.log('NORMAL DANCE MCP Server started');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new NormalDanceMCPServer();
  server.start().catch(console.error);
}