// server.ts
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
var app = express();
app.use(express.json());
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || "";
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
var AVATAR_ALEX = "https://lh3.googleusercontent.com/aida-public/AB6AXuBDwhYCC9nn_EwuibGxEcPrfCQ1QIiX2sHJgZhWuFZpB2FoHVAunifZjPzmDftBNSDeMfGs1UI2sqmi_OaL5t8HDsPE3EAfzB_w2h-ZXpT2L2lAYqDfhvVapEk86KfYcXNy-XJJIlpZcQtUij6pr2EuUgiv_5qputmKlxk2vHJwTzughrBUnXc-Dt4f8VE3M96O6dbIFh66QJH8OljYZ16xbRhtXuZxxjOg4lUgVXpXswRDf89jlD-UAJhmVYO4OJo3j0YP22WIOvcL";
var AVATAR_SARAH = "https://lh3.googleusercontent.com/aida-public/AB6AXuDK4JRcWqO_GkuoyDVDtMctIC8xJnOpzwrK-bpagZtolvsfqJA9sVCoZrssfOZBfX5vuZHpZg4kysJB5EVbkeYaQsD0czXtadAfwNRtnPfd67KIOzxTm_LwBQ60G8oXGFnINdaJbCIki19JiCniZh6sQHEOTD5glvuJdKQjk3UHEXJlqcPqtk9P7mGvLYUBXDDHLEzh_on2EUN77m0UjuT6i92aGcu7JWZrq_966Iv6IoB4w4VisogP4A068hG8QGM5JYiiUmdmzmZ0";
var COVER_NEBULA = "https://lh3.googleusercontent.com/aida-public/AB6AXuA99hFnNqHXmculJ6-FsETtUKjHvNfsBnOmQz-C5hOgdSnc4myAI3Dc-XHaZ-_YZbKxdLj7U-PQSdd0bzzqRxW6rJ6g2_VFCmmmUx59WOlzlD_KqFFOI3m7_WjuNiow2DrHSifi9fcC-48TR0M791BlCUgCSRJhW59cNL9_hbkxO7r1RXooLSYR0QPvPKdKTf1j1k8kRl0qh_tMiXFwMpWgL6bOONxTv9gGcpD5PvwH4sc8BGKKVnSsYFEg22qAEqfD6Teaj8FhvixT";
var CIRCUIT_BG = "https://lh3.googleusercontent.com/aida-public/AB6AXuDMe6U5eF2dSvliiBSEQqJ9w3lpJt4b22zAginWu7_7V7SX9pHnhgy9y64dy_dJsiXC2y3W3jb9FfmTcn96OVX5SeAjHUlVsnQ5t2E2q0Upf2gQTEvyOnKavs9ofr3W6IPq6In0bnQ3dMdbEGG9fQ4hPa2VNmFktuaG3xXsIMvLWOiwQ78KHhLFWPI9kufpn8_0iqkvgIlZ9SRQWApBDHbrZAVyCfw8sA7zdVGh3T5geRiyFDDZh4TfDX5Qu7R9mXS6suZL-AeG9EEl";
var projects = [
  {
    id: "nexus-design-engine",
    name: "\u8FF9\u5411\u5168\u80FD\u8BBE\u8BA1\u5F15\u64CE",
    coverImage: COVER_NEBULA,
    icon: "view_in_ar",
    hotness: "12.4k",
    intro: "\u4E00\u4E2A\u5C06\u54C1\u724C\u62BD\u8C61\u8BCD\u6C47\u5168\u81EA\u52A8\u8F6C\u8BD1\u4E3A\u8DE8\u7AEF UI \u7EC4\u4EF6\u7684\u81EA\u4E3B\u751F\u6210\u7CFB\u7EDF\u3002",
    description: '\u5728\u5F53\u524D\u7684\u8F6F\u4EF6\u5F00\u53D1\u6D41\u7A0B\u4E2D\uFF0C\u8BBE\u8BA1\u5230\u4EE3\u7801\u7684\u8F6C\u6362\u4F9D\u7136\u5B58\u5728\u5DE8\u5927\u7684\u6C9F\u901A\u6210\u672C\u548C\u5B9E\u73B0\u504F\u5DEE\u3002\u8FF9\u5411\u8BBE\u8BA1\u5F15\u64CE\u8BD5\u56FE\u901A\u8FC7\u5F15\u5165\u591A\u6A21\u6001\u5927\u8BED\u8A00\u6A21\u578B\uFF0C\u5C06\u54C1\u724C\u62BD\u8C61\u6807\u8BC6\uFF08\u5982\u60C5\u7EEA\u677F\u3001\u98CE\u683C\u6307\u5357\u6587\u672C\uFF09\u76F4\u63A5\u8F6C\u8BD1\u4E3A\u7ED3\u6784\u5316\u7684\u524D\u7AEF\u7EC4\u4EF6\u4EE3\u7801\u3002\n\n\u6709\u522B\u4E8E\u4F20\u7EDF\u7684\u6A21\u677F\u751F\u6210\u5668\uFF0C\u672C\u9879\u76EE\u91C7\u7528"\u8BED\u4E49\u58F3"\uFF08Semantic Shell\uFF09\u7406\u5FF5\uFF0C\u4FDD\u8BC1\u751F\u6210\u7684UI\u4E0D\u4EC5\u5728\u89C6\u89C9\u4E0A\u7B26\u5408\u50CF\u7D20\u7EA7\u8981\u6C42\uFF0C\u5728DOM\u7ED3\u6784\u4E0A\u4E5F\u6EE1\u8DB3\u65E0\u969C\u788D\u548CSEO\u7684\u6700\u4F73\u5B9E\u8DF5\u3002',
    auroraScore: 85,
    likes: 156,
    timeAgo: "2\u5C0F\u65F6\u524D",
    bookmarked: true,
    tags: ["\u7406\u8BBA\u4E0E\u8BA4\u77E5 / \u601D\u8003\u4E0E\u91CD\u6784 / \u4F53\u7CFB\u4E0E\u6846\u67B6"],
    commentsCount: 12,
    radar: { concept: 95, research: 80, planning: 85, extension: 78, evaluation: 88 },
    radarContributors: {
      concept: { author: "Sarah Vega", avatarUrl: AVATAR_SARAH },
      planning: { author: "Alex Chen", avatarUrl: AVATAR_ALEX }
    },
    comments: [
      { id: "c1", author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "2\u5C0F\u65F6\u524D", title: "\u5EFA\u8BAE\u589E\u52A0\u672C\u5730\u5316\u90E8\u7F72\u65B9\u6848\u7684\u63A2\u8BA8", content: '\u5173\u4E8E"\u6280\u672F\u4E0E\u6570\u636E"\u7EF4\u5EA6\uFF0C\u5EFA\u8BAE\u589E\u52A0\u5BF9\u672C\u5730\u5316\u90E8\u7F72\u65B9\u6848\u7684\u63A2\u8BA8\uFF0C\u8BB8\u591A\u4F01\u4E1A\u7EA7\u7528\u6237\u5BF9\u6570\u636E\u9690\u79C1\u8981\u6C42\u6781\u9AD8\u3002', type: "comment" },
      { id: "c2", author: "Sarah J.", avatarUrl: AVATAR_SARAH, timeAgo: "5\u5C0F\u65F6\u524D", title: "\u9636\u68AF\u5B9A\u4EF7\u6A21\u578B\u8349\u6848\u5DF2\u66F4\u65B0", content: "\u5546\u4E1A\u6A21\u5F0F\u56FE\u8C31\u5DF2\u66F4\u65B0\uFF0C\u6DFB\u52A0\u4E86\u57FA\u4E8E Token \u6D88\u8017\u91CF\u7684\u9636\u68AF\u5B9A\u4EF7\u6A21\u578B\u8349\u6848\u3002", imageUrl: "/hot_carousel_1.png", images: ["/hot_carousel_1.png", "/hot_carousel_2.png", "/hot_carousel_3.png"], type: "comment" }
    ]
  },
  {
    id: "med-agent-plus",
    name: "\u533B\u7597\u8BCA\u65AD\u667A\u80FD\u4F53",
    coverImage: CIRCUIT_BG,
    icon: "neurology",
    hotness: "9.2k",
    intro: "\u7ED3\u5408\u591A\u6A21\u6001 RAG \u4E0E\u5B9E\u65F6\u57FA\u56E0\u7EC4\u6570\u636E\uFF0C\u8D4B\u80FD\u7CBE\u51C6\u7684\u4E34\u5E8A\u4E2A\u6027\u5316\u8BCA\u65AD\u3002",
    description: "\u8BA4\u77E5\u5FAA\u73AF\uFF08Cognitive Loop\uFF09\u7CFB\u7EDF\u5C06\u590D\u6742\u7684\u57FA\u56E0\u7EC4\u6A21\u5F0F\u4E0E\u65E5\u5E38\u60A3\u8005\u7684\u8BCA\u65AD\u53CD\u9988\u76F8\u8FDE\u63A5\u3002\u5229\u7528\u8BED\u4E49\u5411\u91CF\u6570\u636E\u5E93\u548C\u591A\u6A21\u6001\u6A21\u578B\uFF0C\u4F7F\u5F97\u533B\u5B66\u7814\u7A76\u4EBA\u5458\u80FD\u591F\u5B9E\u65F6\u67E5\u8BE2\u6700\u65B0\u6570\u636E\uFF0C\u5E76\u81EA\u52A8\u5C06\u75C5\u60A3\u75C7\u72B6\u4E0E\u7EC6\u80DE\u884C\u4E3A\u5EFA\u7ACB\u5173\u8054\u3002",
    auroraScore: 92,
    likes: 124,
    timeAgo: "2\u5C0F\u65F6\u524D",
    tags: ["\u5065\u5EB7\u4E0E\u7CBE\u529B / \u8EAB\u4F53\u5065\u5EB7 / \u533B\u7597\u5065\u5EB7"],
    commentsCount: 124,
    radar: { concept: 95, research: 92, planning: 88, extension: 91, evaluation: 95 },
    radarContributors: {
      research: { author: "Dr. Zhang", avatarUrl: AVATAR_ALEX },
      evaluation: { author: "Sarah Vega", avatarUrl: AVATAR_SARAH }
    },
    comments: [
      { id: "c3", author: "Dr. Zhang", avatarUrl: AVATAR_ALEX, timeAgo: "1\u5C0F\u65F6\u524D", content: "\u591A\u6A21\u6001RAG\u5728\u771F\u5B9E\u75C5\u4F8B\u4E2D\u7684\u4EA4\u53C9\u6821\u9A8C\u903B\u8F91\u662F\u4E00\u4E2A\u6280\u672F\u5173\u952E\uFF0C\u671F\u5F85\u770B\u5230\u5B8C\u6574\u4E34\u5E8A\u62A5\u544A\u3002", type: "comment" }
    ]
  },
  {
    id: "fin-predict-pro",
    name: "\u9AD8\u9891\u91CF\u5316\u9884\u6D4B\u7F51\u7EDC",
    coverImage: COVER_NEBULA,
    icon: "account_balance",
    hotness: "6.8k",
    intro: "\u5229\u7528\u9AD8\u9891\u65F6\u5E8F\u56FE\u7F51\u7EDC\u6765\u6620\u5C04\u5E02\u573A\u60C5\u7EEA\u8F68\u8FF9\u7684\u91CF\u5316\u91D1\u878D\u9884\u6D4B\u5DE5\u5177\u3002",
    description: "QuantFlow \u7CFB\u7EDF\u901A\u8FC7\u9AD8\u9891\u65F6\u5E8F\u56FE\u8C31\u5D4C\u5165\u6A21\u578B\uFF0C\u6BEB\u79D2\u7EA7\u89E3\u6790\u5168\u7403\u80A1\u7968\u5E02\u573A\u5F02\u52A8\u53CA\u56FD\u9645\u653F\u7B56\u6587\u672C\u3002\u901A\u8FC7\u5C06\u8FDE\u7EED\u7684\u5411\u91CF\u7279\u5F81\u6620\u5C04\u5230\u52A8\u6001\u56FE\u8868\u4E0A\uFF0C\u91D1\u878D\u5206\u6790\u5E08\u53EF\u4EE5\u6355\u6349\u5230\u6709\u5173\u5B8F\u89C2\u7ECF\u6D4E\u6D41\u52A8\u7684\u6DF1\u5C42\u6B21\u3001\u7ED3\u6784\u6027\u9884\u6D4B\u4FE1\u53F7\u3002",
    auroraScore: 88,
    likes: 89,
    timeAgo: "5\u5C0F\u65F6\u524D",
    tags: ["\u5B9E\u8DF5\u4E0E\u884C\u52A8 / \u9884\u7814\u4E0E\u7ACB\u9879 / \u8C03\u7814\u4E0E\u5206\u6790"],
    commentsCount: 89,
    radar: { concept: 90, research: 85, planning: 92, extension: 82, evaluation: 88 },
    radarContributors: {
      planning: { author: "Alex Chen", avatarUrl: AVATAR_ALEX }
    },
    comments: []
  }
];
var timelineFeeds = [
  { id: "t1", author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "2\u5C0F\u65F6\u524D", feedType: "expansion", feedTypeLabel: "\u4E3A\u9879\u76EE\u65B0\u589E\u4E86\u62D3\u5C55", projectName: "Project Quantum", projectIntro: "\u63D0\u51FA\u4E86\u4E00\u79CD\u57FA\u4E8E\u65B0\u578B\u5927\u8BED\u8A00\u6A21\u578B\u67B6\u6784\u7684\u5FAE\u8C03\u65B9\u6848\uFF0C\u9884\u8BA1\u53EF\u4EE5\u5C06\u63A8\u7406\u901F\u5EA6\u63D0\u534730%\uFF0C\u5E76\u663E\u8457\u964D\u4F4E\u663E\u5B58\u6D88\u8017\u3002\u76EE\u524D\u5DF2\u5728\u6D4B\u8BD5\u73AF\u5883\u4E2D\u8DD1\u901A\u521D\u6B65\u9A8C\u8BC1\u3002", likes: 24, replyCount: 5, categoryTags: ["\u6280\u672F\u521B\u65B0"] },
  { id: "t2", author: "Sarah Vega", avatarUrl: AVATAR_SARAH, timeAgo: "4\u5C0F\u65F6\u524D", feedType: "comment", feedTypeLabel: "\u53D1\u8868\u4E86\u8BC4\u8BBA", projectName: "\u63A2\u8BA8\uFF1AAI\u8F85\u52A9\u521B\u4F5C\u5DE5\u5177\u7684\u5546\u4E1A\u5316\u8DEF\u5F84", content: "\u8FD9\u4E2A\u5E02\u573A\u7684\u5207\u5165\u70B9\u975E\u5E38\u7CBE\u5999\u3002\u5EFA\u8BAE\u56E2\u961F\u53EF\u4EE5\u8FDB\u4E00\u6B65\u8003\u5BDF\u5728\u4F01\u4E1A\u7EA7SaaS\u73AF\u5883\u4E0B\u7684\u517C\u5BB9\u6027\u95EE\u9898\uFF0C\u8FD9\u53EF\u80FD\u662F\u51B3\u5B9A\u80FD\u5426\u5FEB\u901F\u8D77\u91CF\u7684\u5173\u952E\u3002", likes: 12, replyCount: 3, categoryTags: ["User & Market"] },
  { id: "t3", author: "Product Team", avatarUrl: AVATAR_ALEX, timeAgo: "1\u5929\u524D", feedType: "recommendation", feedTypeLabel: "\u57FA\u4E8E\u60A8\u7684\u63A2\u7D22\u504F\u597D", projectName: "Neural Canvas", projectIntro: "\u5C06\u5927\u89C4\u6A21\u6269\u6563\u6A21\u578B\u4E0E\u56FE\u5F62\u5B66\u6D41\u6C34\u7EBF\u6DF1\u5EA6\u96C6\u6210\u7684\u65B0\u578B\u53EF\u63A7\u56FE\u50CF\u5F15\u64CE\u3002", projectCover: COVER_NEBULA, likes: 58, replyCount: 12, categoryTags: ["User & Market"] }
];
app.get("/api/projects", (req, res) => {
  res.json(projects);
});
app.get("/api/projects/:id", (req, res) => {
  const proj = projects.find((p) => p.id === req.params.id);
  if (proj) {
    res.json(proj);
  } else {
    res.status(404).json({ error: "Project not found" });
  }
});
app.post("/api/projects/:id/comments", (req, res) => {
  const { author, content } = req.body;
  if (!author || !content) {
    return res.status(400).json({ error: "Author and content are required" });
  }
  let proj = projects.find((p) => p.id === req.params.id);
  if (!proj) {
    proj = {
      id: req.params.id,
      name: "\u65B0\u6863\u6848\u5E93",
      coverImage: COVER_NEBULA,
      icon: "folder",
      hotness: "0",
      intro: "",
      description: "",
      auroraScore: 80,
      likes: 0,
      timeAgo: "\u521A\u521A",
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
    timeAgo: "\u521A\u521A",
    content,
    type: "comment"
  };
  proj.comments.push(newComment);
  proj.commentsCount = proj.comments.length;
  timelineFeeds.unshift({
    id: "t_" + Date.now(),
    author,
    avatarUrl: newComment.avatarUrl,
    timeAgo: "\u521A\u521A",
    feedType: "comment",
    feedTypeLabel: "\u53D1\u8868\u4E86\u8BC4\u8BBA",
    projectName: `\u63A2\u8BA8: ${proj.name}`,
    content,
    likes: 0,
    replyCount: 0
  });
  res.json(newComment);
});
app.get("/api/timeline", (req, res) => {
  res.json(timelineFeeds);
});
app.post("/api/evaluate", async (req, res) => {
  const { name, concept, tags } = req.body;
  if (!name || !concept) {
    return res.status(400).json({ error: "\u9879\u76EE\u540D\u79F0\u548C\u6838\u5FC3\u89C2\u70B9\u662F\u5FC5\u586B\u7684\u3002" });
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
                evaluation: { type: Type.NUMBER }
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
      timeAgo: "\u521A\u521A",
      bookmarked: false,
      tags: parsed.tags || [],
      commentsCount: 2,
      radar: { concept: r.concept, research: r.research, planning: r.planning, extension: r.extension, evaluation: r.evaluation },
      radarContributors: {
        concept: { author: "Alex Chen", avatarUrl: AVATAR_ALEX },
        evaluation: { author: "Sarah Vega", avatarUrl: AVATAR_SARAH }
      },
      comments: [
        { id: "ex1_" + Date.now(), author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "\u521A\u521A", content: parsed.feedbackAlex || "\u5EFA\u8BAE\u52A0\u5165\u9AD8\u53EF\u7528\u903B\u8F91\u3002", type: "comment" },
        { id: "ex2_" + Date.now(), author: "Sarah Vega", avatarUrl: AVATAR_SARAH, timeAgo: "\u521A\u521A", content: parsed.feedbackSarah || "\u6781\u5177\u5546\u4E1A\u524D\u666F\u3002", type: "comment" }
      ]
    };
    projects.push(finalProject);
    timelineFeeds.unshift({ id: "t_feed_" + Date.now(), author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "\u521A\u521A", feedType: "expansion", feedTypeLabel: "\u4E3A\u9879\u76EE\u65B0\u589E\u4E86\u62D3\u5C55", projectName: name, projectIntro: `\u5B8C\u6210\u5EA6\u8BC4\u4F30\u5B8C\u6210\uFF1A\u7EFC\u5408\u5F97\u5206 ${avgScore}\uFF01`, likes: 0, replyCount: 0, categoryTags: parsed.tags || ["Innovation"] });
    res.json(finalProject);
  } catch (error) {
    console.error("Gemini error, fallback to mock:", error);
    const mockProject = generateMockProject(name, concept, tags);
    projects.push(mockProject);
    res.json(mockProject);
  }
});
function generateMockProject(name, concept, initialTags) {
  const finalTags = initialTags && initialTags.length ? initialTags : ["AI Integration", "Agent", "Semantic Core"];
  const r = { concept: 85, research: 78, planning: 72, extension: 68, evaluation: 80 };
  const avg = Math.round((r.concept + r.research + r.planning + r.extension + r.evaluation) / 5);
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    coverImage: COVER_NEBULA,
    icon: "rocket_launch",
    hotness: "1.2k",
    intro: `\u9488\u5BF9 ${name} \u7684\u591A\u7EF4\u75DB\u70B9\u6A21\u578B\uFF0C\u8BBE\u8BA1\u4E86\u81EA\u4E3B\u5F0F\u667A\u80FD\u4EE3\u7406\u534F\u540C\u5DE5\u4F5C\u673A\u5236\u3002`,
    description: `\u8FD9\u662F\u4E00\u4E2A\u521B\u65B0\u9879\u76EE\u3002\u672C\u9879\u76EE\u65E8\u5728\u89E3\u51B3\uFF1A
${concept}

\u8BE5\u9879\u76EE\u91C7\u7528\u5148\u8FDB\u7684\u81EA\u9002\u5E94\u8BED\u4E49\u7F51\u67B6\u4F5C\u4E3A\u6570\u636E\u57FA\u7840\u8BBE\u65BD\uFF0C\u878D\u5408\u5FAE\u5361\u7247\u3001\u96F6\u4EE3\u7801\u754C\u9762\u67B6\u6784\u3002`,
    auroraScore: avg,
    likes: 8,
    timeAgo: "\u521A\u521A",
    bookmarked: false,
    tags: finalTags,
    commentsCount: 2,
    radar: r,
    radarContributors: {
      concept: { author: "Alex Chen", avatarUrl: AVATAR_ALEX },
      research: { author: "Sarah Vega", avatarUrl: AVATAR_SARAH }
    },
    comments: [
      { id: "c_m1_" + Date.now(), author: "Alex Chen", avatarUrl: AVATAR_ALEX, timeAgo: "\u521A\u521A", content: `\u5173\u4E8E"${name}"\u7684\u6838\u5FC3\u67B6\u6784\uFF0C\u5EFA\u8BAE\u5C06\u591A\u667A\u80FD\u4F53\u534F\u4F5C\u94FE\u524D\u7F6E\u8DEF\u7531\u3002`, type: "comment" },
      { id: "c_m2_" + Date.now(), author: "Sarah Vega", avatarUrl: AVATAR_SARAH, timeAgo: "\u521A\u521A", content: `\u9879\u76EE\u7684\u5E02\u573A\u5207\u5165\u89D2\u5EA6\u65B0\u9896\uFF0CB2B SaaS \u884C\u4E1A\u6280\u672F\u6E34\u6C42\u6781\u6DF1\u3002`, type: "comment" }
    ]
  };
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
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
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
