import re

file_path = 'frontend/src/components/ProfileView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

leader_path = 'frontend/src/components/LeaderboardView.tsx'
with open(leader_path, 'r', encoding='utf-8') as f:
    leader_content = f.read()

# 1. 导入 CategoryCascader
if 'CategoryCascader' not in content:
    content = content.replace(
        'import ArchiveDetailView from "./ArchiveDetailView";',
        'import ArchiveDetailView from "./ArchiveDetailView";\nimport CategoryCascader from "./CategoryCascader";'
    )

# 2. 导入 Edit2, Trash2, X 等
import_repl = '  Calendar, Activity, HelpCircle, MessageSquare, MoreHorizontal, Edit2, Trash2, X\n} from "lucide-react";'
content = re.sub(r'  Calendar, Activity, HelpCircle, MessageSquare, MoreHorizontal\n\} from "lucide-react";', import_repl, content)

# 3. 添加 Props
if 'onUpdateProject?' not in content:
    props_match = r'  onEditDraft\?: \(draft: DraftRecord\) => void;\n\}'
    props_repl = '  onEditDraft?: (draft: DraftRecord) => void;\n  onUpdateProject?: (id: string, updates: Partial<Project>) => void;\n  onDeleteProject?: (id: string) => void;\n}'
    content = re.sub(props_match, props_repl, content)

# 4. 在函数体里加入 Modal 相关的 State 和 Handlers
# 从 LeaderboardView 抓取
state_pattern = r'  const \[isFormOpen, setIsFormOpen\] = useState\(false\);[\s\S]*?const handleDelete =.*?};[\s\S]*?};'
match = re.search(state_pattern, leader_content)
if match:
    state_code = match.group(0)
    # 把 state_code 插入到 ProfileView 的 activeFilter 之后
    if 'const [activeMenuId, setActiveMenuId] = useState<string | null>(null);' not in content:
        insert_match = r'  const \[activeFilter, setActiveFilter\] = useState<"archive_bookmarks" \| "record_bookmarks" \| "draft_records">.*?;\n'
        insert_repl = r'\g<0>\n  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);\n' + state_code + '\n'
        content = re.sub(insert_match, insert_repl, content, count=1)

# 5. 抓取 JSX (Modal)
modal_pattern = r'      {/\* 编辑/新建档案库弹窗 \*/}[\s\S]*?onClick=\{\(\) => setActiveMenuId\(null\)\} />\n      \)}'
modal_match = re.search(modal_pattern, leader_content)
if modal_match:
    modal_code = modal_match.group(0)
    # 插入到 ProfileView 最外层 div 的前面
    if '{/* 编辑/新建档案库弹窗 */}' not in content:
        content = content.replace('    </div>\n  );\n}', modal_code + '\n    </div>\n  );\n}')

# 6. 替换 MoreHorizontal 和底部菜单
card_match = r'\{/\* 收藏图标 \*/\}[\s\S]*?<MoreHorizontal className="w-5 h-5 text-\[#808080\] hover:text-\[#C0C0C0\] transition-colors" />\s*</button>\s*</div>\s*</div>[\s\S]*?</p>\s*</div>'
card_repl = '''{/* 收藏图标 */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onBookmarkToggle) onBookmarkToggle(p.id, e);
                                }}
                                className="p-1 -mr-1 rounded-md hover:bg-white/5 active:scale-95 transition-all"
                              >
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === p.id ? null : p.id);
                                }}
                                className="p-1 -ml-1 rounded-md hover:bg-white/5 active:scale-95 transition-all relative"
                              >
                                <MoreHorizontal className="w-5 h-5 text-[#808080] hover:text-[#C0C0C0] transition-colors" />
                              </button>
                            </div>
                          </div>
                          
                          {/* 标题和简介 (居中) */}
                          <h3 className="text-[20px] md:text-[22px] font-black text-[#F8F8F8] leading-tight mb-3.5 tracking-wide drop-shadow-md">
                            {p.name}
                          </h3>
                          <p className="text-[14px] text-[#A0A0A0] leading-[1.7] line-clamp-2 max-w-[92%]" style={{ wordBreak: "break-word" }}>
                            {p.intro}
                          </p>

                          {/* 展开的操作菜单 */}
                          {activeMenuId === p.id && (
                            <div
                              className="border-t border-[#242428] flex animate-fade-in w-full mt-5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => { handleOpenForm(p); }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-[#A0A0A0] hover:bg-white/5 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                编辑
                              </button>
                              <div className="w-px bg-[#242428]" />
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-[#D05050] hover:bg-red-500/5 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                删除
                              </button>
                            </div>
                          )}
                        </div>'''
content = re.sub(card_match, card_repl, content)

# 因为 handleOpenForm 用到了 setIsFormOpen，而且在 LeaderboardView 里面参数是 (project?: Project) 并且会用 Date.now() 作为ID。
# 既然我们是从 Leaderboard 复制的，代码本身就包含了逻辑，只需要把它写进 ProfileView 即可。

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Migration done")
