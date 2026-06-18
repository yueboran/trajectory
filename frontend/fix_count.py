import re

file_path = 'frontend/src/components/ProfileView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 将 proj.commentsCount || 0 替换为 proj.comments ? proj.comments.length : 0
content = content.replace(
    "{proj.commentsCount || 0}",
    "{proj.comments ? proj.comments.length : 0}"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('commentsCount replace done')
