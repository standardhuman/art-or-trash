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

async function loadPreviousImage() {
    if (historyIndex > 0) {
        historyIndex--;
        currentImage = imageHistory[historyIndex];
        displayImage();
        resetUI();
        updateBackButton();
        
        // Get vote stats for this image
        try {
            const response = await fetch(`/api/image-stats/${currentImage.id}`);
            if (response.ok) {
                const data = await response.json();
                showPreviousImageResult(data.voteStats, currentImage.type, {
                    title: currentImage.title,
                    artist: currentImage.artist,
                    museum: currentImage.museum
                });
            } else {
                // Fallback if no stats available
                showPreviousImageFallback();
            }
        } catch (error) {
            console.error('Error fetching image stats:', error);
            showPreviousImageFallback();
        }
    }
}

function showPreviousImageResult(voteStats, actualType, imageDetails) {
    // Hide vote teasers for previous images
    document.getElementById('vote-teasers').style.display = 'none';
    
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden', 'correct', 'incorrect');
    
    const artPercent = voteStats.total > 0 ? Math.round((voteStats.art / voteStats.total) * 100) : 0;
    const trashPercent = voteStats.total > 0 ? Math.round((voteStats.trash / voteStats.total) * 100) : 0;
    
    let message = `
        <div class="vote-results">
            <p>🎨 ${artPercent}%</p>
            <p>🗑️ ${trashPercent}%</p>
            <button id="reveal-details-btn" class="reveal-btn">Reveal Actual Classification</button>
        </div>
    `;
    
    resultDiv.innerHTML = message;
    
    // Add click handler for reveal button
    document.getElementById('reveal-details-btn').addEventListener('click', () => {
        showActualDetails(actualType, imageDetails);
    });
}

function showPreviousImageFallback() {
    // Hide vote teasers for previous images
    document.getElementById('vote-teasers').style.display = 'none';
    
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden', 'correct', 'incorrect');
    
    const imageDetails = {
        title: currentImage.title,
        artist: currentImage.artist,
        museum: currentImage.museum
    };
    
    let message = `
        <div class="previous-image-info">
            <p><em>Previously viewed image</em></p>
            <button id="reveal-details-btn" class="reveal-btn">Reveal Classification</button>
        </div>
    `;
    
    resultDiv.innerHTML = message;
    
    // Add click handler for reveal button
    document.getElementById('reveal-details-btn').addEventListener('click', () => {
        showActualDetails(currentImage.type, imageDetails);
    });
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
    
    // Set up error handler to seamlessly skip broken images
    img.onerror = function() {
        console.error('Failed to load image:', currentImage.url);
        
        // Show brief dry humor message then auto-advance
        const resultDiv = document.getElementById('result');
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">Image has transcended physical existence. Loading next specimen...</p>';
        
        // Skip to next image automatically after brief delay
        setTimeout(loadNewImage, 1500);
    };
    
    // Set the image source
    img.src = currentImage.url;
}

function resetUI() {
    hasVoted = false;
    clearTimeout(autoAdvanceTimer);
    document.getElementById('result').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('vote-teasers').style.display = 'flex';
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = false;
    });
}

async function handleVote(vote) {
    if (hasVoted) return;
    hasVoted = true;
    
    const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            imageId: currentImage.id,
            vote: vote
        })
    });
    
    const data = await response.json();
    
    showResult(data.voteStats, vote, data.actualType, data.imageDetails);
    
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    document.getElementById('next-btn').classList.remove('hidden');
    
    // Auto-advance after delay
    autoAdvanceTimer = setTimeout(() => {
        loadNewImage();
    }, AUTO_ADVANCE_DELAY);
}

function showResult(voteStats, userVote, actualType, imageDetails) {
    // Hide vote teasers
    document.getElementById('vote-teasers').style.display = 'none';
    
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden', 'correct', 'incorrect');
    
    const artPercent = voteStats.total > 0 ? Math.round((voteStats.art / voteStats.total) * 100) : 0;
    const trashPercent = voteStats.total > 0 ? Math.round((voteStats.trash / voteStats.total) * 100) : 0;
    
    let message = `
        <div class="vote-results">
            <p>🎨 ${artPercent}%</p>
            <p>🗑️ ${trashPercent}%</p>
            <button id="reveal-details-btn" class="reveal-btn">Reveal Actual Classification</button>
        </div>
    `;
    
    resultDiv.innerHTML = message;
    
    // Add click handler for reveal button
    document.getElementById('reveal-details-btn').addEventListener('click', () => {
        showActualDetails(actualType, imageDetails);
    });
}

function showActualDetails(actualType, imageDetails) {
    const resultDiv = document.getElementById('result');
    
    let detailMessage = '';
    if (actualType === 'art') {
        detailMessage = `<div class="actual-details">
            <p><strong>Actual Classification:</strong> Art</p>
            <p><strong>Title:</strong> "${imageDetails.title}"</p>
            <p><strong>Artist:</strong> ${imageDetails.artist}</p>
            <p><strong>Collection:</strong> ${imageDetails.museum}</p>
        </div>`;
    } else {
        detailMessage = `<div class="actual-details">
            <p><strong>Actual Classification:</strong> Not Art</p>
            <p><strong>Description:</strong> ${imageDetails.title}</p>
        </div>`;
    }
    
    resultDiv.innerHTML = resultDiv.innerHTML.replace(
        '<button id="reveal-details-btn" class="reveal-btn">Reveal Actual Classification</button>',
        detailMessage
    );
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