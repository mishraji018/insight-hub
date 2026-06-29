import re

files = [
    r'c:\Users\pmish\Desktop\projects\web development\insight-hub\frontend\components\AppLayout.tsx',
    r'c:\Users\pmish\Desktop\projects\web development\insight-hub\frontend\app\not-found.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'(\s)to=([\"\']|\{)', r'\1href=\2', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print('Done')
