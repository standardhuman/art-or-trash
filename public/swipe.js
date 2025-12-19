// Swipe handler using Hammer.js
let swipeHandler = null;
let onVoteCallback = null;

function initSwipe(element, onVote) {
    onVoteCallback = onVote;

    // Create Hammer instance
    swipeHandler = new Hammer(element);

    // Enable all directions
    swipeHandler.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    // Handle swipes
    swipeHandler.on('swipeleft swiperight swipeup swipedown', (e) => {
        const vote = getVoteFromSwipe(e.type);
        if (vote && onVoteCallback) {
            animateSwipe(element, e.type);
            onVoteCallback(vote.type, vote.confidence);
        }
    });

    // Visual feedback during pan
    swipeHandler.on('pan', (e) => {
        const x = e.deltaX;
        const y = e.deltaY;
        const rotation = x * 0.05;

        element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
        element.style.transition = 'none';

        // Show directional hint
        updateSwipeHint(x, y);
    });

    swipeHandler.on('panend', (e) => {
        // If not a full swipe, reset position
        if (Math.abs(e.deltaX) < 80 && Math.abs(e.deltaY) < 80) {
            element.style.transform = '';
            element.style.transition = 'transform 0.3s ease';
            hideSwipeHint();
        }
    });
}

function getVoteFromSwipe(swipeType) {
    switch (swipeType) {
        case 'swiperight': return { type: 'art', confidence: 'normal' };
        case 'swipeleft': return { type: 'trash', confidence: 'normal' };
        case 'swipeup': return { type: 'art', confidence: 'confident' };
        case 'swipedown': return { type: 'trash', confidence: 'confident' };
        default: return null;
    }
}

function animateSwipe(element, swipeType) {
    const animations = {
        swiperight: { x: 500, rotate: 20, opacity: 0 },
        swipeleft: { x: -500, rotate: -20, opacity: 0 },
        swipeup: { y: -500, scale: 1.1, opacity: 0 },
        swipedown: { y: 500, scale: 0.9, opacity: 0 }
    };

    const anim = animations[swipeType];
    element.style.transition = 'all 0.4s ease-out';
    element.style.transform = `translate(${anim.x || 0}px, ${anim.y || 0}px) rotate(${anim.rotate || 0}deg) scale(${anim.scale || 1})`;
    element.style.opacity = '0';
}

function resetSwipeElement(element) {
    element.style.transition = 'none';
    element.style.transform = '';
    element.style.opacity = '1';
}

function updateSwipeHint(x, y) {
    // Will update UI hint based on direction
    const hint = document.getElementById('swipe-hint');
    if (!hint) return;

    if (Math.abs(x) > Math.abs(y)) {
        hint.textContent = x > 0 ? 'Art' : 'Trash';
        hint.className = 'swipe-hint ' + (x > 0 ? 'art' : 'trash');
    } else {
        hint.textContent = y < 0 ? 'Confident Art' : 'Confident Trash';
        hint.className = 'swipe-hint ' + (y < 0 ? 'confident-art' : 'confident-trash');
    }
    hint.classList.remove('hidden');
}

function hideSwipeHint() {
    const hint = document.getElementById('swipe-hint');
    if (hint) hint.classList.add('hidden');
}

function destroySwipe() {
    if (swipeHandler) {
        swipeHandler.destroy();
        swipeHandler = null;
    }
}
