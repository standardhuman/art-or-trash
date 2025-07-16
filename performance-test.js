const { chromium } = require('playwright');

async function performanceTest() {
    console.log('⚡ Running performance tests...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const results = {
        pageLoad: [],
        apiCalls: [],
        votes: []
    };
    
    try {
        // Test 1: Page load times
        console.log('1. Testing page load performance (5 iterations)...');
        for (let i = 0; i < 5; i++) {
            const start = Date.now();
            await page.goto('http://localhost:4444');
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - start;
            results.pageLoad.push(loadTime);
            console.log(`   Load ${i + 1}: ${loadTime}ms`);
        }
        
        // Test 2: API response times
        console.log('\n2. Testing API response times (10 calls)...');
        for (let i = 0; i < 10; i++) {
            const start = Date.now();
            const response = await page.evaluate(async () => {
                const res = await fetch('/api/random-image');
                return await res.json();
            });
            const apiTime = Date.now() - start;
            results.apiCalls.push(apiTime);
            console.log(`   API call ${i + 1}: ${apiTime}ms`);
        }
        
        // Test 3: Vote interaction times
        console.log('\n3. Testing vote interaction times (5 votes)...');
        for (let i = 0; i < 5; i++) {
            await page.reload();
            await page.waitForSelector('.vote-btn:not(:disabled)');
            
            const start = Date.now();
            await page.click('.art-btn');
            await page.waitForSelector('#result:not(.hidden)');
            const voteTime = Date.now() - start;
            results.votes.push(voteTime);
            console.log(`   Vote ${i + 1}: ${voteTime}ms`);
        }
        
        // Calculate statistics
        const calculateStats = (arr) => {
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            const min = Math.min(...arr);
            const max = Math.max(...arr);
            return { avg: avg.toFixed(0), min, max };
        };
        
        console.log('\n📊 Performance Summary:');
        console.log('   Page Load Times:');
        const pageStats = calculateStats(results.pageLoad);
        console.log(`     Average: ${pageStats.avg}ms`);
        console.log(`     Min: ${pageStats.min}ms, Max: ${pageStats.max}ms`);
        
        console.log('   API Response Times:');
        const apiStats = calculateStats(results.apiCalls);
        console.log(`     Average: ${apiStats.avg}ms`);
        console.log(`     Min: ${apiStats.min}ms, Max: ${apiStats.max}ms`);
        
        console.log('   Vote Interaction Times:');
        const voteStats = calculateStats(results.votes);
        console.log(`     Average: ${voteStats.avg}ms`);
        console.log(`     Min: ${voteStats.min}ms, Max: ${voteStats.max}ms`);
        
        // Performance recommendations
        console.log('\n💡 Performance Analysis:');
        if (pageStats.avg > 1000) {
            console.log('   ⚠️  Page load is slow (>1s). Consider optimizing assets.');
        } else {
            console.log('   ✅ Page load is fast (<1s).');
        }
        
        if (apiStats.avg > 100) {
            console.log('   ⚠️  API responses are slow (>100ms). Consider database indexing.');
        } else {
            console.log('   ✅ API responses are fast (<100ms).');
        }
        
        if (voteStats.avg > 500) {
            console.log('   ⚠️  Vote interactions are slow (>500ms). Consider optimizing JavaScript.');
        } else {
            console.log('   ✅ Vote interactions are responsive (<500ms).');
        }
        
    } catch (error) {
        console.error('❌ Performance test error:', error);
    } finally {
        await browser.close();
    }
}

// Run the performance tests
performanceTest().catch(console.error);