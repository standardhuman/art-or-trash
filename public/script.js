let currentImage = null;
let hasVoted = false;
let autoAdvanceTimer = null;
let imageHistory = [];
let historyIndex = -1;
const AUTO_ADVANCE_DELAY = 3000; // 3 seconds
const MAX_HISTORY = 50; // Keep last 50 images

async function loadNewImage() {
    try {
        const response = await fetch('/api/random-image');
        currentImage = await response.json();
        
        // Add to history
        historyIndex++;
        imageHistory = imageHistory.slice(0, historyIndex);
        imageHistory.push(currentImage);
        
        // Limit history size
        if (imageHistory.length > MAX_HISTORY) {
            imageHistory.shift();
            historyIndex--;
        }
        
        displayImage();
        resetUI();
        loadStats();
        updateBackButton();
    } catch (error) {
        console.error('Error loading image:', error);
    }
}

function loadPreviousImage() {
    if (historyIndex > 0) {
        historyIndex--;
        currentImage = imageHistory[historyIndex];
        displayImage();
        resetUI();
        updateBackButton();
        
        // Show info about previous image
        const resultDiv = document.getElementById('result');
        resultDiv.classList.remove('hidden', 'correct', 'incorrect');
        resultDiv.classList.add('info');
        
        let message = '';
        if (currentImage.type === 'art') {
            message = `This is ART: "${currentImage.title}" by ${currentImage.artist} (${currentImage.museum})`;
        } else {
            message = `This is NOT ART: ${currentImage.title}`;
        }
        resultDiv.innerHTML = `ℹ️ ${message}`;
    }
}

function updateBackButton() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.disabled = historyIndex <= 0;
    }
}

function displayImage() {
    const img = document.getElementById('current-image');
    
    // Clear any existing error handlers
    img.onerror = null;
    
    // Set up new error handler with retry logic
    let retryCount = 0;
    img.onerror = function() {
        console.error('Failed to load image:', currentImage.url);
        
        // Only retry once, then skip to next image
        if (retryCount === 0) {
            retryCount++;
            // Try a data URL as fallback
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="24" fill="%23999"%3EImage Not Found%3C/text%3E%3C/svg%3E';
        } else {
            // Skip to next image automatically
            console.log('Skipping broken image, loading next...');
            setTimeout(loadNewImage, 500);
        }
    };
    
    // Set the image source
    img.src = currentImage.url;
}

function resetUI() {
    hasVoted = false;
    clearTimeout(autoAdvanceTimer);
    document.getElementById('result').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = false;
    });
}

async function handleVote(vote) {
    if (hasVoted) return;
    hasVoted = true;
    
    const isCorrect = (vote === 'art' && currentImage.type === 'art') || 
                     (vote === 'trash' && currentImage.type === 'trash');
    
    await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            imageId: currentImage.id,
            vote: vote
        })
    });
    
    showResult(isCorrect, vote);
    
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    document.getElementById('next-btn').classList.remove('hidden');
    
    // Auto-advance after delay
    autoAdvanceTimer = setTimeout(() => {
        loadNewImage();
    }, AUTO_ADVANCE_DELAY);
}

function showResult(isCorrect, vote) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden', 'correct', 'incorrect');
    
    let message = '';
    if (currentImage.type === 'art') {
        message = `This is ART! "${currentImage.title}" by ${currentImage.artist} (${currentImage.museum})`;
    } else {
        message = `This is NOT ART! Just ${currentImage.title}`;
    }
    
    if (isCorrect) {
        resultDiv.classList.add('correct');
        resultDiv.innerHTML = `✅ Correct! ${message}`;
    } else {
        resultDiv.classList.add('incorrect');
        resultDiv.innerHTML = `❌ Wrong! ${message}`;
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        const statsContent = document.getElementById('stats-content');
        statsContent.innerHTML = '';
        
        let totalCorrect = 0;
        let totalVotes = 0;
        
        stats.forEach(stat => {
            const correct = stat.type === 'art' ? stat.voted_art : stat.voted_trash;
            const accuracy = stat.total_votes > 0 ? (correct / stat.total_votes * 100).toFixed(1) : 0;
            
            totalCorrect += correct;
            totalVotes += stat.total_votes;
                
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <h4>${stat.type === 'art' ? 'Art Recognized as Art' : 'Trash Recognized as Trash'}</h4>
                <div class="percentage">${accuracy}%</div>
                <small>${stat.total_votes} votes</small>
            `;
            statsContent.appendChild(statItem);
        });
        
        if (totalVotes > 0) {
            const overallAccuracy = (totalCorrect / totalVotes * 100).toFixed(1);
            const overallItem = document.createElement('div');
            overallItem.className = 'stat-item overall';
            overallItem.innerHTML = `
                <h4>Overall Accuracy</h4>
                <div class="percentage">${overallAccuracy}%</div>
                <small>${totalVotes} total votes</small>
            `;
            statsContent.appendChild(overallItem);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const vote = e.currentTarget.getAttribute('data-vote');
        handleVote(vote);
    });
});

document.getElementById('next-btn').addEventListener('click', loadNewImage);
document.getElementById('back-btn').addEventListener('click', loadPreviousImage);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Prevent shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
        case '1':
            if (!hasVoted && !document.querySelector('.art-btn').disabled) {
                handleVote('art');
            }
            break;
        case '2':
            if (!hasVoted && !document.querySelector('.trash-btn').disabled) {
                handleVote('trash');
            }
            break;
        case ' ':
        case 'Enter':
            e.preventDefault();
            if (hasVoted && !document.getElementById('next-btn').classList.contains('hidden')) {
                loadNewImage();
            }
            break;
        case 'ArrowLeft':
        case 'Backspace':
            e.preventDefault();
            loadPreviousImage();
            break;
    }
});

loadNewImage();