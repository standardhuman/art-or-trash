// Art or Not? - Main Application Script
let currentImage = null;
let hasVoted = false;
let autoAdvanceTimer = null;
let imageHistory = [];
let historyIndex = -1;
const AUTO_ADVANCE_DELAY = 3000;
const MAX_HISTORY = 50;

// Initialize the application
async function init() {
    // Initialize auth system
    if (typeof initAuth === 'function') {
        await initAuth();
    }
    if (typeof initAuthUI === 'function') {
        initAuthUI();
    }

    // Initialize streak display
    if (typeof initStreak === 'function') {
        initStreak();
    }

    // Load first image
    await loadNewImage();

    // Initialize swipe gestures on the image
    initSwipeGestures();
}

function initSwipeGestures() {
    const imageEl = document.getElementById('current-image');
    if (typeof initSwipe === 'function' && imageEl) {
        initSwipe(imageEl, (voteType, confidence) => {
            if (!hasVoted) {
                handleVote(voteType, confidence);
            }
        });
    }
}

async function loadNewImage() {
    try {
        // Reset swipe element if needed
        const imageEl = document.getElementById('current-image');
        if (typeof resetSwipeElement === 'function' && imageEl) {
            resetSwipeElement(imageEl);
        }

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
                showPreviousImageFallback();
            }
        } catch (error) {
            console.error('Error fetching image stats:', error);
            showPreviousImageFallback();
        }
    }
}

function showPreviousImageResult(voteStats, actualType, imageDetails) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden', 'correct', 'incorrect');

    const artPercent = voteStats.total > 0 ? Math.round((voteStats.art / voteStats.total) * 100) : 0;
    const trashPercent = voteStats.total > 0 ? Math.round((voteStats.trash / voteStats.total) * 100) : 0;

    // Use new verdict system if available
    let verdictHtml = '';
    if (typeof generateVerdict === 'function') {
        const verdict = generateVerdict(artPercent, trashPercent);
        verdictHtml = `
            <div class="verdict-container tier-${verdict.tier}">
                <div class="verdict-percentages">
                    <div class="verdict-stat art">
                        <div class="percentage">${artPercent}%</div>
                        <div class="label">Art</div>
                    </div>
                    <div class="verdict-stat trash">
                        <div class="percentage">${trashPercent}%</div>
                        <div class="label">Trash</div>
                    </div>
                </div>
                <div class="verdict-copy">${verdict.text}</div>
                <button id="reveal-details-btn" class="reveal-btn" style="margin-top: 16px;">Reveal Actual Classification</button>
            </div>
        `;
    } else {
        verdictHtml = `
            <div class="vote-results">
                <p>🎨 ${artPercent}%</p>
                <p>🗑️ ${trashPercent}%</p>
                <button id="reveal-details-btn" class="reveal-btn">Reveal Actual Classification</button>
            </div>
        `;
    }

    resultDiv.innerHTML = verdictHtml;

    document.getElementById('reveal-details-btn').addEventListener('click', () => {
        showActualDetails(actualType, imageDetails);
    });
}

function showPreviousImageFallback() {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden', 'correct', 'incorrect');

    const imageDetails = {
        title: currentImage.title,
        artist: currentImage.artist,
        museum: currentImage.museum
    };

    resultDiv.innerHTML = `
        <div class="previous-image-info">
            <p><em>Previously viewed image</em></p>
            <button id="reveal-details-btn" class="reveal-btn">Reveal Classification</button>
        </div>
    `;

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

    img.onerror = null;

    img.onerror = function() {
        console.error('Failed to load image:', currentImage.url);

        const resultDiv = document.getElementById('result');
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Image has transcended physical existence. Loading next specimen...</p>';

        setTimeout(loadNewImage, 1500);
    };

    img.src = currentImage.url;
}

function resetUI() {
    hasVoted = false;
    clearTimeout(autoAdvanceTimer);

    // Hide swipe hint
    if (typeof hideSwipeHint === 'function') {
        hideSwipeHint();
    }

    document.getElementById('result').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = false;
    });
}

async function handleVote(vote, confidence = 'normal') {
    if (hasVoted) return;
    hasVoted = true;

    // Hide swipe hint
    if (typeof hideSwipeHint === 'function') {
        hideSwipeHint();
    }

    // Get user ID if logged in
    const userId = typeof getUser === 'function' && getUser() ? getUser().id : null;

    const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            imageId: currentImage.id,
            vote: vote,
            confidence: confidence,
            userId: userId
        })
    });

    const data = await response.json();

    // Update streak if confident vote
    if (confidence === 'confident' && typeof updateStreak === 'function') {
        updateStreak(data.predictionResult === 'correct');
    }

    showResult(data.voteStats, vote, data.actualType, data.imageDetails, data.predictionResult, confidence);

    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.disabled = true;
    });

    document.getElementById('next-btn').classList.remove('hidden');

    // Auto-advance after delay
    autoAdvanceTimer = setTimeout(() => {
        loadNewImage();
    }, AUTO_ADVANCE_DELAY);
}

function showResult(voteStats, userVote, actualType, imageDetails, predictionResult, confidence) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden', 'correct', 'incorrect');

    const artPercent = voteStats.total > 0 ? Math.round((voteStats.art / voteStats.total) * 100) : 0;
    const trashPercent = voteStats.total > 0 ? Math.round((voteStats.trash / voteStats.total) * 100) : 0;

    // Use new verdict system if available
    let verdictHtml = '';
    if (typeof generateVerdict === 'function') {
        const verdict = generateVerdict(artPercent, trashPercent);

        // Add prediction result message if confident vote
        let predictionMessage = '';
        if (confidence === 'confident' && predictionResult) {
            if (predictionResult === 'correct') {
                predictionMessage = '<div style="color: var(--accent-success); margin-top: 12px; font-weight: 500;">Your confident prediction was correct!</div>';
            } else {
                predictionMessage = '<div style="color: var(--accent-error); margin-top: 12px; font-weight: 500;">Your confident prediction missed the mark.</div>';
            }
        }

        verdictHtml = `
            <div class="verdict-container tier-${verdict.tier}">
                <div class="verdict-percentages">
                    <div class="verdict-stat art">
                        <div class="percentage">${artPercent}%</div>
                        <div class="label">Art</div>
                    </div>
                    <div class="verdict-stat trash">
                        <div class="percentage">${trashPercent}%</div>
                        <div class="label">Trash</div>
                    </div>
                </div>
                <div class="verdict-copy">${verdict.text}</div>
                ${predictionMessage}
                <button id="reveal-details-btn" class="reveal-btn" style="margin-top: 16px;">Reveal Actual Classification</button>
            </div>
        `;
    } else {
        verdictHtml = `
            <div class="vote-results">
                <p>🎨 ${artPercent}%</p>
                <p>🗑️ ${trashPercent}%</p>
                <button id="reveal-details-btn" class="reveal-btn">Reveal Actual Classification</button>
            </div>
        `;
    }

    resultDiv.innerHTML = verdictHtml;

    document.getElementById('reveal-details-btn').addEventListener('click', () => {
        showActualDetails(actualType, imageDetails);
    });
}

function showActualDetails(actualType, imageDetails) {
    clearTimeout(autoAdvanceTimer);

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

    const revealBtn = document.getElementById('reveal-details-btn');
    if (revealBtn) {
        revealBtn.outerHTML = detailMessage;
    }
}

// Button click handlers
document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const vote = e.currentTarget.getAttribute('data-vote');
        handleVote(vote, 'normal');
    });
});

document.getElementById('next-btn').addEventListener('click', loadNewImage);
document.getElementById('back-btn').addEventListener('click', loadPreviousImage);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.key) {
        case '1':
            if (!hasVoted && !document.querySelector('.art-btn').disabled) {
                handleVote('art', 'normal');
            }
            break;
        case '2':
            if (!hasVoted && !document.querySelector('.trash-btn').disabled) {
                handleVote('trash', 'normal');
            }
            break;
        case '!': // Shift+1 for confident art
            if (!hasVoted && !document.querySelector('.art-btn').disabled) {
                handleVote('art', 'confident');
            }
            break;
        case '@': // Shift+2 for confident trash
            if (!hasVoted && !document.querySelector('.trash-btn').disabled) {
                handleVote('trash', 'confident');
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

// Listen for auth state changes
window.addEventListener('authStateChanged', (e) => {
    const user = e.detail.user;
    // Update UI based on auth state (e.g., show/hide profile nav item)
    const profileNav = document.querySelector('[data-page="profile"]');
    if (profileNav) {
        profileNav.querySelector('.nav-label').textContent = user ? 'Profile' : 'Sign In';
    }
});

// Initialize on load
init();
