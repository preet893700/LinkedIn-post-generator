import json
import os
from typing import List, Dict
import logging
from threading import Lock

logger = logging.getLogger(__name__)

# File paths
POSTS_LOG_FILE = os.path.join(os.path.dirname(__file__), "..", "posts_log.json")

# Thread-safe file access
file_lock = Lock()

def read_posts_log() -> List[Dict]:
    """
    Read all posts from the log file
    
    Returns:
        List of post dictionaries
    """
    with file_lock:
        try:
            if not os.path.exists(POSTS_LOG_FILE):
                logger.info("Posts log file doesn't exist, creating new one")
                return []
            
            with open(POSTS_LOG_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('posts', [])
                
        except json.JSONDecodeError:
            logger.warning("Invalid JSON in posts log, returning empty list")
            return []
        except Exception as e:
            logger.error(f"Error reading posts log: {str(e)}")
            return []


def write_posts_log(posts: List[Dict]) -> None:
    """
    Write posts to the log file (thread-safe)
    
    Args:
        posts: List of post dictionaries to save
    """
    with file_lock:
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(POSTS_LOG_FILE), exist_ok=True)
            
            # Write to file with pretty printing
            with open(POSTS_LOG_FILE, 'w', encoding='utf-8') as f:
                json.dump(
                    {'posts': posts},
                    f,
                    indent=2,
                    ensure_ascii=False
                )
            
            logger.info(f"Successfully wrote {len(posts)} posts to log")
            
        except Exception as e:
            logger.error(f"Error writing posts log: {str(e)}")
            raise Exception(f"Failed to write posts log: {str(e)}")


def get_all_posts() -> List[Dict]:
    """
    Get all posts from log, sorted by timestamp (newest first)
    
    Returns:
        List of posts sorted by timestamp descending
    """
    posts = read_posts_log()
    
    # Sort by timestamp, newest first
    posts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    return posts


def clear_posts_log() -> None:
    """
    Clear all posts from the log (useful for testing)
    """
    with file_lock:
        try:
            with open(POSTS_LOG_FILE, 'w', encoding='utf-8') as f:
                json.dump({'posts': []}, f, indent=2)
            logger.info("Posts log cleared")
        except Exception as e:
            logger.error(f"Error clearing posts log: {str(e)}")
            raise