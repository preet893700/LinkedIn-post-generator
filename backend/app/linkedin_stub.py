import json
from datetime import datetime
from typing import Dict
import logging
from .utils import read_posts_log, write_posts_log

logger = logging.getLogger(__name__)

def save_approved_post(topic: str, text: str, image: str) -> None:
    """
    Simulates posting to LinkedIn by saving the approved post to a JSON log file
    
    Args:
        topic: The topic of the post
        text: The generated post text
        image: Base64 encoded image
    """
    try:
        # Read existing posts
        posts = read_posts_log()
        
        # Create new post entry
        new_post = {
            "topic": topic,
            "text": text,
            "image": image,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "published"
        }
        
        # Append to posts list
        posts.append(new_post)
        
        # Write back to file
        write_posts_log(posts)
        
        logger.info(f"Post saved successfully. Total posts: {len(posts)}")
        
        # Simulate LinkedIn API call (in real implementation, this would call LinkedIn API)
        _simulate_linkedin_post(new_post)
        
    except Exception as e:
        logger.error(f"Error saving post: {str(e)}")
        raise Exception(f"Failed to save post: {str(e)}")


def _simulate_linkedin_post(post: Dict) -> None:
    """
    Simulates making an API call to LinkedIn
    In production, this would use the LinkedIn API with OAuth tokens
    
    Args:
        post: The post data to "publish"
    """
    logger.info("=" * 50)
    logger.info("SIMULATED LINKEDIN POST")
    logger.info("=" * 50)
    logger.info(f"Topic: {post['topic']}")
    logger.info(f"Timestamp: {post['timestamp']}")
    logger.info(f"Text preview: {post['text'][:100]}...")
    logger.info(f"Image included: {'Yes' if post['image'] else 'No'}")
    logger.info("=" * 50)
    logger.info("✅ Post successfully published to LinkedIn (simulated)")
    logger.info("=" * 50)


def get_post_stats() -> Dict:
    """
    Get statistics about published posts
    
    Returns:
        Dict with post statistics
    """
    try:
        posts = read_posts_log()
        
        return {
            "total_posts": len(posts),
            "latest_post": posts[-1] if posts else None,
            "oldest_post": posts[0] if posts else None
        }
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        return {
            "total_posts": 0,
            "latest_post": None,
            "oldest_post": None
        }