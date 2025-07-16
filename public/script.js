let currentImage = null;
let hasVoted = false;

async function loadNewImage() {
    try {
        const response = await fetch('/api/random-image');
        currentImage = await response.json();
        
        displayImage();
        resetUI();
        loadStats();
    } catch (error) {
        console.error('Error loading image:', error);
    }
}

function displayImage() {
    const img = document.getElementById('current-image');
    img.src = currentImage.url;
    
    img.onerror = () => img.src = 'https://via.placeholder.com/600x600?text=Image+Not+Found';
}

function resetUI() {
    hasVoted = false;
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
}

function showResult(isCorrect, vote) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden', 'correct', 'incorrect');
    
    let message = '';
    if (currentImage.type === 'art') {
        message = `This is ART! "${currentImage.title}" by ${currentImage.artist} (${currentImage.museum})`;
    } else {
        message = `This is TRASH! Just a ${currentImage.title}`;
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

loadNewImage();