(function() {
    // 1. Grab all the pieces from the page
    const textInput = document.getElementById('textInput');
    const previewArea = document.getElementById('previewArea');
    const issueBadge = document.getElementById('issueBadge');
    const charCount = document.getElementById('charCount');
    const toast = document.getElementById('toast');

    // 2. The "Filter" definitions
    const CHARS = {
        invisible: /[\u200B-\u200D\uFEFF\u200E\u200F\u2028\u2029]/g,
        nbsp: /\u00A0/g,
        quotes: /[“”‘’]/g,
        allHidden: /[\u200B-\u200D\uFEFF\u200E\u200F\u2028\u2029\u00A0]/g
    };

document.getElementById('loadSampleBtn')?.addEventListener('click', () => {
    textInput.value = "“Smart Quotes”\nZero Width: H\u200Be\u200Bl\u200Bl\u200Bo\nNBSP: Space\u00A0Between";
    analyze();
    showToast("Sample loaded!");
});

    
    // 3. This runs every time you type
    function analyze() {
        if (!textInput || !previewArea) return;
        const text = textInput.value;
        const matches = text.match(CHARS.allHidden) || [];
        
        charCount.textContent = `${text.length} Characters`;
        issueBadge.textContent = `${matches.length} Issues Found`;
        issueBadge.classList.toggle('active', matches.length > 0);

        if (text.length === 0) {
            previewArea.innerHTML = '<span class="empty-state">Result preview will appear here...</span>';
            return;
        }

        // Create the visual highlights (Red boxes)
        const highlighted = text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // Safety first
            .replace(CHARS.allHidden, (m) => `<span class="char-highlight" data-code="${m.charCodeAt(0).toString(16).toUpperCase()}"></span>`);
        
        previewArea.innerHTML = highlighted;
    }

    // 4. The "Cleaning" logic
    function applyFix(type) {
        let val = textInput.value;
        if (type === 'all') {
            val = val.replace(CHARS.invisible, '').replace(CHARS.nbsp, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        } else if (type === 'nbsp') {
            val = val.replace(CHARS.nbsp, ' ');
        } else if (type === 'quotes') {
            val = val.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        }
        
        textInput.value = val;
        analyze();
        showToast("Cleaned successfully!");
    }

    // 5. Connect the buttons to the logic
    textInput?.addEventListener('input', analyze);
    document.getElementById('cleanAllBtn')?.addEventListener('click', () => applyFix('all'));
    document.getElementById('cleanNbspBtn')?.addEventListener('click', () => applyFix('nbsp'));
    document.getElementById('fixQuotesBtn')?.addEventListener('click', () => applyFix('quotes'));
    document.getElementById('clearBtn')?.addEventListener('click', () => { textInput.value = ''; analyze(); });
    document.getElementById('copyBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(textInput.value);
        showToast("Copied clean text!");
    });

    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // Theme Toggle Logic
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
})();

