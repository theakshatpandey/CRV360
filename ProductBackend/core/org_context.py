# core/org_context.py

def get_current_org():
    """
    Temporary org resolver.
    Later this will come from JWT / auth context.
    """
    return {
        "org_id": "org_demo",
        "org_name": "CRV360 Demo Org"
    }
