import re

def validate_email(email):
    """Validasi format email"""
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validasi password - minimal 6 karakter"""
    if not password:
        return False, "Password tidak boleh kosong"
    
    if len(password) < 6:
        return False, "Password minimal 6 karakter"
    
    # Tambahan validasi jika diinginkan (uncomment jika perlu)
    # if not re.search(r'[A-Z]', password):
    #     return False, "Password harus mengandung minimal 1 huruf besar"
    # if not re.search(r'[a-z]', password):
    #     return False, "Password harus mengandung minimal 1 huruf kecil"
    # if not re.search(r'[0-9]', password):
    #     return False, "Password harus mengandung minimal 1 angka"
    # if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
    #     return False, "Password harus mengandung minimal 1 karakter khusus"
    
    return True, "Password valid"

def validate_name(name):
    """Validasi nama"""
    if not name:
        return False, "Nama tidak boleh kosong"
    
    name = name.strip()
    if len(name) < 2:
        return False, "Nama minimal 2 karakter"
    
    if len(name) > 100:
        return False, "Nama maksimal 100 karakter"
    
    # Cek karakter yang diizinkan (huruf, spasi, dan beberapa karakter khusus)
    if not re.match(r'^[a-zA-Z\s\-\'\.]+$', name):
        return False, "Nama hanya boleh mengandung huruf, spasi, tanda hubung, dan apostrof"
    
    return True, "Nama valid"

def validate_role(role):
    """Validasi role user"""
    valid_roles = ['student', 'admin']
    return role in valid_roles