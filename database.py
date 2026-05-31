"""
SAGE - Database Module (v2)
SQLite setup and helper functions — includes registered users + sessions
"""

import sqlite3
from datetime import datetime

DB_PATH = 'sage.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with open('schema.sql', 'r') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print("✅ Database initialized.")

# ── INTERACTIONS ──────────────────────────────────────────────
def log_interaction(user_id, action_type, input_text, response):
    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO interactions (user_id, action_type, input_text, response, timestamp) VALUES (?, ?, ?, ?, ?)',
            (user_id, action_type, input_text, response, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"⚠️ DB log error: {e}")

# ── USER PROFILES (anonymous assessment) ─────────────────────
def save_user_profile(user_id, age, education, smartphone_use, confidence, difficulty_level):
    try:
        conn = get_db()
        conn.execute('''
            INSERT INTO user_profiles
                (user_id, age, education, smartphone_use, confidence_score, difficulty_level, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                age=excluded.age,
                education=excluded.education,
                smartphone_use=excluded.smartphone_use,
                confidence_score=excluded.confidence_score,
                difficulty_level=excluded.difficulty_level
        ''', (user_id, age, education, smartphone_use, confidence, difficulty_level, datetime.now().isoformat()))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"⚠️ DB profile error: {e}")

def get_user_profile(user_id):
    try:
        conn = get_db()
        row = conn.execute('SELECT * FROM user_profiles WHERE user_id = ?', (user_id,)).fetchone()
        conn.close()
        return dict(row) if row else None
    except Exception:
        return None

# ── REGISTERED USER ACCOUNTS ──────────────────────────────────
def create_user(username, password_hash, display_name='', email=''):
    try:
        conn = get_db()
        conn.execute(
            'INSERT INTO registered_users (username, password, display_name, email, created_at) VALUES (?,?,?,?,?)',
            (username, password_hash, display_name, email, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        return False  # username taken
    except Exception as e:
        print(f"⚠️ create_user error: {e}")
        return False

def get_registered_user(username):
    try:
        conn = get_db()
        row = conn.execute('SELECT * FROM registered_users WHERE username=?', (username,)).fetchone()
        conn.close()
        return dict(row) if row else None
    except Exception:
        return None

def update_last_login(username):
    try:
        conn = get_db()
        conn.execute('UPDATE registered_users SET last_login=? WHERE username=?',
                     (datetime.now().isoformat(), username))
        conn.commit()
        conn.close()
    except Exception:
        pass

# ── SESSIONS ──────────────────────────────────────────────────
def log_session_start(user_id, ip_address=''):
    try:
        conn = get_db()
        cur = conn.execute(
            'INSERT INTO user_sessions (user_id, login_at, ip_address) VALUES (?,?,?)',
            (user_id, datetime.now().isoformat(), ip_address)
        )
        sid = cur.lastrowid
        conn.commit()
        conn.close()
        return sid
    except Exception:
        return None

def log_session_end(session_id):
    try:
        conn = get_db()
        conn.execute('UPDATE user_sessions SET logout_at=? WHERE id=?',
                     (datetime.now().isoformat(), session_id))
        conn.commit()
        conn.close()
    except Exception:
        pass

# ── STATS (public) ────────────────────────────────────────────
def get_stats():
    try:
        conn = get_db()
        total        = conn.execute('SELECT COUNT(*) as c FROM interactions').fetchone()['c']
        scam_checks  = conn.execute("SELECT COUNT(*) as c FROM interactions WHERE action_type='scam_check'").fetchone()['c']
        voice_q      = conn.execute("SELECT COUNT(*) as c FROM interactions WHERE action_type='voice_query'").fetchone()['c']
        anon_users   = conn.execute('SELECT COUNT(*) as c FROM user_profiles').fetchone()['c']
        reg_users    = conn.execute('SELECT COUNT(*) as c FROM registered_users').fetchone()['c']
        conn.close()
        return {
            'total_interactions': total,
            'scam_checks':        scam_checks,
            'voice_queries':      voice_q,
            'registered_users':   reg_users,
            'anonymous_sessions': anon_users
        }
    except Exception:
        return {'total_interactions': 0, 'scam_checks': 0, 'voice_queries': 0,
                'registered_users': 0, 'anonymous_sessions': 0}

# ── ADMIN DATA ────────────────────────────────────────────────
def get_admin_stats():
    try:
        conn = get_db()

        total        = conn.execute('SELECT COUNT(*) as c FROM interactions').fetchone()['c']
        scam_checks  = conn.execute("SELECT COUNT(*) as c FROM interactions WHERE action_type='scam_check'").fetchone()['c']
        voice_q      = conn.execute("SELECT COUNT(*) as c FROM interactions WHERE action_type='voice_query'").fetchone()['c']
        assess_q     = conn.execute("SELECT COUNT(*) as c FROM interactions WHERE action_type='assess'").fetchone()['c']
        reg_users    = conn.execute('SELECT COUNT(*) as c FROM registered_users').fetchone()['c']
        anon_users   = conn.execute('SELECT COUNT(*) as c FROM user_profiles').fetchone()['c']

        # Sessions: currently logged in = sessions with no logout
        active_sessions = conn.execute(
            "SELECT COUNT(*) as c FROM user_sessions WHERE logout_at IS NULL"
        ).fetchone()['c']
        total_sessions  = conn.execute('SELECT COUNT(*) as c FROM user_sessions').fetchone()['c']

        # Difficulty distribution
        diff_dist = conn.execute(
            "SELECT difficulty_level, COUNT(*) as cnt FROM user_profiles GROUP BY difficulty_level"
        ).fetchall()

        # Recent interactions (last 50, privacy masked)
        recent = conn.execute(
            "SELECT id, user_id, action_type, input_text, response, timestamp FROM interactions ORDER BY id DESC LIMIT 50"
        ).fetchall()

        # Registered users list
        users_list = conn.execute(
            "SELECT id, username, display_name, email, created_at, last_login FROM registered_users ORDER BY id DESC"
        ).fetchall()

        # User profiles (anonymous assessments)
        profiles = conn.execute(
            "SELECT user_id, age, education, smartphone_use, confidence_score, difficulty_level, created_at FROM user_profiles ORDER BY created_at DESC LIMIT 100"
        ).fetchall()

        # Activity per day (last 7 days)
        daily = conn.execute("""
            SELECT substr(timestamp,1,10) as day, COUNT(*) as cnt
            FROM interactions
            GROUP BY day
            ORDER BY day DESC
            LIMIT 7
        """).fetchall()

        conn.close()

        return {
            'total_interactions':  total,
            'scam_checks':         scam_checks,
            'voice_queries':       voice_q,
            'assessments':         assess_q,
            'registered_users':    reg_users,
            'anonymous_sessions':  anon_users,
            'active_sessions':     active_sessions,
            'total_sessions':      total_sessions,
            'difficulty_dist':     [dict(r) for r in diff_dist],
            'recent_interactions': [dict(r) for r in recent],
            'users_list':          [dict(r) for r in users_list],
            'profiles':            [dict(r) for r in profiles],
            'daily_activity':      [dict(r) for r in daily],
        }
    except Exception as e:
        print(f"⚠️ admin stats error: {e}")
        return {}
