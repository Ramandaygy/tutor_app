# Token blacklist untuk logout yang aman
# Default: In-memory (development)
# Production: Redis dengan TTL

import time
from typing import Dict
from flask import current_app

# ======================================================================
# IN-MEMORY IMPLEMENTATION (DEFAULT)
# ======================================================================

# Struktur: { jti: expires_at }
_blacklisted_tokens: Dict[str, int] = {}

def add_token_to_blacklist(jti: str, expires_at: int = None) -> None:
    """
    Tambahkan token ke blacklist in-memory
    
    Args:
        jti (str): JWT ID (unique identifier)
        expires_at (int): Timestamp kapan token expire
    """
    _blacklisted_tokens[jti] = expires_at or (int(time.time()) + 86400)
    try:
        current_app.logger.info(f"Token blacklisted (in-memory): {jti[:10]}...")
    except Exception:
        pass
    
    _cleanup_expired_tokens()

def is_token_blacklisted(jti: str) -> bool:
    """
    Cek apakah token ada di blacklist in-memory
    """
    expires_at = _blacklisted_tokens.get(jti)
    if not expires_at:
        return False
    if expires_at < int(time.time()):
        _blacklisted_tokens.pop(jti, None)
        return False
    return True

def remove_token_from_blacklist(jti: str) -> bool:
    """
    Hapus token dari blacklist
    """
    return _blacklisted_tokens.pop(jti, None) is not None

def clear_blacklist() -> int:
    """
    Hapus semua token blacklist
    """
    count = len(_blacklisted_tokens)
    _blacklisted_tokens.clear()
    try:
        current_app.logger.info(f"Blacklist cleared: {count} tokens removed")
    except Exception:
        pass
    return count

def get_blacklist_size() -> int:
    return len(_blacklisted_tokens)

def get_blacklist_stats() -> dict:
    return {
        'total_tokens': len(_blacklisted_tokens),
        'memory_usage_kb': len(str(_blacklisted_tokens)) / 1024,
        'last_cleanup': getattr(_cleanup_expired_tokens, 'last_run', 'never')
    }

def _cleanup_expired_tokens() -> int:
    """
    Bersihkan token expired
    """
    now = int(time.time())
    expired = [jti for jti, exp in _blacklisted_tokens.items() if exp < now]
    for jti in expired:
        _blacklisted_tokens.pop(jti, None)
    cleaned = len(expired)
    if cleaned > 0:
        try:
            current_app.logger.info(f"Blacklist cleanup: {cleaned} expired tokens removed")
        except Exception:
            pass
    _cleanup_expired_tokens.last_run = now
    return cleaned


# ======================================================================
# OPTIONAL: REDIS IMPLEMENTATION (FOR PRODUCTION)
# ======================================================================

"""
import redis
import json
from datetime import datetime, timedelta

REDIS_AVAILABLE = False
redis_client = None

def init_redis_blacklist(host="localhost", port=6379, db=0):
    global redis_client, REDIS_AVAILABLE
    try:
        redis_client = redis.Redis(
            host=host, port=port, db=db,
            decode_responses=True, health_check_interval=30
        )
        redis_client.ping()
        REDIS_AVAILABLE = True
        return True
    except Exception as e:
        print(f"⚠️ Redis not available, fallback to in-memory: {e}")
        REDIS_AVAILABLE = False
        return False

def add_token_to_blacklist(jti: str, expires_at: int = None) -> None:
    if not REDIS_AVAILABLE:
        return globals()["add_token_to_blacklist_inmemory"](jti, expires_at)
    ttl = (expires_at or int(time.time()) + 86400) - int(time.time())
    redis_client.setex(f"blacklist:{jti}", ttl, "revoked")

def is_token_blacklisted(jti: str) -> bool:
    if not REDIS_AVAILABLE:
        return globals()["is_token_blacklisted_inmemory"](jti)
    return redis_client.exists(f"blacklist:{jti}") > 0
"""

# NOTE:
# - Default akan pakai in-memory
# - Kalau mau Redis: uncomment bagian atas, panggil `init_redis_blacklist()`
#   lalu fungsi add/is otomatis pakai Redis.
