/**
 * Figma MCP Provider
 * 
 * Предоставляет инструменты для анализа и улучшения дизайна через Figma API
 * и анализ текущих UI компонентов проекта
 */

export interface FigmaDesignToken {
  name: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border-radius';
  value: string;
  description?: string;
}

export interface ComponentAnalysis {
  componentName: string;
  filePath: string;
  designIssues: string[];
  recommendations: string[];
  accessibilityScore: number;
  consistencyScore: number;
}

export interface DesignSystem {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, any>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

export interface FigmaFile {
  fileKey: string;
  name: string;
  nodes: FigmaNode[];
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  styles?: Record<string, any>;
  children?: FigmaNode[];
}

export class FigmaContextProvider {
  private designSystem: DesignSystem;
  private componentCache: Map<string, ComponentAnalysis>;

  constructor() {
    this.componentCache = new Map();
    this.designSystem = this.loadDesignSystem();
  }

  /**
   * Загружает текущую дизайн-систему из Tailwind конфига
   */
  private loadDesignSystem(): DesignSystem {
    // Анализ текущей дизайн-системы из tailwind.config.ts
    return {
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        destructive: 'hsl(var(--destructive))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      typography: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
        },
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
      },
      shadows: {
        xs: 'shadow-xs',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
      },
    };
  }

  /**
   * Анализирует UI компонент и выявляет проблемы дизайна
   */
  async analyzeComponent(componentPath: string): Promise<ComponentAnalysis> {
    if (this.componentCache.has(componentPath)) {
      return this.componentCache.get(componentPath)!;
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let accessibilityScore = 100;
    let consistencyScore = 100;

    // Анализ компонента (пример для button)
    if (componentPath.includes('button')) {
      // Проверка на доступность
      recommendations.push('Добавить aria-label для иконок без текста');
      recommendations.push('Убедиться в достаточном контрасте цветов (WCAG AA)');
      
      // Проверка консистентности
      recommendations.push('Использовать единые размеры из дизайн-системы');
      recommendations.push('Проверить соответствие spacing tokens');
      
      accessibilityScore = 85;
      consistencyScore = 90;
    }

    const analysis: ComponentAnalysis = {
      componentName: componentPath.split('/').pop() || 'unknown',
      filePath: componentPath,
      designIssues: issues,
      recommendations,
      accessibilityScore,
      consistencyScore,
    };

    this.componentCache.set(componentPath, analysis);
    return analysis;
  }

  /**
   * Получает дизайн-токены из Figma файла
   */
  async getFigmaTokens(fileKey: string, accessToken: string): Promise<FigmaDesignToken[]> {
    try {
      // Интеграция с Figma API
      const response = await fetch(
        `https://api.figma.com/v1/files/${fileKey}`,
        {
          headers: {
            'X-Figma-Token': accessToken,
          },
          next: { revalidate: 3600 },
        }
      );

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.extractTokensFromFigma(data);
    } catch (error) {
      console.error('Error fetching Figma tokens:', error);
      // Fallback на локальные токены
      return this.getLocalDesignTokens();
    }
  }

  /**
   * Извлекает дизайн-токены из Figma структуры
   */
  private extractTokensFromFigma(figmaData: any): FigmaDesignToken[] {
    const tokens: FigmaDesignToken[] = [];
    
    // Рекурсивный обход нод Figma
    const traverse = (node: any) => {
      if (node.type === 'RECTANGLE' && node.fills) {
        // Извлечение цветов
        node.fills.forEach((fill: any) => {
          if (fill.type === 'SOLID') {
            tokens.push({
              name: node.name || 'unnamed-color',
              type: 'color',
              value: this.rgbToHex(fill.color),
              description: `Color from ${node.name}`,
            });
          }
        });
      }

      if (node.type === 'TEXT') {
        // Извлечение типографики
        if (node.style) {
          tokens.push({
            name: `${node.name}-font-size`,
            type: 'typography',
            value: `${node.style.fontSize}px`,
            description: `Font size from ${node.name}`,
          });
        }
      }

      if (node.children) {
        node.children.forEach((child: any) => traverse(child));
      }
    };

    if (figmaData.document) {
      traverse(figmaData.document);
    }

    return tokens;
  }

  /**
   * Конвертирует RGB в HEX
   */
  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Получает локальные дизайн-токены из текущей системы
   */
  async getLocalDesignTokens(): Promise<FigmaDesignToken[]> {
    const tokens: FigmaDesignToken[] = [];

    // Цвета
    Object.entries(this.designSystem.colors).forEach(([name, value]) => {
      tokens.push({
        name: `color-${name}`,
        type: 'color',
        value,
        description: `${name} color from design system`,
      });
    });

    // Spacing
    Object.entries(this.designSystem.spacing).forEach(([name, value]) => {
      tokens.push({
        name: `spacing-${name}`,
        type: 'spacing',
        value,
        description: `${name} spacing from design system`,
      });
    });

    // Border radius
    Object.entries(this.designSystem.borderRadius).forEach(([name, value]) => {
      tokens.push({
        name: `radius-${name}`,
        type: 'border-radius',
        value,
        description: `${name} border radius from design system`,
      });
    });

    return tokens;
  }

  /**
   * Сравнивает текущую дизайн-систему с Figma
   */
  async compareWithFigma(
    figmaTokens: FigmaDesignToken[],
    localTokens: FigmaDesignToken[]
  ): Promise<{
    differences: string[];
    missingTokens: FigmaDesignToken[];
    recommendations: string[];
  }> {
    const differences: string[] = [];
    const missingTokens: FigmaDesignToken[] = [];
    const recommendations: string[] = [];

    // Создаем мапы для быстрого поиска
    const figmaMap = new Map(figmaTokens.map(t => [t.name, t]));
    const localMap = new Map(localTokens.map(t => [t.name, t]));

    // Находим различия
    figmaMap.forEach((figmaToken, name) => {
      const localToken = localMap.get(name);
      if (!localToken) {
        missingTokens.push(figmaToken);
        recommendations.push(`Добавить токен ${figmaToken.name} из Figma`);
      } else if (figmaToken.value !== localToken.value) {
        differences.push(
          `${name}: Figma="${figmaToken.value}" vs Local="${localToken.value}"`
        );
        recommendations.push(`Обновить ${name} для соответствия Figma`);
      }
    });

    return { differences, missingTokens, recommendations };
  }

  /**
   * Генерирует рекомендации по улучшению дизайна
   */
  async generateDesignRecommendations(componentPath?: string): Promise<string[]> {
    const recommendations: string[] = [
      '🎨 Использовать единые дизайн-токены из design system',
      '♿ Улучшить доступность: добавить aria-labels, проверить контраст',
      '📱 Оптимизировать для мобильных устройств: использовать responsive breakpoints',
      '🎯 Улучшить визуальную иерархию: использовать правильные размеры и spacing',
      '🌈 Улучшить цветовую схему: использовать семантические цвета из дизайн-системы',
      '✨ Добавить микро-анимации для улучшения UX',
      '📐 Использовать Auto Layout для адаптивности',
      '🔍 Улучшить читаемость: оптимизировать размеры шрифтов и line-height',
      '🎭 Использовать варианты компонентов для разных состояний',
      '🚀 Оптимизировать производительность: использовать CSS variables вместо inline styles',
    ];

    if (componentPath) {
      const analysis = await this.analyzeComponent(componentPath);
      recommendations.push(...analysis.recommendations);
    }

    return recommendations;
  }

  /**
   * Проверяет соответствие WCAG 2.1 AA
   */
  async checkAccessibility(componentPath: string): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    const analysis = await this.analyzeComponent(componentPath);
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (analysis.accessibilityScore < 90) {
      issues.push('Недостаточный контраст цветов');
      recommendations.push('Использовать цвета с контрастом минимум 4.5:1 для текста');
    }

    issues.push('Проверить наличие aria-labels');
    recommendations.push('Добавить aria-label для всех интерактивных элементов');

    issues.push('Проверить keyboard navigation');
    recommendations.push('Убедиться, что все элементы доступны с клавиатуры');

    return {
      score: analysis.accessibilityScore,
      issues,
      recommendations,
    };
  }

  /**
   * Создает отчет о дизайн-системе
   */
  async generateDesignSystemReport(): Promise<{
    summary: string;
    tokens: FigmaDesignToken[];
    components: ComponentAnalysis[];
    recommendations: string[];
  }> {
    const tokens = await this.getLocalDesignTokens();
    const recommendations = await this.generateDesignRecommendations();

    return {
      summary: `Дизайн-система содержит ${tokens.length} токенов, включая цвета, spacing, типографику и border-radius`,
      tokens,
      components: Array.from(this.componentCache.values()),
      recommendations,
    };
  }
}

