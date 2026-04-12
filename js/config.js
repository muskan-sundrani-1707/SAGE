/**
 * SAGE – backend API URL helpers (FastAPI default: port 8000).
 *
 * Override before this script loads if needed:
 *   <script>window.SAGE_API_BASE = 'http://192.168.1.10:8000';</script>
 * Use empty string for same-origin (when the site is served by uvicorn on :8000):
 *   <script>window.SAGE_API_BASE = '';</script>
 *
 * If SAGE_API_BASE is left undefined, we use same-origin on 127.0.0.1:8000 / localhost:8000,
 * otherwise http://127.0.0.1:8000 (for Live Server, file://, etc.).
 */
/** Use server Whisper only when API reports it is installed; set false to always use browser speech-to-text. */
window.SAGE_USE_WHISPER = window.SAGE_USE_WHISPER !== false;
window.SAGE_USE_GTTS = window.SAGE_USE_GTTS !== false;

function getSageApiBase() {
    const v = window.SAGE_API_BASE;
    if (v !== undefined && v !== null) {
        return String(v).replace(/\/$/, '');
    }
    const h = window.location.hostname;
    const p = window.location.port;
    if ((h === 'localhost' || h === '127.0.0.1') && p === '8000') {
        return '';
    }
    return 'http://127.0.0.1:8000';
}

/** @param {string} path e.g. '/api/health' */
function sageApiPath(path) {
    const rel = path.startsWith('/') ? path : `/${path}`;
    const b = getSageApiBase();
    return b ? `${b}${rel}` : rel;
}
