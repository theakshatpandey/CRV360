# core/org_context.py

def get_current_org():
    """
    Temporary org context.
    Later this will come from auth / JWT / tenant mapping.
    """
    return {
        "org_id": "org_demo",
        "org_name": "Demo Organization"
    }
