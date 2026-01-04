# core/org_context.py

def get_current_org():
    """
    Temporary hardcoded org context.
    Later this will come from auth/JWT.
    """
    return {
        "org_id": "org_demo",
        "org_name": "Demo Organization"
    }
