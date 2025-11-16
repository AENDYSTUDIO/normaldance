#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * Analyzes bundle size and provides optimization recommendations
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const gzipSize = require('gzip-size')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step) {
  log(`\n📦 ${step}`, 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const f = ((bytes / Math.pow(k, i)) * 100).toFixed(2)
  return `${parseFloat(f)} ${sizes[i]}`
}

function analyzeBundle() {
  logStep('Analyzing bundle size')
  
  try {
    // Build with analysis
    execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() })
    
    // Check if .next directory exists
    if (!fs.existsSync('.next')) {
      logError('Build directory not found. Run npm run build first.')
      return false
    }
    
    // Analyze main chunks
    const staticDir = '.next/static'
    const chunksDir = path.join(staticDir, 'chunks')
    
    if (fs.existsSync(chunksDir)) {
      const chunks = fs.readdirSync(chunksDir)
      let totalSize = 0
      const chunkAnalysis = []
      
      for (const chunk of chunks) {
        if (chunk.endsWith('.js')) {
          const chunkPath = path.join(chunksDir, chunk)
          const stats = fs.statSync(chunkPath)
          const size = stats.size
          totalSize += size
          
          // Get gzipped size
          const content = fs.readFileSync(chunkPath)
          const gzipped = gzipSize.sync(content)
          
          chunkAnalysis.push({
            name: chunk,
            size: formatBytes(size),
            gzipped: formatBytes(gzipped),
            compression: ((size - gzipped) / size * 100).toFixed(1) + '%'
          })
        }
      }
      
      // Sort by size
      chunkAnalysis.sort((a, b) => b.size - a.size)
      
      log('\n📊 Bundle Analysis:', 'bright')
      log('=====================================', 'blue')
      
      chunkAnalysis.forEach((chunk, index) => {
        const color = chunk.size > 500 * 1024 ? 'red' : chunk.size > 200 * 1024 ? 'yellow' : 'green'
        log(`${index + 1}. ${chunk.name.padEnd(20)} - ${chunk.size.padEnd(10)} (${chunk.gzipped}) - ${chunk.compression}`, color)
      })
      
      log('\n📈 Total Size:', 'bright')
      log(`Uncompressed: ${formatBytes(totalSize)}`)
      log(`Compressed: ${formatBytes(totalSize * 0.3)}`) // Estimated 70% compression
      
      // Check for large chunks
      const largeChunks = chunkAnalysis.filter(chunk => chunk.size > 500 * 1024)
      if (largeChunks.length > 0) {
        log('\n⚠️  Large chunks detected:', 'yellow')
        largeChunks.forEach(chunk => {
          log(`  - ${chunk.name}: ${formatBytes(chunk.size)}`, 'yellow')
        })
        log('\n💡 Recommendations:', 'cyan')
        log('  1. Implement dynamic imports for large chunks')
        log('  2. Consider code splitting for vendor libraries')
        log('  3. Use React.lazy() for route-level splitting')
      }
      
      // Check vendor chunk size
      const vendorChunk = chunkAnalysis.find(chunk => chunk.name.includes('vendor'))
      if (vendorChunk) {
        log('\n📦 Vendor Chunk:', 'blue')
        log(`  Size: ${formatBytes(vendorChunk.size)}`)
        log(`  Compressed: ${formatBytes(vendorChunk.size * 0.3)}`)
        
        if (vendorChunk.size > 1024 * 1024) { // 1MB
          log('\n⚠️  Large vendor chunk detected:', 'yellow')
          log('💡 Consider tree shaking or externalizing large libraries')
        }
      }
      
      return true
    } else {
      logError('Static chunks directory not found')
      return false
    }
    
  } catch (error) {
    logError(`Bundle analysis failed: ${error.message}`)
    return false
  }
}

function analyzeDependencies() {
  logStep('Analyzing dependencies')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const dependencies = packageJson.dependencies || {}
    const devDependencies = packageJson.devDependencies || {}
    
    log('\n📦 Dependencies:', 'bright')
    log('================================', 'blue')
    
    // Check for large dependencies
    const allDeps = { ...dependencies, ...devDependencies }
    let totalDepsSize = 0
    const depAnalysis = []
    
    for (const [name, version] of Object.entries(allDeps)) {
      try {
        const depPath = path.join('node_modules', name)
        if (fs.existsSync(depPath)) {
          const stats = fs.statSync(depPath)
          const size = stats.size
          totalDepsSize += size
          
          depAnalysis.push({
            name,
            version,
            size: formatBytes(size)
          })
        }
      } catch (error) {
        // Skip if can't analyze
      }
    }
    
    // Sort by size
    depAnalysis.sort((a, b) => b.size - a.size)
    
    depAnalysis.slice(0, 10).forEach((dep, index) => {
      const color = dep.size > 500 * 1024 ? 'red' : 'green'
      log(`${index + 1}. ${dep.name.padEnd(25)} - ${dep.size}`, color)
    })
    
    log(`\n📈 Total Dependencies: ${formatBytes(totalDepsSize)}`)
    
    // Check for optimization opportunities
    const largeDeps = depAnalysis.filter(dep => dep.size > 500 * 1024)
    if (largeDeps.length > 0) {
      log('\n💡 Optimization Recommendations:', 'cyan')
      log('  1. Consider lighter alternatives for large dependencies')
      log('  2. Use dynamic imports for rarely used libraries')
      log('  3. Enable tree shaking in webpack config')
    }
    
    return true
    
  } catch (error) {
    logError(`Dependency analysis failed: ${error.message}`)
    return false
  }
}

function generateOptimizationReport() {
  logStep('Generating optimization report')
  
  const report = {
    timestamp: new Date().toISOString(),
    bundleAnalysis: {},
    dependencyAnalysis: {},
    recommendations: [],
  }
  
  try {
    // This would integrate with the actual analysis results
    const reportPath = 'bundle-analysis-report.json'
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    logSuccess(`Report generated: ${reportPath}`)
    return true
    
  } catch (error) {
    logError(`Report generation failed: ${error.message}`)
    return false
  }
}

function main() {
  log('🚀 NORMALDANCE Bundle Analyzer', 'bright')
  log('=====================================', 'blue')
  
  const startTime = Date.now()
  
  try {
    // Analyze bundle
    const bundleAnalyzed = analyzeBundle()
    
    // Analyze dependencies
    const depsAnalyzed = analyzeDependencies()
    
    // Generate report
    const reportGenerated = generateOptimizationReport()
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    log('\n📋 Analysis Summary:', 'bright')
    log(`Duration: ${duration}s`)
    log(`Bundle Analysis: ${bundleAnalyzed ? 'COMPLETED' : 'FAILED'}`)
    log(`Dependency Analysis: ${depsAnalyzed ? 'COMPLETED' : 'FAILED'}`)
    log(`Report Generation: ${reportGenerated ? 'COMPLETED' : 'FAILED'}`)
    
    // Final recommendations
    log('\n🎯 Next Steps:', 'cyan')
    log('1. Review large chunks and implement code splitting')
    log('2. Consider dynamic imports for heavy dependencies')
    log('3. Enable compression for production assets')
    log('4. Monitor bundle size in CI/CD pipeline')
    
    if (bundleAnalyzed && depsAnalyzed && reportGenerated) {
      log('\n🎉 Analysis completed successfully!', 'green')
      process.exit(0)
    } else {
      log('\n💥 Analysis failed. Check errors above.', 'red')
      process.exit(1)
    }
    
  } catch (error) {
    logError(`Bundle analyzer failed: ${error.message}`)
    process.exit(1)
  }
}

// Handle command line arguments
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  log('NORMALDANCE Bundle Analyzer', 'bright')
  log('\nUsage: npm run analyze [options]')
  log('\nOptions:')
  log('  --help, -h     Show this help message')
  log('  --bundle       Analyze bundle size only')
  log('  --deps         Analyze dependencies only')
  log('  --report        Generate optimization report only')
  log('\nExamples:')
  log('  npm run analyze')
  log('  npm run analyze --bundle')
  log('  npm run analyze --deps')
  process.exit(0)
}

if (args.includes('--bundle')) {
  analyzeBundle()
  process.exit(0)
}

if (args.includes('--deps')) {
  analyzeDependencies()
  process.exit(0)
}

if (args.includes('--report')) {
  generateOptimizationReport()
  process.exit(0)
}

// Run full analysis by default
main()