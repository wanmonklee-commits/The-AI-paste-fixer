
    /**
     * INVISIBLE CHARACTER DETECTOR & CLEANER
     * A pure vanilla JS implementation for detecting and removing problematic Unicode characters.
     */

    (function() {
        'use strict';

        // --- Configuration & Definitions ---
        
        // Map of problematic characters to detect
        const CHAR_MAP = {
            '\u200B': { name: 'Zero Width Space', code: 'U+200B', type: 'invisible', action: 'remove', desc: 'Hidden space often found in copied web text.' },
            '\u200C': { name: 'Zero Width Non-Joiner', code: 'U+200C', type: 'invisible', action: 'remove', desc: 'Prevents ligatures in complex scripts.' },
            '\u200D': { name: 'Zero Width Joiner', code: 'U+200D', type: 'invisible', action: 'remove', desc: 'Forces ligatures; breaks some parsers.' },
            '\u00A0': { name: 'Non-Breaking Space', code: 'U+00A0', type: 'visible-ish', action: 'replace', desc: 'Looks like space but prevents line breaks.' },
            '\uFEFF': { name: 'Byte Order Mark', code: 'U+FEFF', type: 'invisible', action: 'remove', desc: 'Metadata char often at start of files.' },
            '\u200E': { name: 'Left-to-Right Mark', code: 'U+200E', type: 'invisible', action: 'remove', desc: 'Directional formatting mark.' },
            '\u200F': { name: 'Right-to-Left Mark', code: 'U+200F', type: 'invisible', action: 'remove', desc: 'Directional formatting mark.' },
            '\u2028': { name: 'Line Separator', code: 'U+2028', type: 'invisible', action: 'replace-newline', desc: 'Unicode line break.' },
            '\u2029': { name: 'Paragraph Separator', code: 'U+2029', type: 'invisible', action: 'replace-newline', desc: 'Unicode paragraph break.' }
        };

        // Smart Quotes Map
const SMART_QUOTES_MAP = {
    '\u2018': "'",  // Left single quote
    '\u2019': "'",  // Right single quote
    '\u201C': '"',  // Left double quote
    '\u201D': '"',  // Right double quote
    '\u201A': ',',  // Low single comma
    '\u201E': '"',  // Low double quote
    '\u2026': '...' // Ellipsis
};

const DETECT_REGEX = new RegExp(
  `[${Object.keys(CHAR_MAP)
    .map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
    .join('')}]`,
  'g'
);

// DOM Elements

        // DOM Elements
        const textInput = document.getElementById('textInput');
        const previewArea = document.getElementById('previewArea');
        const statsPanel = document.getElementById('statsPanel');
        const statsList = document.getElementById('statsList');
        const issueBadge = document.getElementById('issueBadge');
        const charCount = document.getElementById('charCount');
        const toast = document.getElementById('toast');
        const themeIcon = document.getElementById('themeIcon');

        // Buttons
        const cleanAllBtn = document.getElementById('cleanAllBtn');
        const cleanNbspBtn = document.getElementById('cleanNbspBtn');
        const clearBtn = document.getElementById('clearBtn');
        const fixQuotesBtn = document.getElementById('fixQuotesBtn');
        const copyBtn = document.getElementById('copyBtn');
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        const themeToggle = document.getElementById('themeToggle');
        const exportBtn = document.getElementById('exportBtn');

        // State
        let currentAnalysis = {
            totalChars: 0,
            issuesFound: 0,
            detectedMap: {}
        };

        // --- Core Functions ---

        /**
         * Analyzes text for problematic characters
         */
        function analyzeText(text) {
            const detectedMap = {};
            let issuesFound = 0;

            // Iterate through text to find specific chars
            // We use a regex based on keys for efficiency, but simple iteration works for clarity
            let match;
DETECT_REGEX.lastIndex = 0;
while ((match = DETECT_REGEX.exec(text)) !== null) {
    const char = match[0];
    detectedMap[char] = (detectedMap[char] || 0) + 1;
    issuesFound++;
}

            currentAnalysis = {
                totalChars: text.length,
                issuesFound: issuesFound,
                detectedMap: detectedMap
            };

            updateUI(text);
        }

        /**
         * Updates the Preview, Stats, and Badges based on analysis
         */
        function updateUI(originalText) {
            // Update counts
            charCount.textContent = `${currentAnalysis.totalChars.toLocaleString()} Characters`;
            const count = currentAnalysis.issuesFound;
if (count === 0) {
    issueBadge.textContent = "No Hidden Characters";
} else if (count === 1) {
    issueBadge.textContent = "1 Hidden Character Found";
} else {
    issueBadge.textContent = `${count} Hidden Characters Found`;
}
            
            if (currentAnalysis.issuesFound > 0) {
                issueBadge.classList.add('active');
                statsPanel.style.display = 'block';
                renderPreview(originalText);
                renderStats();
            } else {
                issueBadge.classList.remove('active');
                statsPanel.style.display = 'none';
                if (originalText.length === 0) {
                    previewArea.innerHTML = '<span class="empty-state">Result preview will appear here...</span>';
                } else {
                    // XSS Safe: Use textContent-like approach by creating a text node logic or simple escaping
                    previewArea.innerHTML = '<div class="empty-state" style="color: var(--success); font-style: normal;">✓ No hidden characters detected. Your text is clean.</div>';
                }
            }
        }

        /**
         * Renders the text with highlighted problematic characters.
         * Critical: Must prevent XSS while allowing HTML spans for highlights.
         */
        function renderPreview(text) {
            previewArea.innerHTML = ''; // Clear

            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            // Regex to match any of our special chars
            // Escape the keys for regex usage
            const keys = Object.keys(CHAR_MAP).map(k => '\\u' + k.charCodeAt(0).toString(16).padStart(4, '0'));
            const regex = new RegExp(`[${keys.join('')}]`, 'g');
            
            let match;
            while ((match = regex.exec(text)) !== null) {
                // 1. Append safe text before match
                const safeText = text.substring(lastIndex, match.index);
                fragment.appendChild(document.createTextNode(safeText));

                // 2. Append highlighted span for the match
                const char = match[0];
                const info = CHAR_MAP[char];
                
                const span = document.createElement('span');
                span.className = 'char-highlight';
                span.setAttribute('data-code', info.code.replace('U+', ''));
                span.title = `${info.name} (${info.code}): ${info.desc}`;
                span.textContent = info.type === 'visible-ish' ? ' ' : ''; // Render a small space or empty
                
                // For layout purposes, zero-width items need a tiny width in visualization to be seen
                if (info.type === 'invisible') {
                   span.style.padding = "0 4px";
                }

                fragment.appendChild(span);
                lastIndex = regex.lastIndex;
            }

            // 3. Append remaining text
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            
            previewArea.appendChild(fragment);
        }

        /**
         * Renders the statistics table
         */
        function renderStats() {
            statsList.innerHTML = '';
            
            Object.keys(currentAnalysis.detectedMap).forEach(char => {
                const count = currentAnalysis.detectedMap[char];
                const info = CHAR_MAP[char];

                const li = document.createElement('li');
                li.className = 'stat-item';
                li.innerHTML = `
                    <span class="stat-code">${info.code}</span>
                    <span class="stat-name">${info.name}</span>
                    <span class="stat-desc">${info.desc}</span>
                    <span class="stat-count">${count}</span>
                `;
                statsList.appendChild(li);
            });
        }

         function performClean(type) {
    let text = textInput.value;

    if (!text) {
        showToast('Nothing to clean.');
        return;
    }

    let cleanedText = '';

    for (let char of text) {
        const info = CHAR_MAP[char];

        // Normal character
        if (!info) {
            cleanedText += char;
            continue;
        }

        // Only replace NBSP
        if (type === 'nbsp-only') {
            cleanedText += (char === '\u00A0') ? ' ' : char;
            continue;
        }

        // Remove invisible characters
        if (info.action === 'remove') {
            continue;
        }

        // Replace space-like characters
        if (info.action === 'replace') {
            cleanedText += ' ';
        } 
        else if (info.action === 'replace-newline') {
            cleanedText += '\n';
        }
    }

    textInput.value = cleanedText;
    analyzeText(cleanedText);
    showToast('Text cleaned successfully!');
         }
function fixSmartQuotes() {
    alert("Fix Quotes Button Working");
    let text = textInput.value;

    if (!text) {
        showToast('Nothing to fix.');
        return;
    }

    let count = 0;

    const regex = /[\u2018\u2019\u201C\u201D\u201A\u201E\u2026]/g;

    const cleanedText = text.replace(regex, (match) => {
        count++;
        return SMART_QUOTES_MAP[match] || match;
    });

    textInput.value = cleanedText;
    analyzeText(cleanedText);

    if (count > 0) {
        showToast(`Fixed ${count} smart quotes.`);
    } else {
        showToast('No smart quotes found.');
    }
}
        /**
         * Utilities
         */
        function showToast(msg) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        function toggleTheme() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.setAttribute('data-theme', 'light');
                themeIcon.textContent = '◑';
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeIcon.textContent = '☀';
                localStorage.setItem('theme', 'dark');
            }
        }

        function loadSample() {
            // A tricky string with ZWSP, NBSP, BOM
            const parts = [
                "Here is a normal sentence.",
                "Here\u00A0is\u00A0one\u00A0with\u00A0non-breaking\u00A0spaces.",
                "H\u200Be\u200Bl\u200Bl\u200Bo W\u200Bo\u200Br\u200Bl\u200Bd (Hidden ZWSP inside).",
                "\uFEFFThis line starts with a Byte Order Mark.",
                "Code snippet: const\u00A0val\u200B\u00A0=\u00A0true;"
            ];
            textInput.value = parts.join('\n');
            analyzeText(textInput.value);
            showToast('Sample text loaded');
        }

        function copyToClipboard() {
                
            // We copy whatever is in the input box, assuming user might want dirty text too
            // But usually we want clean text. Let's copy from input box directly.
            navigator.clipboard.writeText(textInput.value).then(() => {
                showToast('Copied to clipboard!');
            });
        }
        
        function exportTxt() {
            const text = textInput.value;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cleaned_text.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // --- Event Listeners ---

        textInput.addEventListener('input', (e) => analyzeText(e.target.value));
        
        cleanAllBtn.addEventListener('click', () => performClean('all'));
        cleanNbspBtn.addEventListener('click', () => performClean('nbsp-only'));
        if (fixQuotesBtn) {
    fixQuotesBtn.addEventListener('click', fixSmartQuotes);
        }
        clearBtn.addEventListener('click', () => {
            textInput.value = '';
            analyzeText('');
            textInput.focus();
        });

        copyBtn.addEventListener('click', copyToClipboard);
        exportBtn.addEventListener('click', exportTxt);
        loadSampleBtn.addEventListener('click', loadSample);
        themeToggle.addEventListener('click', toggleTheme);

        // Init
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.textContent = '☀';
        }

    })();
