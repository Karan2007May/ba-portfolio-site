import os

def fix_nav(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    bad_desktop_root = '<li class="nav-link-item"><a href="resume.html">Resume</a>\n    <a href="blog.html">Blog</a></li>\n      <li class="nav-link-item"><a href="blog.html">Blog</a></li>'
    good_desktop_root = '<li class="nav-link-item"><a href="resume.html">Resume</a></li>\n      <li class="nav-link-item"><a href="blog.html">Blog</a></li>'
    
    bad_desktop_sub = '<li class="nav-link-item"><a href="../resume.html">Resume</a>\n    <a href="../blog.html">Blog</a></li>\n      <li class="nav-link-item"><a href="../blog.html">Blog</a></li>'
    good_desktop_sub = '<li class="nav-link-item"><a href="../resume.html">Resume</a></li>\n      <li class="nav-link-item"><a href="../blog.html">Blog</a></li>'

    if bad_desktop_root in content:
        content = content.replace(bad_desktop_root, good_desktop_root)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {filepath}')
    elif bad_desktop_sub in content:
        content = content.replace(bad_desktop_sub, good_desktop_sub)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {filepath}')

for root, _, files in os.walk('.'):
    for f in files:
        if f.endswith('.html'):
            fix_nav(os.path.join(root, f))
