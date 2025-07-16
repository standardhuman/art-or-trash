const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function visualTest() {
    console.log('📸 Running visual tests and capturing screenshots...\n');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });
    
    const browser = await chromium.launch({ 
        headless: true
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Test 1: Desktop view
        console.log('1. Testing desktop view...');
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.goto('http://localhost:4444');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('#current-image', { state: 'visible' });
        await page.screenshot({ 
            path: path.join(screenshotsDir, '1-desktop-initial.png'),
            fullPage: true 
        });
        console.log('   ✅ Screenshot saved: 1-desktop-initial.png');
        
        // Test 2: Vote as Art
        console.log('2. Testing Art vote...');
        await page.click('.art-btn');
        await page.waitForSelector('#result:not(.hidden)');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '2-desktop-voted-art.png'),
            fullPage: true 
        });
        console.log('   ✅ Screenshot saved: 2-desktop-voted-art.png');
        
        // Test 3: Next image
        console.log('3. Testing next image...');
        await page.click('#next-btn');
        await page.waitForSelector('.vote-btn:not(:disabled)');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '3-desktop-next-image.png'),
            fullPage: true 
        });
        console.log('   ✅ Screenshot saved: 3-desktop-next-image.png');
        
        // Test 4: Vote as Trash
        console.log('4. Testing Trash vote...');
        await page.click('.trash-btn');
        await page.waitForSelector('#result:not(.hidden)');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '4-desktop-voted-trash.png'),
            fullPage: true 
        });
        console.log('   ✅ Screenshot saved: 4-desktop-voted-trash.png');
        
        // Test 5: Mobile view
        console.log('5. Testing mobile view...');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('#current-image', { state: 'visible' });
        await page.screenshot({ 
            path: path.join(screenshotsDir, '5-mobile-initial.png'),
            fullPage: true 
        });
        console.log('   ✅ Screenshot saved: 5-mobile-initial.png');
        
        // Test 6: Mobile vote
        console.log('6. Testing mobile vote...');
        await page.click('.art-btn');
        await page.waitForSelector('#result:not(.hidden)');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '6-mobile-voted.png'),
            fullPage: true 
        });
        console.log('   ✅ Screenshot saved: 6-mobile-voted.png');
        
        // Test 7: Tablet view
        console.log('7. Testing tablet view...');
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('#current-image', { state: 'visible' });
        await page.screenshot({ 
            path: path.join(screenshotsDir, '7-tablet-view.png'),
            fullPage: true 
        });
        console.log('   ✅ Screenshot saved: 7-tablet-view.png');
        
        // Test 8: Error state (simulate network error)
        console.log('8. Testing error state...');
        await page.route('**/api/random-image', route => route.abort());
        await page.reload();
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotsDir, '8-error-state.png'),
            fullPage: true 
        });
        console.log('   ✅ Screenshot saved: 8-error-state.png');
        
        console.log('\n✨ Visual tests completed!');
        console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
        
    } catch (error) {
        console.error('❌ Visual test error:', error);
    } finally {
        await browser.close();
    }
}

// Run the visual tests
visualTest().catch(console.error);