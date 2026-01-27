"""
Validation Utilities
"""
import re


def validate_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email address to validate
    
    Returns:
        True if valid, False otherwise
    """
    if not email:
        return False
    
    # Simple email regex pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str, min_length: int = 6) -> bool:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
        min_length: Minimum required length (default: 6)
    
    Returns:
        True if valid, False otherwise
    """
    if not password:
        return False
    
    return len(password) >= min_length


def validate_required_fields(data: dict, fields: list) -> tuple:
    """
    Validate that all required fields are present.
    
    Args:
        data: Dictionary to validate
        fields: List of required field names
    
    Returns:
        (is_valid, missing_fields)
    """
    if not data:
        return False, fields
    
    missing = [field for field in fields if not data.get(field)]
    return len(missing) == 0, missing
