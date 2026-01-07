def get_current_org():
    # MUST return a dictionary, otherwise routers crash with "string indices" error
    return {
        "org_id": "org_demo",
        "org_name": "Demo Organization",
        "user_email": "admin@demo.com"
    }