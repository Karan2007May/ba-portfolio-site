import os

def update_css():
    path = 'css/style.css'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Change light mode background colors
    content = content.replace('--bg-primary: #e0f7fa;', '--bg-primary: #bbdefb;')
    content = content.replace('--bg-tertiary: #b2ebf2;', '--bg-tertiary: #90caf9;')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated CSS')

def update_nav(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Desktop nav
    old_desktop_root = '<li class="nav-link-item"><a href="resume.html">Resume</a></li>'
    new_desktop_root = '<li class="nav-link-item"><a href="resume.html">Resume</a></li>\n      <li class="nav-link-item"><a href="blog.html">Blog</a></li>'
    
    old_desktop_sub = '<li class="nav-link-item"><a href="../resume.html">Resume</a></li>'
    new_desktop_sub = '<li class="nav-link-item"><a href="../resume.html">Resume</a></li>\n      <li class="nav-link-item"><a href="../blog.html">Blog</a></li>'
    
    # Mobile nav
    old_mobile_root = '<a href="resume.html">Resume</a>'
    new_mobile_root = '<a href="resume.html">Resume</a>\n    <a href="blog.html">Blog</a>'
    
    old_mobile_sub = '<a href="../resume.html">Resume</a>'
    new_mobile_sub = '<a href="../resume.html">Resume</a>\n    <a href="../blog.html">Blog</a>'

    if 'blog.html' not in content and '../blog.html' not in content:
        content = content.replace(old_desktop_root, new_desktop_root)
        content = content.replace(old_desktop_sub, new_desktop_sub)
        content = content.replace(old_mobile_root, new_mobile_root)
        content = content.replace(old_mobile_sub, new_mobile_sub)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

update_css()

for root, _, files in os.walk('.'):
    for f in files:
        if f.endswith('.html'):
            update_nav(os.path.join(root, f))
