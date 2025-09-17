#!/usr/bin/env node

/**
 * Скрипт для автоматизации унификации документов проекта NORMALDANCE 2025
 * 
 * Функции:
 * 1. Обнаружение дублирования информации
 * 2. Проверка противоречий между документами
 * 3. Автоматическое обновление специализированных документов
 * 4. Проверка консистентности данных
 */

const fs = require('fs');
const path = require('path');

class DocumentUnifier {
    constructor() {
        this.masterDocPath = 'NORMALDANCE_2025_MASTER.md';
        this.specializedDocs = [
            'DETAILED_COST_ANALYSIS_NORMALDANCE_2025.md',
            'COMPREHENSIVE_PROJECT_ANALYSIS_NORMALDANCE_2025.md',
            'IMPLEMENTATION_REPORT_2025.md',
            'GRAVE_SUCCESS_REPORT.md',
            'ATR_IMPLEMENTATION_README.md',
            'GRAVE_README.md',
            'INNOVATIONS_2025_README.md',
            'CHANGELOG.md'
        ];
        this.duplicates = new Map();
        this.inconsistencies = new Map();
        this.metrics = {
            totalFiles: 0,
            duplicatesFound: 0,
            inconsistenciesFound: 0,
            filesProcessed: 0
        };
    }

    async init() {
        console.log('🚀 Запуск процесса унификации документов...');
        console.log('📊 Анализ документов проекта NORMALDANCE 2025');
        
        await this.checkFilesExistence();
        await this.analyzeDuplicates();
        await this.checkInconsistencies();
        await this.generateReport();
        
        console.log('✅ Процесс унификации завершен');
    }

    async checkFilesExistence() {
        console.log('🔍 Проверка существования файлов...');
        
        const requiredFiles = [this.masterDocPath, ...this.specializedDocs];
        
        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                console.warn(`⚠️  Файл не найден: ${file}`);
            } else {
                this.metrics.totalFiles++;
            }
        }
        
        console.log(`✅ Найдено ${this.metrics.totalFiles} из ${requiredFiles.length} файлов`);
    }

    async analyzeDuplicates() {
        console.log('🔍 Анализ дублирования информации...');
        
        const contentMap = new Map();
        
        for (const docPath of this.specializedDocs) {
            if (fs.existsSync(docPath)) {
                const content = fs.readFileSync(docPath, 'utf8');
                contentMap.set(docPath, content);
            }
        }
        
        const sections = [
            'Telegram интеграция',
            'Технический стек',
            'Финансовые показатели',
            'Оценка проекта',
            'Solana',
            'Next.js',
            'NFT',
            'Децентрализация'
        ];
        
        for (const section of sections) {
            const duplicates = [];
            
            for (const [docPath, content] of contentMap) {
                if (content.includes(section)) {
                    duplicates.push(docPath);
                }
            }
            
            if (duplicates.length > 1) {
                this.duplicates.set(section, duplicates);
                this.metrics.duplicatesFound++;
            }
        }
        
        console.log(`📊 Найдено ${this.metrics.duplicatesFound} дублированных разделов`);
    }

    async checkInconsistencies() {
        console.log('🔍 Проверка противоречий...');
        
        await this.checkFinancialInconsistencies();
        await this.checkTechnicalInconsistencies();
        await this.checkTeamInconsistencies();
        
        console.log(`📊 Найдено ${this.metrics.inconsistenciesFound} противоречий`);
    }

    async checkFinancialInconsistencies() {
        const financialDocs = [
            'DETAILED_COST_ANALYSIS_NORMALDANCE_2025.md',
            'COMPREHENSIVE_PROJECT_ANALYSIS_NORMALDANCE_2025.md',
            'IMPLEMENTATION_REPORT_2025.md'
        ];
        
        const budgetValues = new Map();
        
        for (const docPath of financialDocs) {
            if (fs.existsSync(docPath)) {
                const content = fs.readFileSync(docPath, 'utf8');
                
                const budgetMatch = content.match(/(?:бюджет|Budget|CAPEX|OPEX)[:\s]*([\d,]+)\s*(₽|USD|\$)/i);
                if (budgetMatch) {
                    budgetValues.set(docPath, {
                        value: budgetMatch[1],
                        currency: budgetMatch[2],
                        raw: budgetMatch[0]
                    });
                }
            }
        }
        
        const values = Array.from(budgetValues.values());
        if (values.length > 1) {
            const uniqueValues = new Set(values.map(v => v.value));
            if (uniqueValues.size > 1) {
                this.inconsistencies.set('Финансовые показатели', {
                    type: 'budget',
                    documents: Array.from(budgetValues.keys()),
                    values: budgetValues
                });
                this.metrics.inconsistenciesFound++;
            }
        }
    }

    async checkTechnicalInconsistencies() {
        const technicalDocs = [
            'COMPREHENSIVE_PROJECT_ANALYSIS_NORMALDANCE_2025.md',
            'IMPLEMENTATION_REPORT_2025.md',
            'INNOVATIONS_2025_README.md'
        ];
        
        const speedValues = new Map();
        
        for (const docPath of technicalDocs) {
            if (fs.existsSync(docPath)) {
                const content = fs.readFileSync(docPath, 'utf8');
                
                const speedMatch = content.match(/(?:скорость|speed|время|time)[:\s]*([\d.]+)\s*(сек|seconds?)/i);
                if (speedMatch) {
                    speedValues.set(docPath, {
                        value: speedMatch[1],
                        unit: speedMatch[2],
                        raw: speedMatch[0]
                    });
                }
            }
        }
        
        const values = Array.from(speedValues.values());
        if (values.length > 1) {
            const uniqueValues = new Set(values.map(v => v.value));
            if (uniqueValues.size > 1) {
                this.inconsistencies.set('Технические показатели', {
                    type: 'speed',
                    documents: Array.from(speedValues.keys()),
                    values: speedValues
                });
                this.metrics.inconsistenciesFound++;
            }
        }
    }

    async checkTeamInconsistencies() {
        const teamDocs = [
            'COMPREHENSIVE_PROJECT_ANALYSIS_NORMALDANCE_2025.md',
            'IMPLEMENTATION_REPORT_2025.md',
            'ATR_IMPLEMENTATION_README.md'
        ];
        
        const teamSizes = new Map();
        
        for (const docPath of teamDocs) {
            if (fs.existsSync(docPath)) {
                const content = fs.readFileSync(docPath, 'utf8');
                
                const teamMatch = content.match(/(?:команда|team|разработчик|developer)[:\s]*([\d]+)/i);
                if (teamMatch) {
                    teamSizes.set(docPath, {
                        value: teamMatch[1],
                        raw: teamMatch[0]
                    });
                }
            }
        }
        
        const values = Array.from(teamSizes.values());
        if (values.length > 1) {
            const uniqueValues = new Set(values.map(v => v.value));
            if (uniqueValues.size > 1) {
                this.inconsistencies.set('Команда разработки', {
                    type: 'team',
                    documents: Array.from(teamSizes.keys()),
                    values: teamSizes
                });
                this.metrics.inconsistenciesFound++;
            }
        }
    }

    async generateReport() {
        console.log('📊 Генерация отчета...');
        
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            duplicates: Object.fromEntries(this.duplicates),
            inconsistencies: Object.fromEntries(this.inconsistencies),
            recommendations: this.generateRecommendations()
        };
        
        const reportPath = 'unification-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📄 Отчет сохранен: ${reportPath}`);
        this.printReport(report);
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.duplicatesFound > 0) {
            recommendations.push({
                type: 'duplicates',
                priority: 'high',
                action: 'Удалить дублированные разделы из специализированных документов',
                description: 'Найдено дублирование информации в нескольких документах'
            });
        }
        
        if (this.metrics.inconsistenciesFound > 0) {
            recommendations.push({
                type: 'inconsistencies',
                priority: 'high',
                action: 'Устранить противоречия в данных',
                description: 'Найдены противоречия в финансовых, технических и командных данных'
            });
        }
        
        recommendations.push({
            type: 'standardization',
            priority: 'medium',
            action: 'Внедрить шаблоны унификации',
            description: 'Использовать созданные шаблоны для стандартизации документов'
        });
        
        return recommendations;
    }

    printReport(report) {
        console.log('\n📊 ОТЧЕТ УНИФИКАЦИИ');
        console.log('='.repeat(50));
        console.log(`📅 Время: ${report.timestamp}`);
        console.log(`📁 Файлов обработано: ${report.metrics.totalFiles}`);
        console.log(`🔄 Дублирований: ${report.metrics.duplicatesFound}`);
        console.log(`⚠️  Противоречий: ${report.metrics.inconsistenciesFound}`);
        
        console.log('\n📋 ДУБЛИРОВАНИЯ:');
        for (const [section, docs] of Object.entries(report.duplicates)) {
            console.log(`  ${section}: ${docs.join(', ')}`);
        }
        
        console.log('\n⚠️  ПРОТИВОРЕЧИЯ:');
        for (const [section, data] of Object.entries(report.inconsistencies)) {
            console.log(`  ${section}: ${data.type} в ${data.documents.join(', ')}`);
        }
        
        console.log('\n💡 РЕКОМЕНДАЦИИ:');
        for (const rec of report.recommendations) {
            console.log(`  [${rec.priority}] ${rec.action}`);
            console.log(`    ${rec.description}`);
        }
    }
}

// Запуск скрипта
if (require.main === module) {
    const unifier = new DocumentUnifier();
    unifier.init().catch(console.error);
}

module.exports = DocumentUnifier;
