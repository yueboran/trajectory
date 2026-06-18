import re

file_path = 'frontend/src/components/ProfileView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 替换头像图片路径 (只替换一次，保留外层背景)
content = content.replace(
    "style={{ backgroundImage: 'url(/images/banners/profile_hero.png)' }}",
    "style={{ backgroundImage: 'url(/images/mocks/hot_thumb_1.png)' }}",
    1
)

# 2. 删除 VisualizationChart 函数
content = re.sub(
    r'// ========== 档案可视化图表组件 ==========[\s\S]*?// ========== 主组件 ==========',
    '// ========== 主组件 ==========',
    content
)

# 3. 删除连接测试相关的状态和函数
content = re.sub(
    r'  const \[backendUrl, setBackendUrl\] = useState\("http://localhost:8000"\);[\s\S]*?const \[activeFilter, setActiveFilter\] = useState<"archive_bookmarks" \| "record_bookmarks" \| "draft_records">',
    '  const [activeFilter, setActiveFilter] = useState<"archive_bookmarks" | "record_bookmarks" | "draft_records">',
    content
)

# 4. 替换掉连接仪和可视化分析模块的 JSX
old_jsx_pattern = r'\{/\* 星际终端连接仪 - FastAPI 后端连通测试 \*/\}[\s\S]*?<VisualizationChart mode=\{chartMode\} />\s*</div>'
new_jsx = '''          <div className="rounded-xl p-5 bg-[#1a1b1f]/90 backdrop-blur-xl border border-white/10 shadow-2xl mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#d0bcff]" />
              <h3 className="text-white font-bold text-sm tracking-wide">档案统计数据</h3>
            </div>
            <div className="w-full overflow-x-auto pb-2">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10 text-[#cbc3d7] text-xs uppercase tracking-wider font-semibold bg-[#12161a]/50">
                    <th className="p-3 rounded-tl-lg whitespace-nowrap">一级分类</th>
                    <th className="p-3 whitespace-nowrap">二级分类</th>
                    <th className="p-3 whitespace-nowrap">三级分类</th>
                    <th className="p-3 whitespace-nowrap">档案库名称</th>
                    <th className="p-3 text-right rounded-tr-lg whitespace-nowrap">记录数量</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#e0e0e0]">
                  {allProjects.map(proj => {
                    const parts = proj.tags && proj.tags[0] ? proj.tags[0].split(" / ") : ["-", "-", "-"];
                    const l1 = parts[0] || "-";
                    const l2 = parts[1] || "-";
                    const l3 = parts[2] || "-";
                    return (
                      <tr key={proj.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3 text-[#A0A0A0]">{l1}</td>
                        <td className="p-3 text-[#A0A0A0]">{l2}</td>
                        <td className="p-3 text-amber-400/80">{l3}</td>
                        <td className="p-3 font-medium text-[#DCDCDC]">{proj.name}</td>
                        <td className="p-3 text-right text-[#4cd7f6]">{proj.commentsCount || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>'''
content = re.sub(old_jsx_pattern, new_jsx, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Replacement done')
