// Verdict copy system - tone escalates with conviction
const VERDICTS = {
    // Deadlocked (45-55%)
    deadlocked: {
        art: [
            "The tribunal remains divided on this one.",
            "Humanity cannot reach consensus.",
            "A hung jury. Art status: unresolved.",
            "The people are split. Art? Maybe. Maybe not.",
            "Democracy has spoken: it's complicated."
        ],
        trash: [
            "The tribunal remains divided on this one.",
            "Humanity cannot reach consensus.",
            "A hung jury. Trash status: debatable.",
            "The people are split. Garbage? The jury's out.",
            "Democracy shrugs."
        ]
    },
    // Leaning (56-70%)
    leaning: {
        art: [
            "A modest majority has ruled: art.",
            "More art than not, according to the people.",
            "The crowd tilts toward art, but doubters remain.",
            "Tentatively artistic, says the tribunal.",
            "Art-ish. The people have sort of spoken."
        ],
        trash: [
            "A modest majority has ruled: not art.",
            "More trash than treasure, says the crowd.",
            "The people lean toward garbage, but some see beauty.",
            "Tentatively trashy, says the tribunal.",
            "Garbage-adjacent. The people are lukewarm."
        ]
    },
    // Clear (71-85%)
    clear: {
        art: [
            "The verdict is in: definitively art.",
            "A confident majority recognizes artistic merit.",
            "Three quarters of humanity embraces this as art.",
            "The tribunal has ruled with conviction: art.",
            "Clear artistic merit, according to the crowd."
        ],
        trash: [
            "The verdict is in: definitively not art.",
            "A confident majority rejects this as art.",
            "Three quarters of humanity votes: garbage.",
            "The tribunal has ruled with conviction: trash.",
            "Clearly not art, says the crowd."
        ]
    },
    // Landslide (86-95%)
    landslide: {
        art: [
            "The people have spoken with conviction: art.",
            "Near-universal acclaim. This is art.",
            "An overwhelming consensus embraces this as art.",
            "The tribunal speaks with one voice: definitely art.",
            "Humanity has little doubt: this is the real deal."
        ],
        trash: [
            "The people have spoken with conviction: garbage.",
            "Near-universal rejection. Not art.",
            "An overwhelming consensus: this is trash.",
            "The tribunal speaks with one voice: definitely not art.",
            "Humanity has little doubt: this belongs in a bin."
        ]
    },
    // Unanimous (96%+)
    unanimous: {
        art: [
            "Humanity has spoken with devastating clarity: this is art.",
            "A rare moment of unity. Art, beyond dispute.",
            "In a world divided on everything, we agree: masterpiece.",
            "The tribunal is unanimous. Frame it.",
            "Consensus achieved. Humanity recognizes art when it sees it."
        ],
        trash: [
            "Humanity has spoken with devastating clarity: this is garbage.",
            "A rare moment of unity. Trash, beyond dispute.",
            "In a world divided on everything, we agree: rubbish.",
            "The tribunal is unanimous. Dispose of it responsibly.",
            "Consensus achieved. Humanity knows trash when it sees it."
        ]
    }
};

// Get verdict tier based on percentage
function getVerdictTier(percentage) {
    if (percentage >= 96) return 'unanimous';
    if (percentage >= 86) return 'landslide';
    if (percentage >= 71) return 'clear';
    if (percentage >= 56) return 'leaning';
    return 'deadlocked';
}

// Generate verdict copy
function generateVerdict(artPercent, trashPercent) {
    const total = artPercent + trashPercent;
    if (total === 0) return { text: "No votes yet. You're the first.", tier: 'none' };

    const winningPercent = Math.max(artPercent, trashPercent);
    const winner = artPercent > trashPercent ? 'art' : 'trash';
    const tier = getVerdictTier(winningPercent);

    const options = VERDICTS[tier][winner];
    const text = options[Math.floor(Math.random() * options.length)];

    return { text, tier, winner, percentage: winningPercent };
}
