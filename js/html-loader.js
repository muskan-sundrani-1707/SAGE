/**
 * SAGE - HTML Loader
 * Loads HTML partials into placeholders.
 * Note: Run from a local server (e.g. npx serve, python -m http.server) for fetch to work.
 */

(function () {
    const PARTIALS = [
        { id: 'accessibility-bar', url: 'html/accessibility-bar.html', target: null },
        { id: 'header', url: 'html/header.html', target: null },
        { id: 'hero', url: 'html/hero.html', target: 'main-placeholder' },
        { id: 'voice', url: 'html/voice.html', target: 'main-placeholder' },
        { id: 'scam', url: 'html/scam.html', target: 'main-placeholder' },
        { id: 'learn', url: 'html/learn.html', target: 'main-placeholder' },
        { id: 'about', url: 'html/about.html', target: 'main-placeholder' },
        { id: 'footer', url: 'html/footer.html', target: null },
        { id: 'modal', url: 'html/modal.html', target: null }
    ];

    const SCRIPTS = [
        'js/data.js',
        'js/voice.js',
        'js/scam.js',
        'js/learn.js',
        'js/accessibility.js',
        'js/main.js'
    ];

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    function loadPartial(item) {
        return fetch(item.url)
            .then(r => {
                if (!r.ok) throw new Error('Failed to load ' + item.url);
                return r.text();
            })
            .then(html => {
                const target = item.target
                    ? document.getElementById(item.target)
                    : document.getElementById(item.id + '-placeholder');
                if (target) {
                    if (item.target) {
                        const wrap = document.createElement('div');
                        wrap.innerHTML = html.trim();
                        target.appendChild(wrap.firstChild);
                    } else {
                        target.innerHTML = html;
                    }
                }
            });
    }

    Promise.all(PARTIALS.map(loadPartial))
        .then(() => {
            return SCRIPTS.reduce((p, src) => p.then(() => loadScript(src)), Promise.resolve());
        })
        .then(() => {
            document.dispatchEvent(new CustomEvent('sageContentLoaded'));
        })
        .catch(err => {
            console.error('SAGE loader error:', err);
            document.getElementById('content-error').style.display = 'block';
        });
})();
