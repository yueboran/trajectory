/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json());

// 支持通过环境变量设置端口
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || "";
    // We will check for the key, but fallback to mocked analysis if key is missing so that the server never crashes.
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-Memory Database
const AVATAR_ALEX = "https://lh3.googleusercontent.com/aida-public/AB6AXuBDwhYCC9nn_EwuibGxEcPrfCQ1QIiX2sHJgZhWuFZpB2FoHVAunifZjPzmDftBNSDeMfGs1UI2sqmi_OaL5t8HDsPE3EAfzB_w2h-ZXpT2L2lAYqDfhvVapEk86KfYcXNy-XJJIlpZcQtUij6pr2EuUgiv_5qputmKlxk2vHJwTzughrBUnXc-Dt4f8VE3M96O6dbIFh66QJH8OljYZ16xbRhtXuZxxjOg4lUgVXpXswRDf89jlD-UAJhmVYO4OJo3j0YP22WIOvcL";
const AVATAR_SARAH = "https://lh3.googleusercontent.com/aida-public/AB6AXuDK4JRcWqO_GkuoyDVDtMctIC8xJnOpzwrK-bpagZtolvsfqJA9sVCoZrssfOZBfX5vuZHpZg4kysJB5EVbkeYaQsD0czXtadAfwNRtnPfd67KIOzxTm_LwBQ60G8oXGFnINdaJbCIki19JiCniZh6sQHEOTD5glvuJdKQjk3UHEXJlqcPqtk9P7mGvLYUBXDDHLEzh_on2EUN77m0UjuT6i92aGcu7JWZrq_966Iv6IoB4w4VisogP4A068hG8QGM5JYiiUmdmzmZ0";
const COVER_NEBULA = "https://lh3.googleusercontent.com/aida-public/AB6AXuA99hFnNqHXmculJ6-FsETtUKjHvNfsBnOmQz-C5hOgdSnc4myAI3Dc-XHaZ-_YZbKxdLj7U-PQSdd0bzzqRxW6rJ6g2_VFCmmmUx59WOlzlD_KqFFOI3m7_WjuNiow2DrHSifi9fcC-48TR0M791BlCUgCSRJhW59cNL9_hbkxO7r1RXooLSYR0QPvPKdKTf1j1k8kRl0qh_tMiXFwMpWgL6bOONxTv9gGcpD5PvwH4sc8BGKKVnSsYFEg22qAEqfD6Teaj8FhvixT";
const CIRCUIT_BG = "https://lh3.googleusercontent.com/aida-public/AB6AXuDMe6U5eF2dSvliiBSEQqJ9w3lpJt4b22zAginWu7_7V7SX9pHnhgy9y64dy_dJsiXC2y3W3jb9FfmTcn96OVX5SeAjHUlVsnQ5t2E2q0Upf2gQTEvyOnKavs9ofr3W6IPq6In0bnQ3dMdbEGG9fQ4hPa2VNmFktuaG3xXsIMvLWOiwQ78KHhLFWPI9kufpn8_0iqkvgIlZ9SRQWApBDHbrZAVyCfw8sA7zdVGh3T5geRiyFDDZh4TfDX5Qu7R9mXS6suZL-AeG9EEl";

import { Project } from "./src/types";

let projects: Project[] = [
  {
    id: "nexus-design-engine",
    name: "迹向全能设计引擎",
    coverImage: COVER_NEBULA,
    icon: "view_in_ar",
    hotness: "12.4k",
    intro: "一个将品牌抽象词汇全自动转译为跨端 UI 组件的自主生成系统。",
    description: "在当前的软件开发流程中，设计到代码的转换依然存在巨大的沟通成本和实现偏差。迹向设计引擎试图通过引入多模态大语言模型，将品牌抽象标识（如情绪板、风格指南文本）直接转译为结构化的前端组件代码。\n\n有别于传统的模板生成器，本项目采用\"语义壳\"（Semantic Shell）理念，保证生成的UI不仅在视觉上符合像素级要求，在DOM结构上也满足无障碍和SEO的最佳实践。",
    auroraScore: 85,
    likes: 156,
    timeAgo: "2小时前",
    bookmarked: true,
    tags: ["理论与认知 / 思考与重构 / 体系与框架"],
    commentsCount: 12,
    radar: { concept: 95, research: 80, planning: 85, extension: 78, evaluation: 88 },
    radarContributors: {
      concept: { author: "Sarah Vega", avatarUrl: AVATAR_SARAH },
      planning: { author: "Alex Chen", avatarUrl: AVATAR_ALEX }
    },
    comments: [
      { id: "c1", author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "2小时前", title: "建议增加本地化部署方案的探讨", content: "关于\"技术与数据\"维度，建议增加对本地化部署方案的探讨，许多企业级用户对数据隐私要求极高。", type: "comment" },
      { id: "c2", author: "Sarah J.", avatarUrl: AVATAR_SARAH, timeAgo: "5小时前", title: "阶梯定价模型草案已更新", content: "商业模式图谱已更新，添加了基于 Token 消耗量的阶梯定价模型草案。", imageUrl: "/hot_carousel_1.png", images: ["/hot_carousel_1.png", "/hot_carousel_2.png", "/hot_carousel_3.png"], type: "comment" }
    ]
  },
  {
    id: "med-agent-plus",
    name: "医疗诊断智能体",
    coverImage: CIRCUIT_BG,
    icon: "neurology",
    hotness: "9.2k",
    intro: "结合多模态 RAG 与实时基因组数据，赋能精准的临床个性化诊断。",
    description: "认知循环（Cognitive Loop）系统将复杂的基因组模式与日常患者的诊断反馈相连接。利用语义向量数据库和多模态模型，使得医学研究人员能够实时查询最新数据，并自动将病患症状与细胞行为建立关联。",
    auroraScore: 92,
    likes: 124,
    timeAgo: "2小时前",
    tags: ["健康与精力 / 身体健康 / 医疗健康"],
    commentsCount: 124,
    radar: { concept: 95, research: 92, planning: 88, extension: 91, evaluation: 95 },
    radarContributors: {
      research: { author: "Dr. Zhang", avatarUrl: AVATAR_ALEX },
      evaluation: { author: "Sarah Vega", avatarUrl: AVATAR_SARAH }
    },
    comments: [
      { id: "c3", author: "Dr. Zhang", avatarUrl: AVATAR_ALEX, timeAgo: "1小时前", content: "多模态RAG在真实病例中的交叉校验逻辑是一个技术关键，期待看到完整临床报告。", type: "comment" }
    ]
  },
  {
    id: "fin-predict-pro",
    name: "高频量化预测网络",
    coverImage: COVER_NEBULA,
    icon: "account_balance",
    hotness: "6.8k",
    intro: "利用高频时序图网络来映射市场情绪轨迹的量化金融预测工具。",
    description: "QuantFlow 系统通过高频时序图谱嵌入模型，毫秒级解析全球股票市场异动及国际政策文本。通过将连续的向量特征映射到动态图表上，金融分析师可以捕捉到有关宏观经济流动的深层次、结构性预测信号。",
    auroraScore: 88,
    likes: 89,
    timeAgo: "5小时前",
    tags: ["实践与行动 / 预研与立项 / 调研与分析"],
    commentsCount: 89,
    radar: { concept: 90, research: 85, planning: 92, extension: 82, evaluation: 88 },
    radarContributors: {
      planning: { author: "Alex Chen", avatarUrl: AVATAR_ALEX }
    },
    comments: []
  }
];

// 时间线动态
let timelineFeeds = [
  { id: "t1", author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "2小时前", feedType: "expansion", feedTypeLabel: "为项目新增了拓展", projectName: "Project Quantum", projectIntro: "提出了一种基于新型大语言模型架构的微调方案，预计可以将推理速度提升30%，并显著降低显存消耗。目前已在测试环境中跑通初步验证。", likes: 24, replyCount: 5, categoryTags: ["技术创新"] },
  { id: "t2", author: "Sarah Vega", avatarUrl: AVATAR_SARAH, timeAgo: "4小时前", feedType: "comment", feedTypeLabel: "发表了评论", projectName: "探讨：AI辅助创作工具的商业化路径", content: "这个市场的切入点非常精妙。建议团队可以进一步考察在企业级SaaS环境下的兼容性问题，这可能是决定能否快速起量的关键。", likes: 12, replyCount: 3, categoryTags: ["User & Market"] },
  { id: "t3", author: "Product Team", avatarUrl: AVATAR_ALEX, timeAgo: "1天前", feedType: "recommendation", feedTypeLabel: "基于您的探索偏好", projectName: "Neural Canvas", projectIntro: "将大规模扩散模型与图形学流水线深度集成的新型可控图像引擎。", projectCover: COVER_NEBULA, likes: 58, replyCount: 12, categoryTags: ["User & Market"] }
];

// API Endpoints

// 1. 获取项目列表
app.get("/api/projects", (req, res) => {
  res.json(projects);
});

// 2. 获取单个项目
app.get("/api/projects/:id", (req, res) => {
  const proj = projects.find(p => p.id === req.params.id);
  if (proj) {
    res.json(proj);
  } else {
    res.status(404).json({ error: "Project not found" });
  }
});

// 2.5 收藏项目
app.post("/api/projects/:id/bookmark", (req, res) => {
  const proj = projects.find(p => p.id === req.params.id);
  if (proj) {
    proj.bookmarked = !proj.bookmarked;
  }
  res.json({ success: true });
});

// 2.6 收藏记录
app.post("/api/projects/:id/comments/:commentId/bookmark", (req, res) => {
  const proj = projects.find(p => p.id === req.params.id);
  if (proj && proj.comments) {
    const comment = proj.comments.find(c => c.id === req.params.commentId);
    if (comment) {
      comment.bookmarked = !comment.bookmarked;
    }
  }
  res.json({ success: true });
});

// 3. 添加评论
app.post("/api/projects/:id/comments", (req, res) => {
  const { author, content } = req.body;
  if (!author || !content) {
    return res.status(400).json({ error: "Author and content are required" });
  }

  let proj = projects.find(p => p.id === req.params.id);
  if (!proj) {
    // 为本地新建的档案库做兜底，防止 404 导致无法保存
    proj = {
      id: req.params.id,
      name: "新档案库",
      coverImage: COVER_NEBULA,
      icon: "folder",
      hotness: "0",
      intro: "",
      description: "",
      auroraScore: 80,
      likes: 0,
      timeAgo: "刚刚",
      bookmarked: false,
      tags: [],
      commentsCount: 0,
      radar: { concept: 80, research: 80, planning: 80, extension: 80, evaluation: 80 },
      radarContributors: {},
      comments: []
    };
    projects.push(proj);
  }

  const newComment = {
    id: "c_" + Date.now(),
    author,
    avatarUrl: author.toLowerCase().includes("sarah") ? AVATAR_SARAH : AVATAR_ALEX,
    timeAgo: "刚刚",
    content,
    type: "comment" as const
  };

  proj.comments.push(newComment);
  proj.commentsCount = proj.comments.length;
  timelineFeeds.unshift({
    id: "t_" + Date.now(),
    author,
    avatarUrl: newComment.avatarUrl,
    timeAgo: "刚刚",
    feedType: "comment",
    feedTypeLabel: "发表了评论",
    projectName: `探讨: ${proj.name}`,
    content,
    likes: 0,
    replyCount: 0
  } as any);

  res.json(newComment);
});

// 4. 获取时间线
app.get("/api/timeline", (req, res) => {
  res.json(timelineFeeds);
});

// 5. Gemini AI 评估
app.post("/api/evaluate", async (req, res) => {
  const { name, concept, tags } = req.body;

  if (!name || !concept) {
    return res.status(400).json({ error: "项目名称和核心观点是必填的。" });
  }

  const keyExists = !!process.env.GEMINI_API_KEY;

  if (!keyExists) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to mock.");
    const mockProject = generateMockProject(name, concept, tags);
    projects.push(mockProject);
    return res.json(mockProject);
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are a professional project completeness reviewer. Analyze the submitted project idea on five dimensions (0-100 score each):
1. concept: Is the core idea clear, compelling and unique?
2. research: Has adequate market research been done?
3. planning: Is there a clear technical architecture and milestone plan?
4. extension: Does the project have growth potential?
5. evaluation: What is the commercial potential and sustainability?
Provide output in JSON. Respond in Chinese for descriptions and comments.`;

    const instructions = `Analyze this product:
Project Name: ${name}
Core Concept: ${concept}
Tags: ${JSON.stringify(tags || [])}
Generate scores (0-100) and two expert comments.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: instructions,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["intro", "description", "radar", "tags", "feedbackAlex", "feedbackSarah"],
          properties: {
            intro: { type: Type.STRING },
            description: { type: Type.STRING },
            radar: {
              type: Type.OBJECT,
              required: ["concept", "research", "planning", "extension", "evaluation"],
              properties: {
                concept: { type: Type.NUMBER },
                research: { type: Type.NUMBER },
                planning: { type: Type.NUMBER },
                extension: { type: Type.NUMBER },
                evaluation: { type: Type.NUMBER },
              }
            },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            feedbackAlex: { type: Type.STRING },
            feedbackSarah: { type: Type.STRING }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const r = parsed.radar;
    const avgScore = Math.round((r.concept + r.research + r.planning + r.extension + r.evaluation) / 5);

    const finalProject = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      coverImage: COVER_NEBULA,
      icon: "rocket_launch",
      hotness: "1.0k",
      intro: parsed.intro,
      description: parsed.description,
      auroraScore: avgScore,
      likes: 12,
      timeAgo: "刚刚",
      bookmarked: false,
      tags: parsed.tags || [],
      commentsCount: 2,
      radar: { concept: r.concept, research: r.research, planning: r.planning, extension: r.extension, evaluation: r.evaluation },
      radarContributors: {
        concept: { author: "Alex Chen", avatarUrl: AVATAR_ALEX },
        evaluation: { author: "Sarah Vega", avatarUrl: AVATAR_SARAH }
      },
      comments: [
        { id: "ex1_" + Date.now(), author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "刚刚", content: parsed.feedbackAlex || "建议加入高可用逻辑。", type: "comment" as const },
        { id: "ex2_" + Date.now(), author: "Sarah Vega", avatarUrl: AVATAR_SARAH, timeAgo: "刚刚", content: parsed.feedbackSarah || "极具商业前景。", type: "comment" as const }
      ]
    };

    projects.push(finalProject);
    timelineFeeds.unshift({ id: "t_feed_" + Date.now(), author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "刚刚", feedType: "expansion", feedTypeLabel: "为项目新增了拓展", projectName: name, projectIntro: `完成度评估完成：综合得分 ${avgScore}！`, likes: 0, replyCount: 0, categoryTags: parsed.tags || ["Innovation"] });
    res.json(finalProject);

  } catch (error: any) {
    console.error("Gemini error, fallback to mock:", error);
    const mockProject = generateMockProject(name, concept, tags);
    projects.push(mockProject);
    res.json(mockProject);
  }
});

// Mock 生成器
function generateMockProject(name: string, concept: string, initialTags: string[]) {
  const finalTags = initialTags && initialTags.length ? initialTags : ["AI Integration", "Agent", "Semantic Core"];
  const r = { concept: 85, research: 78, planning: 72, extension: 68, evaluation: 80 };
  const avg = Math.round((r.concept + r.research + r.planning + r.extension + r.evaluation) / 5);

  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    coverImage: COVER_NEBULA,
    icon: "rocket_launch",
    hotness: "1.2k",
    intro: `针对 ${name} 的多维痛点模型，设计了自主式智能代理协同工作机制。`,
    description: `这是一个创新项目。本项目旨在解决：\n${concept}\n\n该项目采用先进的自适应语义网架作为数据基础设施，融合微卡片、零代码界面架构。`,
    auroraScore: avg,
    likes: 8,
    timeAgo: "刚刚",
    bookmarked: false,
    tags: finalTags,
    commentsCount: 2,
    radar: r,
    radarContributors: {
      concept: { author: "Alex Chen", avatarUrl: AVATAR_ALEX },
      research: { author: "Sarah Vega", avatarUrl: AVATAR_SARAH }
    },
    comments: [
      { id: "c_m1_" + Date.now(), author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "刚刚", content: `关于"${name}"的核心架构，建议将多智能体协作链前置路由。`, type: "comment" as const },
      { id: "c_m2_" + Date.now(), author: "Sarah Vega", avatarUrl: AVATAR_SARAH, timeAgo: "刚刚", content: `项目的市场切入角度新颖，B2B SaaS 行业技术渴求极深。`, type: "comment" as const }
    ]
  };
}

// Vite 集成中间件
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Celestial Server] running on http://localhost:${PORT}`);
  });
}

startServer();
