(function() {
    console.log("Unicode Cleaner Logic Loaded!");

    const textInput = document.getElementById('textInput');
    const previewArea = document.getElementById('previewArea');
    const issueBadge = document.getElementById('issueBadge');
    const charCount = document.getElementById('charCount');
    const statsPanel = document.getElementById('statsPanel');
    const toast = document.getElementById('toast');

    const CHARS = {
        invisible: /[\u200B-\u200D\uFEFF\u200E\u200F\u2028\u2029]/g,
        nbsp: /\u00A0/g,
        allHidden: /[\u200B-\u200D\uFEFF\u200E\u200F\u2028\u2029\u00A0]/g
    };

    function cleanTextByType(value, type) {
        if (type === 'all') {
            return value
    .normalize("NFC")
    .replace(CHARS.invisible, '')
    .replace(CHARS.nbsp, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");
        }
        if (type === 'nbsp') return value.replace(CHARS.nbsp, ' ');
        if (type === 'quotes') return value.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        return value;
    }

    function analyze() {
        if (!textInput || !previewArea) return;

        const text = textInput.value;
        const matches = text.match(CHARS.allHidden) || [];

        charCount.textContent = `${text.length.toLocaleString()} Characters`;
        issueBadge.textContent = `${matches.length} Issues Found`;
        issueBadge.classList.toggle('active', matches.length > 0);

        const statsList = document.getElementById('statsList');
        if (statsPanel && statsList) {
            statsPanel.style.display = matches.length > 0 ? 'block' : 'none';

            if (matches.length > 0) {
                const counts = {};
                matches.forEach(m => {
                    const hex = 'U+' + m.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
                    counts[hex] = (counts[hex] || 0) + 1;
                });

                statsList.innerHTML = Object.entries(counts).map(([hex, count]) => `
                    <li class="stat-item">
                        <span class="stat-code">${hex}</span>
                        <span class="stat-name">Invisible Character</span>
                        <span class="stat-count">Found ${count} time(s)</span>
                    </li>
                `).join('');
            }
        }

        if (text.length === 0) {
            previewArea.innerHTML = '<span class="empty-state">Result preview will appear here...</span>';
            return;
        }

        const highlighted = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(CHARS.allHidden, (m) =>
                `<span class="char-highlight" data-code="U+${m.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}"></span>`
            );

        previewArea.innerHTML = highlighted;
    }

    function applyFix(type) {
        let val = textInput.value;
        if (!val) { showToast("Nothing to clean!"); return; }

        val = cleanTextByType(val, type);

        textInput.value = val;
        analyze();
        showToast("Cleaned successfully!");
    }

    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // Event Listeners
    textInput?.addEventListener('input', analyze);

    document.getElementById('cleanAllBtn')?.addEventListener('click', () => applyFix('all'));
    document.getElementById('cleanNbspBtn')?.addEventListener('click', () => applyFix('nbsp'));
    document.getElementById('fixQuotesBtn')?.addEventListener('click', () => applyFix('quotes'));
    document.getElementById('clearBtn')?.addEventListener('click', () => {
        textInput.value = '';
        analyze();
    });

    document.getElementById('copyBtn')?.addEventListener('click', async () => {
    if (!textInput.value) return;

    const cleanedText = cleanTextByType(textInput.value, 'all');

    try {
        await navigator.clipboard.writeText(cleanedText);
        showToast("Copied clean text!");
    } catch (err) {
        showToast("Copy failed!");
    }
});

    // Load saved theme
    let savedTheme;
try {
    savedTheme = localStorage.getItem('theme');
} catch (e) {}
    if (savedTheme === 'dark' || savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    document.getElementById('loadSampleBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        textInput.value = "“Smart Quotes”\nZero Width: H\u200Be\u200Bl\u200Bl\u200Bo\nNBSP: Space\u00A0Between\nBOM: \uFEFFMetadata";
        analyze();
        showToast("Sample text loaded!");
    });

    document.getElementById('exportBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        const text = textInput.value;
        if (!text) { showToast("Nothing to export!"); return; }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'unicode_cleaned.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  try {
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
} catch (e) {}
    });

})();
