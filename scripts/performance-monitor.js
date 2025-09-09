#!/usr/bin/env node

/**
 * Performance monitoring script for AI Workout Backend
 * Monitors key performance metrics and alerts on issues
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.MONITOR_URL || 'https://ai-workout-backend-2024.web.app',
  timeout: 10000, // 10 seconds
  thresholds: {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    availability: 0.99, // 99%
  },
  endpoints: [
    '/health',
    '/api/v1/status',
    '/api/v1/workouts/test',
  ],
  outputFile: path.join(__dirname, '../performance-report.json'),
};

/**
 * Make HTTP request with timeout
 */
function makeRequest(url, timeout = CONFIG.timeout) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.get(url, { timeout }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data: data.slice(0, 1000), // Limit data size
          headers: res.headers,
          success: res.statusCode >= 200 && res.statusCode < 300,
        });
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Test single endpoint
 */
async function testEndpoint(endpoint) {
  const url = `${CONFIG.baseUrl}${endpoint}`;
  console.log(`Testing ${url}...`);
  
  try {
    const result = await makeRequest(url);
    
    const status = {
      endpoint,
      url,
      success: result.success,
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      timestamp: new Date().toISOString(),
      issues: [],
    };
    
    // Check response time
    if (result.responseTime > CONFIG.thresholds.responseTime) {
      status.issues.push(`Slow response: ${result.responseTime}ms > ${CONFIG.thresholds.responseTime}ms`);
    }
    
    // Check status code
    if (!result.success) {
      status.issues.push(`HTTP error: ${result.statusCode}`);
    }
    
    return status;
  } catch (error) {
    return {
      endpoint,
      url,
      success: false,
      error: error.message,
      responseTime: null,
      timestamp: new Date().toISOString(),
      issues: [`Request failed: ${error.message}`],
    };
  }
}

/**
 * Run performance tests
 */
async function runPerformanceTests() {
  console.log('🚀 Starting performance monitoring...');
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Endpoints: ${CONFIG.endpoints.length}`);
  console.log('');
  
  const results = [];
  
  for (const endpoint of CONFIG.endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Log result
    const status = result.success ? '✅' : '❌';
    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
    console.log(`${status} ${endpoint} - ${time}`);
    
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

/**
 * Calculate summary metrics
 */
function calculateSummary(results) {
  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = total - successful;
  
  const responseTimes = results
    .filter(r => r.responseTime !== null)
    .map(r => r.responseTime);
  
  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;
  
  const maxResponseTime = responseTimes.length > 0 
    ? Math.max(...responseTimes)
    : 0;
  
  const availability = successful / total;
  const errorRate = failed / total;
  
  return {
    total,
    successful,
    failed,
    availability,
    errorRate,
    avgResponseTime,
    maxResponseTime,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate report
 */
function generateReport(results, summary) {
  const report = {
    summary,
    results,
    thresholds: CONFIG.thresholds,
    config: {
      baseUrl: CONFIG.baseUrl,
      endpoints: CONFIG.endpoints,
      timestamp: new Date().toISOString(),
    },
  };
  
  // Save to file
  try {
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
    console.log(`\n📊 Report saved to: ${CONFIG.outputFile}`);
  } catch (error) {
    console.error(`Failed to save report: ${error.message}`);
  }
  
  return report;
}

/**
 * Print summary
 */
function printSummary(summary) {
  console.log('\n📈 Performance Summary:');
  console.log(`   Availability: ${(summary.availability * 100).toFixed(1)}%`);
  console.log(`   Error Rate: ${(summary.errorRate * 100).toFixed(1)}%`);
  console.log(`   Avg Response Time: ${summary.avgResponseTime}ms`);
  console.log(`   Max Response Time: ${summary.maxResponseTime}ms`);
  console.log(`   Total Requests: ${summary.total}`);
  console.log(`   Successful: ${summary.successful}`);
  console.log(`   Failed: ${summary.failed}`);
  
  // Check thresholds
  const issues = [];
  
  if (summary.availability < CONFIG.thresholds.availability) {
    issues.push(`Low availability: ${(summary.availability * 100).toFixed(1)}% < ${(CONFIG.thresholds.availability * 100).toFixed(1)}%`);
  }
  
  if (summary.errorRate > CONFIG.thresholds.errorRate) {
    issues.push(`High error rate: ${(summary.errorRate * 100).toFixed(1)}% > ${(CONFIG.thresholds.errorRate * 100).toFixed(1)}%`);
  }
  
  if (summary.avgResponseTime > CONFIG.thresholds.responseTime) {
    issues.push(`Slow average response: ${summary.avgResponseTime}ms > ${CONFIG.thresholds.responseTime}ms`);
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️  Performance Issues:');
    issues.forEach(issue => console.log(`   ${issue}`));
    return false;
  } else {
    console.log('\n✅ All performance thresholds met!');
    return true;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const results = await runPerformanceTests();
    const summary = calculateSummary(results);
    const report = generateReport(results, summary);
    const allGood = printSummary(summary);
    
    // Exit with appropriate code
    process.exit(allGood ? 0 : 1);
  } catch (error) {
    console.error('❌ Performance monitoring failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runPerformanceTests,
  calculateSummary,
  generateReport,
  CONFIG,
};
