const { chromium } = require('playwright');

async function testArtOrTrashApp() {
    console.log('🧪 Starting Art or Trash app tests...\n');
    
    const browser = await chromium.launch({ 
        headless: false,  // Set to true for CI/CD
        slowMo: 500  // Slow down to see the tests
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    let testsPassed = 0;
    let testsFailed = 0;
    
    async function test(name, testFn) {
        try {
            await testFn();
            console.log(`✅ ${name}`);
            testsPassed++;
        } catch (error) {
            console.log(`❌ ${name}`);
            console.log(`   Error: ${error.message}`);
            testsFailed++;
        }
    }
    
    try {
        // Navigate to the app
        await test('App loads successfully', async () => {
            await page.goto('http://localhost:4444');
            await page.waitForLoadState('networkidle');
        });
        
        // Test 1: Check page title and heading
        await test('Page has correct title and heading', async () => {
            const title = await page.title();
            if (!title.includes('Art or Trash')) throw new Error('Title incorrect');
            
            const heading = await page.textContent('h1');
            if (heading !== 'Art or Trash?') throw new Error('Heading incorrect');
        });
        
        // Test 2: Check initial image loads
        await test('Initial image loads', async () => {
            await page.waitForSelector('#current-image', { state: 'visible' });
            const imgSrc = await page.getAttribute('#current-image', 'src');
            if (!imgSrc || imgSrc === '') throw new Error('No image loaded');
        });
        
        // Test 3: Check buttons are present and enabled
        await test('Art and Trash buttons are present and enabled', async () => {
            const artBtn = await page.$('.art-btn');
            const trashBtn = await page.$('.trash-btn');
            
            if (!artBtn || !trashBtn) throw new Error('Buttons not found');
            
            const artDisabled = await artBtn.isDisabled();
            const trashDisabled = await trashBtn.isDisabled();
            
            if (artDisabled || trashDisabled) throw new Error('Buttons are disabled');
        });
        
        // Test 4: Vote as Art
        await test('Can vote as Art', async () => {
            await page.click('.art-btn');
            
            // Check result appears
            await page.waitForSelector('#result:not(.hidden)', { timeout: 5000 });
            const resultText = await page.textContent('#result');
            
            if (!resultText.includes('Correct') && !resultText.includes('Wrong')) {
                throw new Error('Result not shown after voting');
            }
            
            // Check buttons are disabled after voting
            const artDisabled = await page.$eval('.art-btn', btn => btn.disabled);
            const trashDisabled = await page.$eval('.trash-btn', btn => btn.disabled);
            
            if (!artDisabled || !trashDisabled) {
                throw new Error('Buttons not disabled after voting');
            }
        });
        
        // Test 5: Next button appears and works
        await test('Next button appears and loads new image', async () => {
            await page.waitForSelector('#next-btn:not(.hidden)', { timeout: 5000 });
            
            // Get current image src
            const oldSrc = await page.getAttribute('#current-image', 'src');
            
            // Click next
            await page.click('#next-btn');
            
            // Wait for new image
            await page.waitForFunction(
                (oldSrc) => {
                    const img = document.querySelector('#current-image');
                    return img && img.src !== oldSrc;
                },
                oldSrc,
                { timeout: 5000 }
            );
            
            // Check buttons are re-enabled
            const artDisabled = await page.$eval('.art-btn', btn => btn.disabled);
            const trashDisabled = await page.$eval('.trash-btn', btn => btn.disabled);
            
            if (artDisabled || trashDisabled) {
                throw new Error('Buttons not re-enabled for new image');
            }
            
            // Check result is hidden
            const resultHidden = await page.$eval('#result', el => el.classList.contains('hidden'));
            if (!resultHidden) throw new Error('Result not hidden for new image');
        });
        
        // Test 6: Vote as Trash
        await test('Can vote as Trash', async () => {
            await page.click('.trash-btn');
            
            await page.waitForSelector('#result:not(.hidden)', { timeout: 5000 });
            const resultText = await page.textContent('#result');
            
            if (!resultText.includes('Correct') && !resultText.includes('Wrong')) {
                throw new Error('Result not shown after voting');
            }
        });
        
        // Test 7: Statistics are displayed
        await test('Statistics are displayed', async () => {
            await page.waitForSelector('#stats-content .stat-item', { timeout: 5000 });
            const statItems = await page.$$('#stats-content .stat-item');
            
            if (statItems.length < 2) {
                throw new Error('Not enough stat items displayed');
            }
            
            // Check for percentage displays
            const percentages = await page.$$eval('.percentage', els => els.map(el => el.textContent));
            for (const pct of percentages) {
                if (!pct.includes('%')) throw new Error('Invalid percentage format');
            }
        });
        
        // Test 8: Multiple rapid votes
        await test('Can handle multiple rapid votes', async () => {
            for (let i = 0; i < 5; i++) {
                await page.click('#next-btn');
                await page.waitForSelector('.vote-btn:not(:disabled)', { timeout: 5000 });
                
                // Randomly vote art or trash
                const voteArt = Math.random() > 0.5;
                await page.click(voteArt ? '.art-btn' : '.trash-btn');
                
                await page.waitForSelector('#result:not(.hidden)', { timeout: 5000 });
                await page.waitForSelector('#next-btn:not(.hidden)', { timeout: 5000 });
            }
        });
        
        // Test 9: Check API endpoints
        await test('API endpoints respond correctly', async () => {
            // Test random image endpoint
            const imageResponse = await page.evaluate(async () => {
                const res = await fetch('/api/random-image');
                return { status: res.status, data: await res.json() };
            });
            
            if (imageResponse.status !== 200) throw new Error('Random image API failed');
            if (!imageResponse.data.url) throw new Error('No URL in image response');
            
            // Test stats endpoint
            const statsResponse = await page.evaluate(async () => {
                const res = await fetch('/api/stats');
                return { status: res.status, data: await res.json() };
            });
            
            if (statsResponse.status !== 200) throw new Error('Stats API failed');
            if (!Array.isArray(statsResponse.data)) throw new Error('Stats not an array');
        });
        
        // Test 10: Mobile responsiveness
        await test('App is mobile responsive', async () => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(1000);
            
            // Check image resizes
            const imgWidth = await page.$eval('#current-image', el => el.offsetWidth);
            if (imgWidth > 375) throw new Error('Image too wide for mobile');
            
            // Check buttons stack vertically
            const btnContainer = await page.$eval('.button-container', el => {
                return window.getComputedStyle(el).flexDirection;
            });
            if (btnContainer !== 'column') throw new Error('Buttons not stacked on mobile');
        });
        
    } catch (error) {
        console.error('\n🚨 Test suite error:', error);
    } finally {
        // Summary
        console.log('\n📊 Test Summary:');
        console.log(`   Passed: ${testsPassed}`);
        console.log(`   Failed: ${testsFailed}`);
        console.log(`   Total: ${testsPassed + testsFailed}`);
        
        await browser.close();
    }
}

// Run the tests
testArtOrTrashApp().catch(console.error);