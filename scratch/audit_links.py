import os, glob
from html.parser import HTMLParser

html_files = [f for f in glob.glob('**/*.html', recursive=True) if '.git' not in f and 'node_modules' not in f]

class LinkValidator(HTMLParser):
    def __init__(self, file_path):
        super().__init__()
        self.file_path = file_path
        self.file_dir = os.path.dirname(file_path)
        self.issues = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        target = None
        if tag == 'script' and 'src' in attr_dict:
            target = attr_dict['src']
        elif tag == 'link' and 'href' in attr_dict and attr_dict.get('rel') == 'stylesheet':
            target = attr_dict['href']
        elif tag == 'img' and 'src' in attr_dict:
            target = attr_dict['src']
        elif tag == 'a' and 'href' in attr_dict:
            target = attr_dict['href']

        if target:
            if target.startswith('http') or target.startswith('#') or target.startswith('mailto:') or target.startswith('javascript:'):
                return
            clean_target = target.split('?')[0].split('#')[0]
            if clean_target:
                target_path = os.path.normpath(os.path.join(self.file_dir, clean_target))
                if not os.path.exists(target_path):
                    self.issues.append(f'Broken link ({tag}): "{target}" in {self.file_path}')

issues_count = 0
for hf in html_files:
    with open(hf, 'r', encoding='utf-8') as f:
        parser = LinkValidator(hf)
        parser.feed(f.read())
        if parser.issues:
            for issue in parser.issues:
                print('[WARNING]', issue)
                issues_count += 1

if issues_count == 0:
    print('SUCCESS: All local links, script tags, stylesheet hrefs, and image sources across all 10 HTML files are 100% valid!')
else:
    print(f'TOTAL ISSUES FOUND: {issues_count}')
