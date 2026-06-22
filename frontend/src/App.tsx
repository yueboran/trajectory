/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, MouseEvent } from "react";
import { Sparkles, Menu, Search, Compass, Share2, Award, ArrowLeft, Bookmark, User, HelpCircle } from "lucide-react";
import BottomNav from "./components/BottomNav";
import MindMapSection from "./components/MindMapSection";
import Footer from "./components/Footer";
import ArchiveDetailView from "./components/ArchiveDetailView";
import SubmitForm from "./components/SubmitForm";
import TimelineFeed from "./components/TimelineFeed";
import Methodology from "./components/Methodology";
import ProfileView from "./components/ProfileView";
import ArchiveView from "./components/ArchiveView";
import StarMapGraph from "./components/StarMapGraph";
import AuthPage from "./components/AuthPage";
import ConfirmModal from "./components/ConfirmModal";
import { Project, Comment, DraftRecord } from "./types";

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "智能财报翻译官",
    icon: "account_balance",
    intro: "💡 \"每次看财报都像在读天书，能不能有个AI帮我用人话翻译一下？\" —— @财务小李",
    description: "一个不懂代码的财务专员小李的吐槽，点燃了这个项目。通过多模态大模型实时分析研报、财报及市场动态，用大白话输出核心结论，让每个人都能看懂复杂的金融数据。",
    auroraScore: 88,
    radar: { concept: 92, research: 85, planning: 88, extension: 80, evaluation: 95 },
    radarContributors: {
      research: { author: "全栈老张", avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK4JRcWqO_GkuoyDVDtMctIC8xJnOpzwrK-bpagZtolvsfqJA9sVCoZrssfOZBfX5vuZHpZg4kysJB5EVbkeYaQsD0czXtadAfwNRtnPfd67KIOzxTm_LwBQ60G8oXGFnINdaJbCIki19JiCniZh6sQHEOTD5glvuJdKQjk3UHEXJlqcPqtk9P7mGvLYUBXDDHLEzh_on2EUN77m0UjuT6i92aGcu7JWZrq_966Iv6IoB4w4VisogP4A068hG8QGM5JYiiUmdmzmZ0" },
      concept: { author: "财务小李", avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDwhYCC9nn_EwuibGxEcPrfCQ1QIiX2sHJgZhWuFZpB2FoHVAunifZjPzmDftBNSDeMfGs1UI2sqmi_OaL5t8HDsPE3EAfzB_w2h-ZXpT2L2lAYqDfhvVapEk86KfYcXNy-XJJIlpZcQtUij6pr2EuUgiv_5qputmKlxk2vHJwTzughrBUnXc-Dt4f8VE3M96O6dbIFh66QJH8OljYZ16xbRhtXuZxxjOg4lUgVXpXswRDf89jlD-UAJhmVYO4OJo3j0YP22WIOvcL" }
    },
    tags: ["个人成长 / 财富与生活 / 资源与流动", "RAG", "打工人的救星"],
    commentsCount: 12,
    timeAgo: "2小时前",
    comments: [
      {
        id: "rec-1-1",
        author: "Alex Chen",
        timeAgo: "2小时前",
        title: "关于\"技术与数据\"维度，建议增加对本地化部署方案的探讨，许多企业级用户对数据隐私",
        content: "关于\"技术与数据\"维度，建议增加对本地化部署方案的探讨，许多企业级用户对数据隐私要求极高。",
        type: "comment" as const
      },
      {
        id: "rec-1-2",
        author: "Sarah J.",
        timeAgo: "5小时前",
        title: "商业模式图谱已更新，添加了基于 Token 消耗量的阶梯定价模型草案。",
        content: "商业模式图谱已更新，添加了基于 Token 消耗量的阶梯定价模型草案。",
        imageUrl: "/images/mocks/hot_carousel_1.webp",
        type: "expansion" as const
      },
      {
        id: "rec-1-3",
        author: "财务小李",
        timeAgo: "3天前",
        title: "多模态RAG在真实病例中的交叉校验逻辑是一个技术关键",
        content: "多模态RAG在真实病例中的交叉校验逻辑是一个技术关键，期待看到完整临床报告。",
        type: "comment" as const
      }
    ],
    hotness: "8.5k",
    likes: 342,
    painPointCount: 156,
    inspirationSource: "每次看财报都像在读天书，密密麻麻的数字和术语，看完比加班还累。能不能有个 AI 帮我用人话翻译一下，直接告诉我'这公司行不行'？",
    inspirationAuthor: "@财务小李",
    inspirationAuthorRole: "上市公司财务专员",
    coCreationTimeline: [
      { date: "4月12日", author: "财务小李", authorRole: "💡 灵感发起人", eventType: "inspiration", content: "在加班对账时发出灵魂吐槽：'财报就不能说人话吗？'", emoji: "💡" },
      { date: "4月15日", author: "全栈老张", authorRole: "🛠️ 魔法架构师", eventType: "tech_claim", content: "认领了想法，提出用 RAG + 多模态模型解析财报图表", emoji: "🔧" },
      { date: "4月28日", author: "全栈老张", authorRole: "🛠️ 魔法架构师", eventType: "prototype", content: "原型上线！能自动把财报翻译成大白话摘要", emoji: "🚀" },
      { date: "5月10日", author: "社区", authorRole: "🌍 共创社区", eventType: "community", content: "156人点亮痛点共鸣，12条专业建议涌入", emoji: "🔥" }
    ]
  },
  {
    id: "proj-2",
    name: "社区医生 AI 助手",
    icon: "neurology",
    intro: "💡 \"每次看病，医生一大半时间都在敲键盘录病历。能不能让AI帮医生写，让他们多看看病人？\" —— @急诊科老王",
    description: "急诊科护士老王的一句话点燃了整个项目。利用联邦学习模型在保护患者隐私的前提下，帮医生自动生成病历，让他们从键盘前解放出来，把时间还给病人。",
    auroraScore: 92,
    radar: { concept: 95, research: 90, planning: 88, extension: 92, evaluation: 96 },
    radarContributors: {
      planning: { author: "AI博士小陈", avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK4JRcWqO_GkuoyDVDtMctIC8xJnOpzwrK-bpagZtolvsfqJA9sVCoZrssfOZBfX5vuZHpZg4kysJB5EVbkeYaQsD0czXtadAfwNRtnPfd67KIOzxTm_LwBQ60G8oXGFnINdaJbCIki19JiCniZh6sQHEOTD5glvuJdKQjk3UHEXJlqcPqtk9P7mGvLYUBXDDHLEzh_on2EUN77m0UjuT6i92aGcu7JWZrq_966Iv6IoB4w4VisogP4A068hG8QGM5JYiiUmdmzmZ0" }
    },
    tags: ["个人成长 / 健康与精力 / 医疗健康", "Healthcare", "科技向善"],
    commentsCount: 8,
    timeAgo: "5小时前",
    comments: [
      {
        id: "rec-2-1",
        author: "急诊科老王",
        timeAgo: "5小时前",
        content: "今天夜班用了语音转病历的新版本，识别速度明显快了。不过有个问题：方言识别还是不太行，我们科室有个河南的主任，他口述的病历 AI 总是把「腹痛」识别成「福痛」。建议加一个医学术语优先匹配的功能。另外，病历模板的自动套用很好用，省了大量重复录入的时间。护士站的小姐姐们都说这个工具太赞了。",
        type: "comment" as const
      },
      {
        id: "rec-2-2",
        author: "AI博士小陈",
        timeAgo: "2天前",
        content: "联邦学习框架已经搭好了，数据不出院，模型在本地训练。隐私保护这块应该能通过伦理审查。",
        type: "expansion" as const
      },
      {
        id: "rec-2-3",
        author: "急诊科老王",
        timeAgo: "4天前",
        content: "拉了3个医生朋友内测，反馈总结：语音识别准确率还行，但需要支持打断和纠正。",
        type: "comment" as const
      }
    ],
    hotness: "12k",
    likes: 512,
    painPointCount: 320,
    inspirationSource: "每次看病，医生一大半时间都在敲键盘录病历，跟病人说话的时间还没敲字多。能不能有个AI帮医生自动生成病历，让他们多看看病人？",
    inspirationAuthor: "@急诊科老王",
    inspirationAuthorRole: "三甲医院急诊科护士",
    coCreationTimeline: [
      { date: "3月5日", author: "急诊科老王", authorRole: "💡 灵感发起人", eventType: "inspiration", content: "夜班后发帖吐槽：'医生敲键盘的时间比看病人还多'", emoji: "💡" },
      { date: "3月8日", author: "AI博士小陈", authorRole: "🛠️ 魔法架构师", eventType: "tech_claim", content: "看到帖子后激动认领，决定用联邦学习保护隐私", emoji: "🔧" },
      { date: "3月20日", author: "AI博士小陈", authorRole: "🛠️ 魔法架构师", eventType: "prototype", content: "第一版语音转病历原型完成", emoji: "🚀" },
      { date: "4月1日", author: "急诊科老王", authorRole: "💡 生活观察家", eventType: "milestone", content: "拉了3个医生朋友内测，反馈超好！", emoji: "🎉" },
      { date: "5月1日", author: "社区", authorRole: "🌍 共创社区", eventType: "community", content: "320人共鸣，获得某医疗基金关注", emoji: "🔥" }
    ]
  },
  {
    id: "proj-3",
    name: "设计师的魔法画笔",
    icon: "palette",
    intro: "💡 \"每次改 banner 都要等设计师排期，能不能有个AI让我自己画？\" —— @运营妹子小鱼",
    description: "运营小鱼受够了每次改图都要排期一周的痛苦。这个工具让不懂设计的人也能用自然语言生成专业级的矢量设计稿，并与主流设计软件无缝对接。",
    auroraScore: 84,
    radar: { concept: 89, research: 72, planning: 82, extension: 85, evaluation: 78 },
    radarContributors: {
      evaluation: { author: "运营妹子小鱼", avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDwhYCC9nn_EwuibGxEcPrfCQ1QIiX2sHJgZhWuFZpB2FoHVAunifZjPzmDftBNSDeMfGs1UI2sqmi_OaL5t8HDsPE3EAfzB_w2h-ZXpT2L2lAYqDfhvVapEk86KfYcXNy-XJJIlpZcQtUij6pr2EuUgiv_5qputmKlxk2vHJwTzughrBUnXc-Dt4f8VE3M96O6dbIFh66QJH8OljYZ16xbRhtXuZxxjOg4lUgVXpXswRDf89jlD-UAJhmVYO4OJo3j0YP22WIOvcL" },
      extension: { author: "前端大佬阿杰", avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK4JRcWqO_GkuoyDVDtMctIC8xJnOpzwrK-bpagZtolvsfqJA9sVCoZrssfOZBfX5vuZHpZg4kysJB5EVbkeYaQsD0czXtadAfwNRtnPfd67KIOzxTm_LwBQ60G8oXGFnINdaJbCIki19JiCniZh6sQHEOTD5glvuJdKQjk3UHEXJlqcPqtk9P7mGvLYUBXDDHLEzh_on2EUN77m0UjuT6i92aGcu7JWZrq_966Iv6IoB4w4VisogP4A068hG8QGM5JYiiUmdmzmZ0" }
    },
    tags: ["个人成长 / 实践与行动 / 目标与规划", "Generative Art", "打工人的救星"],
    commentsCount: 24,
    timeAgo: "1天前",
    comments: [
      {
        id: "rec-3-1",
        author: "运营妹子小鱼",
        timeAgo: "1天前",
        content: "用自然语言生成了一版年中大促的 banner，效果出乎意料的好！直接发给领导看，他居然没发现是 AI 生成的，还夸我设计水平进步了哈哈。唯一的问题是生成的文字排版有时候会叠在一起，希望能加一个自动避让的功能。",
        type: "comment" as const
      },
      {
        id: "rec-3-2",
        author: "前端大佬阿杰",
        timeAgo: "3天前",
        content: "端侧模型部署完成，首次加载大约3秒，后续生成基本秒出。SVG 输出可以直接拖进 Figma 里编辑。",
        type: "expansion" as const
      }
    ],
    hotness: "5.2k",
    likes: 189,
    painPointCount: 89,
    inspirationSource: "每次改个 banner 都要等设计师排期一周，改三个字又要再等两天。能不能有个 AI 让我自己输入几句话就生成好看的图？",
    inspirationAuthor: "@运营妹子小鱼",
    inspirationAuthorRole: "互联网公司内容运营",
    coCreationTimeline: [
      { date: "5月15日", author: "运营妹子小鱼", authorRole: "💡 灵感发起人", eventType: "inspiration", content: "在群里吐槽：'改三个字等两天，我自己PS又丑哭'", emoji: "💡" },
      { date: "5月18日", author: "前端大佬阿杰", authorRole: "🛠️ 魔法架构师", eventType: "tech_claim", content: "提出用端侧模型+SVG生成方案，无需上传云端", emoji: "🔧" }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [submitInitialTag, setSubmitInitialTag] = useState<string | null>(null);
  const [submitTargetProjectId, setSubmitTargetProjectId] = useState<string | null>(null);
  const [submitInitialRecord, setSubmitInitialRecord] = useState<Comment | null>(null);
  const [submitInitialDraft, setSubmitInitialDraft] = useState<DraftRecord | null>(null);
  const [submitRatingFields, setSubmitRatingFields] = useState<string[]>([]);
  const [submitCustomInputs, setSubmitCustomInputs] = useState<{ name: string; type: 'singleLine' | 'multiLine' }[]>([]);
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const checkAuth = async () => {
    const token = localStorage.getItem("stars:token");
    if (token) {
      try {
        const response = await fetch("/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.data || data);
        } else {
          localStorage.removeItem("stars:token");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Failed to check auth", err);
      }
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [activeTab]);

  const requireAuth = (action: () => void) => {
    if (currentUser) {
      action();
    } else {
      setShowNotification("此操作需要登录，正在为您跳转...");
      setTimeout(() => {
        setShowNotification("");
        setActiveTab("auth");
      }, 1500);
    }
  };

  const [drafts, setDrafts] = useState<DraftRecord[]>(() => {
    const saved = localStorage.getItem("stars:drafts");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("stars:drafts", JSON.stringify(drafts));
  }, [drafts]);

  const handleSaveDraft = () => {
    requireAuth(() => {
      if ((window as any).saveCurrentDraft) {
        const draft = (window as any).saveCurrentDraft();
        if (draft) {
          setDrafts(prev => {
            const newDrafts = prev.filter(d => d.id !== draft.id);
            return [draft, ...newDrafts];
          });
          triggerNotification("已成功保存到待发布记录！");
        }
      }
    });
  };

  const proceedToTab = (tabId: string) => {
    if (tabId === "submit") {
      setSubmitInitialTag(null);
      setSubmitTargetProjectId(null);
      setSubmitInitialRecord(null);
      setSubmitInitialDraft(null);
      setSubmitRatingFields([]);
      setSubmitCustomInputs([]);
    }
    setActiveTab(tabId);
    (window as any).isSubmitFormDirty = false;
  };

  const handleTabChange = (tabId: string) => {
    if (activeTab === "submit" && (window as any).isSubmitFormDirty) {
      setPendingTab(tabId);
      setDraftModalOpen(true);
      return;
    }
    proceedToTab(tabId);
  };
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [likedProjectIds, setLikedProjectIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("stars:liked");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedMethodologyDim, setSelectedMethodologyDim] = useState<string | undefined>(undefined);
  const [showMethodologyPage, setShowMethodologyPage] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("all");
  const [isTopBarScrolled, setIsTopBarScrolled] = useState(false);
  const [showNotification, setShowNotification] = useState("");
  const [archiveInitialFilter, setArchiveInitialFilter] = useState<string>("全部");

  // ===== 痛点共鸣 & 项目追踪状态（蔡加尼克效应）=====
  const [painPointIds, setPainPointIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("stars:painpoints");
    return saved ? JSON.parse(saved) : [];
  });
  const [trackedProjectIds, setTrackedProjectIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("stars:tracked");
    return saved ? JSON.parse(saved) : [];
  });

  // Load Projects from Server API
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/projects", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("stars:token")}` }
        });
        if (response.ok) {
          const data = await response.json();
          // API 返回的是 ApiResponse，提取真正的项目列表数组
          const projects = data.data?.list || data.list || data;
          setProjectsList(projects);
        } else {
          setProjectsList([]);
        }
      } catch (err) {
        console.warn("Failed to load backend API, falling back to empty list.", err);
        setProjectsList([]);
      }
    }
    loadProjects();
  }, [currentUser]);

  // Sync likes to localStorage
  useEffect(() => {
    localStorage.setItem("stars:liked", JSON.stringify(likedProjectIds));
  }, [likedProjectIds]);

  // 同步痛点共鸣和追踪列表到localStorage
  useEffect(() => {
    localStorage.setItem("stars:painpoints", JSON.stringify(painPointIds));
  }, [painPointIds]);
  useEffect(() => {
    localStorage.setItem("stars:tracked", JSON.stringify(trackedProjectIds));
  }, [trackedProjectIds]);

  // Track scroll event to transform Top App Bar background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsTopBarScrolled(true);
      } else {
        setIsTopBarScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Like Toggle interaction helper
  const handleLikeToggle = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      setLikedProjectIds((prev) => {
        const isCurrentlyLiked = prev.includes(id);
        const updated = isCurrentlyLiked ? prev.filter((item) => item !== id) : [...prev, id];

        // Mutate likes count locally inside projectsList to mirror server instantly
        setProjectsList((list) =>
          list.map((proj) => {
            if (proj.id === id) {
              return {
                ...proj,
                likes: isCurrentlyLiked ? proj.likes - 1 : proj.likes + 1,
              };
            }
            return proj;
          })
        );

        triggerNotification(isCurrentlyLiked ? "已从投资组合中撤出支持" : "已纳入投资组合 · 影响力指数 +1 🚀");
        return updated;
      });
    });
  };

  // Bookmark Toggle interaction helper
  const handleBookmarkToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAuth(async () => {
      // 乐观更新
      let nextSaved = false;
      setProjectsList((list) =>
        list.map((proj) => {
          if (proj.id === id) {
            nextSaved = !proj.bookmarked;
            return {
              ...proj,
              bookmarked: nextSaved,
            };
          }
          return proj;
        })
      );
      triggerNotification(nextSaved ? "已收藏到档案收藏" : "已取消收藏");

      // 异步同步到后端
      try {
        await fetch(`/api/projects/${id}/bookmark`, { 
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem("stars:token")}` }
        });
      } catch (err) {
        console.error("Failed to sync bookmark toggle", err);
      }
    });
  };

  // Record Bookmark Toggle
  const handleRecordBookmarkToggle = async (projectId: string, recordId: string) => {
    // 乐观更新
    let nextSaved = false;
    setProjectsList((list) =>
      list.map((proj) => {
        if (proj.id === projectId && proj.comments) {
          return {
            ...proj,
            comments: proj.comments.map(c => {
              if (c.id === recordId) {
                nextSaved = !c.bookmarked;
                return { ...c, bookmarked: nextSaved };
              }
              return c;
            })
          };
        }
        return proj;
      })
    );

    triggerNotification(nextSaved ? "已收藏该记录 🌟" : "已取消记录收藏");

    // 异步同步到后端
    try {
      await fetch(`/api/projects/${projectId}/comments/${recordId}/bookmark`, { 
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("stars:token")}` }
      });
    } catch (err) {
      console.error("Failed to sync record bookmark toggle", err);
    }
  };

  const triggerNotification = (text: string) => {
    setShowNotification(text);
    setTimeout(() => {
      setShowNotification("");
    }, 2500);
  };

  // ===== 痛点共鸣切换 =====
  // 点亮"痛点共鸣"后自动追踪该项目（订阅推送）
  const handlePainPointToggle = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    requireAuth(() => {
      setPainPointIds((prev) => {
        const hasPain = prev.includes(id);
        if (hasPain) {
          // 取消共鸣 → 同时取消追踪
          setTrackedProjectIds((t) => t.filter((tid) => tid !== id));
          triggerNotification("已取消痛点共鸣，停止追踪该项目");
          return prev.filter((pid) => pid !== id);
        } else {
          // 点亮共鸣 → 自动开始追踪
          setTrackedProjectIds((t) => t.includes(id) ? t : [...t, id]);
          // 更新项目的痛点计数
          setProjectsList((list) =>
            list.map((proj) =>
              proj.id === id
                ? { ...proj, painPointCount: (proj.painPointCount ?? 0) + 1 }
                : proj
            )
          );
          triggerNotification("⚡ 痛点共鸣已点亮！已自动追踪该项目的所有动态");
          return [...prev, id];
        }
      });
    });
  };

  // Switch to specific project automatically on dynamic title selection
  const handleSelectProjectByName = (name: string) => {
    const matched = projectsList.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));
    if (matched) {
      setActiveProjectId(matched.id);
    } else {
      setActiveTab("explore");
    }
  };

  const handleSubmissionSuccess = (data: any, isRecord: boolean, targetProjectId?: string | null, isEdit?: boolean) => {
    if (isRecord && targetProjectId) {
      setProjectsList((prev) =>
        prev.map((proj) => {
          if (proj.id === targetProjectId) {
            if (isEdit) {
              return {
                ...proj,
                comments: (proj.comments || []).map(c => c.id === data.id ? data : c)
              };
            } else {
              return {
                ...proj,
                comments: [data, ...(proj.comments || [])],
                commentsCount: proj.commentsCount + 1
              };
            }
          }
          return proj;
        })
      );
      setActiveProjectId(targetProjectId);
      triggerNotification(isEdit ? "记录已成功更新！✨" : "已成功添加新记录！✨");
    } else {
      setProjectsList((prev) => [data, ...prev]);
      setActiveProjectId(data.id);
      triggerNotification("多模态 AI 价值地图评估完成（新档案库已创建）！✨");
    }
  };

  // CRUD for Projects (Archive)
  const handleAddProject = async (newProject: Project) => {
    requireAuth(async () => {
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("stars:token")}`
          },
          body: JSON.stringify(newProject)
        });
        if (response.ok) {
          const res = await response.json();
          const createdProject = res.data || res;
          setProjectsList((prev) => [createdProject, ...prev]);
          triggerNotification("已成功创建新档案库！");
        }
      } catch (e) {
        console.error("Failed to add project to backend:", e);
      }
    });
  };

  const handleUpdateProject = async (id: string, updatedFields: Partial<Project>) => {
    requireAuth(async () => {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("stars:token")}`
          },
          body: JSON.stringify(updatedFields)
        });
        if (response.ok) {
          setProjectsList((prev) =>
            prev.map((proj) => (proj.id === id ? { ...proj, ...updatedFields } : proj))
          );
          triggerNotification("档案库已更新！");
        }
      } catch (e) {
        console.error("Failed to update project in backend:", e);
      }
    });
  };

  const handleDeleteProject = async (id: string) => {
    requireAuth(async () => {
      try {
        const response = await fetch(`/api/projects/${id}`, { 
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("stars:token")}` }
        });
        if (response.ok) {
          setProjectsList((prev) => prev.filter((proj) => proj.id !== id));
          triggerNotification("档案库已删除");
        }
      } catch (e) {
        console.error("Failed to delete project from backend:", e);
      }
    });
  };

  const handleDeleteRecord = async (projectId: string, recordId: string) => {
    requireAuth(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/comments/${recordId}`, { 
          method: "DELETE",
          headers: { "Authorization": `Bearer ${localStorage.getItem("stars:token")}` }
        });
        if (response.ok) {
          setProjectsList((prev) =>
            prev.map((proj) => {
              if (proj.id === projectId && proj.comments) {
                return {
                  ...proj,
                  comments: proj.comments.filter(c => c.id !== recordId),
                  commentsCount: Math.max(0, proj.commentsCount - 1)
                };
              }
              return proj;
            })
          );
          triggerNotification("记录已删除");
        }
      } catch (err) {
        console.error("Failed to delete record", err);
      }
    });
  };

  // Filters calculation
  const filteredProjects = projectsList.filter((proj) => {
    // 1. Search Query logic
    const matchesSearch =
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.intro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Mini tags select filter
    const matchesTag =
      activeTag === "all" ||
      proj.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const bbookmarkeds = projectsList.filter((p) => p.bookmarked);
  const myCreatedCount = projectsList.filter((p) => p.timeAgo === "刚刚").length;

  return (
    <div className="relative min-h-screen pb-28 text-[#dae2fd] bg-[#12161A]">

      {/* Floating Dynamic Notification Toast */}
      {showNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full bg-slate-900/90 border border-[#d0bcff]/20 text-[#d0bcff] text-xs font-sans shadow-[0_4px_16px_rgba(208,188,255,0.25)] backdrop-blur-md animate-bounce">
          {showNotification}
        </div>
      )}

      {/* Draft Save Confirmation Modal for Tab Switching */}
      <ConfirmModal
        isOpen={draftModalOpen}
        title="保存草稿"
        message="您有正在编辑的内容，是否保存到待发布记录后再离开？"
        onConfirm={() => {
          handleSaveDraft();
          setDraftModalOpen(false);
          if (pendingTab) proceedToTab(pendingTab);
        }}
        onCancel={() => {
          setDraftModalOpen(false);
          if (pendingTab) proceedToTab(pendingTab);
        }}
      />

      {/* TopAppBar - Persistent header matches mockup templates */}
      {!showMethodologyPage && (
        <header
          className={`flex justify-between items-center px-6 h-16 w-full z-50 fixed top-0 left-0 border-b transition-all duration-300 ${
            isTopBarScrolled
              ? "bg-[#141416]/90 shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl border-[#242428]"
              : "bg-transparent border-transparent"
          }`}
        >
          {/* Left: Menu */}
          <div className="flex items-center w-1/3">
            {/* 占位以保持 Logo 绝对居中 */}
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center w-1/3">
            <h1
              onClick={() => {
                setActiveTab("home");
                setActiveProjectId(null);
                setShowMethodologyPage(false);
              }}
              className="font-display text-[17px] font-bold text-[#E0E0E0] tracking-[0.15em] hover:text-white cursor-pointer select-none transition-colors"
            >
              迹向
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end w-1/3">
            {/* The login button was moved to ProfileView */}
          </div>
        </header>
      )}



      {/* Full screen explanatory Methodology page */}
      {showMethodologyPage ? (
        <div className="animate-fade-in relative z-10 pt-4 max-w-4xl mx-auto">
          {/* Methodology top app override headers */}
          <header className="flex justify-between items-center px-6 h-16 w-full border-b bg-[#0b1326]/90 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-white/10 backdrop-blur-lg select-none">
            <button
              onClick={() => {
                setShowMethodologyPage(false);
                setSelectedMethodologyDim(undefined);
              }}
              className="text-[#d0bcff] hover:opacity-8 active:scale-95 flex items-center justify-center p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-sm font-bold bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] bg-clip-text text-transparent">
              价值评估体系
            </h1>
            <div className="w-8 h-8" />
          </header>

          <Methodology
            selectedDefaultDimension={selectedMethodologyDim}
            onGoToSubmit={() => {
              setShowMethodologyPage(false);
              setSelectedMethodologyDim(undefined);
              setActiveTab("submit");
            }}
          />
        </div>
      ) : (
        /* Standard Navigation Tab Controller content */
        <div className={activeTab === "explore" ? "w-full h-[100dvh] pt-[72px] pb-[72px] md:pb-0 flex flex-col" : "pt-[64px]"}>
          {/* Tab 1: Home dashboard */}
          {activeTab === "home" && (
            <div className="flex flex-col w-full bg-[#12161A] min-h-screen">
              {/* Core Feature: Mind Map Tree with Integrated Hero Section */}
              <MindMapSection 
                isLoggedIn={!!currentUser}
                onBrowseProjects={() => setActiveTab("explore")}
                onSubmitIdea={() => setActiveTab("submit")}
                onCategorySelect={(filter) => {
                  setArchiveInitialFilter(filter);
                  setActiveTab("archive");
                }}
              />
              
              {/* Reference to Image 4 */}
              <Footer />
            </div>
          )}

          {/* Tab 2: 3D Explore Star Map */}
          {activeTab === "explore" && (
            <div className="flex-1 relative bg-[#030712] animate-fade-in flex flex-col overflow-hidden">
              {/* Top Header Controls */}
              <div className="w-full px-4 flex justify-between items-center mb-2 mt-2 relative z-10">
                <div className="flex items-center gap-2 text-[#cbc3d7]">
                  <Compass className="w-5 h-5 text-[#4cd7f6]" />
                  <span className="font-display font-black text-lg tracking-widest uppercase">灵境</span>
                </div>
                <button className="text-[#cbc3d7]/60 hover:text-white transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>

              {/* HUD / Filters Container - Occupies actual DOM space */}
              <div className="w-full px-4 py-3 z-10 flex flex-col gap-3 bg-[#030712]/95 border-b border-white/5 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center w-full">
                  <div className="relative group w-full pointer-events-auto overflow-hidden rounded border border-[#4cd7f6]/30">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4cd7f6]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="寻找未知的星系..."
                      className="w-full bg-[#0b1326]/60 backdrop-blur-md py-2.5 pl-10 pr-12 text-xs text-[#4cd7f6] placeholder-[#4cd7f6]/40 focus:outline-none focus:bg-[#4cd7f6]/10 transition-all font-mono tracking-wider"
                    />
                    {/* 装饰性细节 */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-[#4cd7f6]/20 bg-[#4cd7f6]/5 flex flex-col justify-center items-center gap-1">
                      <div className="w-4 h-[1px] bg-[#4cd7f6]/60" />
                      <div className="w-2 h-[1px] bg-[#4cd7f6]/60" />
                      <div className="w-4 h-[1px] bg-[#4cd7f6]/60" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 pointer-events-auto">
                  <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 scroll-smooth">
                    {[
                      { id: "all", label: "全部标签" },
                      { id: "打工人的救星", label: "🦸 打工人的救星" },
                      { id: "让父母的生活更简单", label: "🏠 让父母的生活更简单" },
                      { id: "搞钱小助手", label: "💰 搞钱小助手" },
                      { id: "无聊工作终结者", label: "⚡ 无聊工作终结者" },
                      { id: "科技向善", label: "💚 科技向善" },
                    ].map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setActiveTag(tag.id)}
                        className={`shrink-0 px-2 py-1 font-mono text-[9px] uppercase rounded border transition-colors cursor-pointer ${
                          activeTag === tag.id
                            ? "border-[#4cd7f6]/50 bg-[#4cd7f6]/20 text-[#4cd7f6] shadow-[0_0_8px_rgba(76,215,246,0.3)]"
                            : "border-transparent bg-black/40 text-[#cbc3d7]/50 hover:bg-[#171f33]/80 hover:text-[#cbc3d7]"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3D Canvas Container - Fills remaining space without overlapping */}
              <div className="flex-1 relative w-full h-full">
                <StarMapGraph projects={filteredProjects} onSelectProject={(id) => setActiveProjectId(id)} />
              </div>
            </div>
          )}

          {/* Tab 3: Dynamic creator form stepper */}
          {activeTab === "submit" && (
            <SubmitForm 
              onSuccess={(data, isRecord) => {
                const currentProjectId = submitTargetProjectId;
                const isEdit = !!submitInitialRecord;
                
                setSubmitInitialTag(null);
                setSubmitTargetProjectId(null);
                setSubmitRatingFields([]);
                setSubmitCustomInputs([]);
                setActiveTab("archive"); // Reset bottom tab to archive so SubmitForm doesn't remain
                
                // 如果是通过编辑草稿发布的，我们发布成功后应当删除它
                if (submitInitialDraft) {
                  setDrafts(d => d.filter(x => x.id !== submitInitialDraft.id));
                }
                
                handleSubmissionSuccess(data, isRecord, currentProjectId, isEdit);
              }}
              onCancel={() => {
                const prevProjectId = submitTargetProjectId;
                setSubmitInitialTag(null);
                setSubmitTargetProjectId(null);
                setSubmitRatingFields([]);
                setSubmitCustomInputs([]);
                
                if (prevProjectId) {
                  setActiveProjectId(prevProjectId);
                  setActiveTab("archive");
                } else {
                  setActiveTab("home");
                }
              }}
              onSaveDraft={(draft) => {
                setDrafts(prev => {
                  const newDrafts = prev.filter(d => d.id !== draft.id);
                  return [draft, ...newDrafts];
                });
                triggerNotification("已成功保存到待发布记录！");
              }}
              onDiscardDraft={(draftId) => {
                setDrafts(d => d.filter(x => x.id !== draftId));
              }}
              initialTag={submitInitialTag}
              isLocked={!!submitInitialTag}
              targetProjectId={submitTargetProjectId}
              targetProject={submitTargetProjectId ? projectsList.find(p => p.id === submitTargetProjectId) : null}
              ratingFields={submitRatingFields}
              customInputs={submitCustomInputs}
              initialRecord={submitInitialRecord}
              initialDraft={submitInitialDraft}
            />
          )}

          {/* Tab 4: Dynamic Portal Feeds */}
          {activeTab === "timeline" && (
            <TimelineFeed onSelectProjectName={handleSelectProjectByName} />
          )}

          {/* Tab 5: Archive List */}
          {activeTab === "archive" && (
            <ArchiveView
              projects={projectsList}
              initialFilter={archiveInitialFilter}
              currentUser={currentUser}
              onNavigateToAuth={() => setActiveTab("auth")}
              onSelectProject={(id) => setActiveProjectId(id)}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onBookmarkToggle={handleBookmarkToggle}
              onToggleRecordBookmark={handleRecordBookmarkToggle}
              onNavigateToSubmit={(projectId, tag, ratingFields, customInputs, initialRecord) => {
                setSubmitTargetProjectId(projectId);
                setSubmitInitialTag(tag);
                setSubmitRatingFields(ratingFields || []);
                setSubmitCustomInputs(customInputs || []);
                setSubmitInitialRecord(initialRecord || null);
                setActiveTab("submit");
              }}
            />
          )}

          {/* Tab 5: Auth Page */}
          {activeTab === "auth" && (
            <AuthPage onBack={() => setActiveTab("home")} />
          )}

          {/* Tab 6: Profile dashboard View */}
          {activeTab === "profile" && (
            <ProfileView
              currentUser={currentUser}
              onNavigateToAuth={() => setActiveTab("auth")}
              onLogout={() => {
                localStorage.removeItem("stars:token");
                setCurrentUser(null);
                triggerNotification("已安全注销");
              }}
              onAvatarUpload={async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                try {
                  const token = localStorage.getItem("stars:token");
                  const res = await fetch("/api/auth/me/avatar", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setCurrentUser((prev: any) => ({ ...prev, avatarUrl: data.data.avatarUrl }));
                    triggerNotification("头像更新成功");
                  } else {
                    triggerNotification("头像更新失败");
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              bookmarkedProjects={bbookmarkeds}
              likedProjects={likedProjectIds}
              submittedCount={myCreatedCount}
              allProjects={projectsList}
              draftRecords={drafts}
              onSelectProject={(id) => setActiveProjectId(id)}
              onLikeToggle={handleLikeToggle}
              onBookmarkToggle={handleBookmarkToggle}
              onToggleRecordBookmark={handleRecordBookmarkToggle}
              onSyncProjects={(syncedList) => setProjectsList(syncedList)}
              onEditDraft={(draft) => {
                setSubmitTargetProjectId(draft.targetProjectId);
                setSubmitInitialTag(draft.tag);
                setSubmitRatingFields(Object.keys(draft.ratings));
                setSubmitCustomInputs(Object.keys(draft.customData).map(k => ({ name: k, type: 'singleLine' })));
                setSubmitInitialRecord(null);
                setSubmitInitialDraft(draft);
                setActiveTab("submit");
              }}
              onNavigateToSubmit={(projectId, tag, ratingFields, customInputs, initialRecord) => {
                setSubmitTargetProjectId(projectId);
                setSubmitInitialTag(tag);
                setSubmitRatingFields(ratingFields || []);
                setSubmitCustomInputs(customInputs || []);
                setSubmitInitialRecord(initialRecord || null);
                setSubmitInitialDraft(null);
                setActiveTab("submit");
              }}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}
        </div>
      )}

      {/* Persistent Bottom navigation menu bar */}
      {!showMethodologyPage && !activeProjectId && (
        <BottomNav currentTab={activeTab} onChangeTab={handleTabChange} />
      )}

      {/* 全局未保存草稿提示弹窗 */}
      <ConfirmModal
        isOpen={draftModalOpen}
        title="保存草稿"
        message="发现未保存的编辑内容，是否将其保存为草稿？"
        onConfirm={() => {
          setDraftModalOpen(false);
          handleSaveDraft();
          if (pendingTab) proceedToTab(pendingTab);
        }}
        onCancel={() => {
          setDraftModalOpen(false);
          if (submitInitialDraft) {
            setDrafts(d => d.filter(x => x.id !== submitInitialDraft.id));
          }
          if (pendingTab) proceedToTab(pendingTab);
        }}
      />

      {/* 全局全屏覆盖 ArchiveDetailView */}
      {activeProjectId && (
        <div className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-[#141416] animate-fade-in overflow-hidden">
          <ArchiveDetailView
            project={projectsList.find((p) => p.id === activeProjectId)!}
            onBack={() => setActiveProjectId(null)}
            onToggleRecordBookmark={handleRecordBookmarkToggle}
            onDeleteRecord={handleDeleteRecord}
            onAddRecord={(projectId, tag, ratingFields, customInputs, initialRecord) => {
              setSubmitTargetProjectId(projectId);
              setSubmitInitialTag(tag);
              setSubmitRatingFields(ratingFields || []);
              setSubmitCustomInputs(customInputs || []);
              setSubmitInitialRecord(initialRecord || null);
              setActiveTab("submit");
              setActiveProjectId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
