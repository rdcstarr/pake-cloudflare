// Pake registers no URL scheme with the system, so nothing outside the window can hand it a link:
// macOS refuses the open before the app is even asked. A paste is the only way in. The File menu's
// "Go to Link…" reaches this function through eval, and the navigating happens here rather than in
// Rust because the page already holds the session and the regex that says which hosts stay inside.
window.__pakeGoToLink = function openGoToLink() {
    const existing = document.getElementById('pake-go-to-link');
    if (existing) {
        existing.querySelector('input').focus();
        return;
    }

    const internal = (url) => {
        const pattern = window.pakeConfig?.internal_url_regex;
        try {
            return pattern ? new RegExp(pattern).test(url) : new URL(url).host === location.host;
        } catch {
            return false;
        }
    };

    const panel = document.createElement('div');
    panel.id = 'pake-go-to-link';
    panel.innerHTML = `
        <style>
            #pake-go-to-link {
                position: fixed; inset: 0; z-index: 2147483647;
                display: flex; align-items: flex-start; justify-content: center;
                padding-top: 18vh; background: rgba(0, 0, 0, 0.35);
                font: 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #pake-go-to-link .box {
                width: min(560px, 90vw); padding: 14px; border-radius: 10px;
                background: Canvas; color: CanvasText;
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
            }
            #pake-go-to-link input {
                width: 100%; box-sizing: border-box; padding: 9px 10px;
                border: 1px solid rgba(128, 128, 128, 0.45); border-radius: 6px;
                background: Field; color: FieldText; font: inherit;
            }
            #pake-go-to-link p { margin: 8px 2px 0; opacity: 0.7; }
            #pake-go-to-link p[data-error] { opacity: 1; color: #d33; }
        </style>
        <div class="box">
            <input type="url" spellcheck="false" placeholder="Paste a link and press Enter">
            <p></p>
        </div>
    `;

    const input = panel.querySelector('input');
    const hint = panel.querySelector('p');
    hint.textContent = `Links on ${location.host} open in this window.`;

    const close = () => panel.remove();

    const go = () => {
        const url = input.value.trim();
        if (!url) return;

        if (!internal(url)) {
            hint.dataset.error = '';
            hint.textContent = `That link is not on ${location.host}, so it would leave this window.`;
            return;
        }

        close();
        location.assign(url);
    };

    panel.addEventListener('click', (event) => {
        if (event.target === panel) close();
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') go();
        if (event.key === 'Escape') close();
    });

    document.body.appendChild(panel);
    input.focus();
};
