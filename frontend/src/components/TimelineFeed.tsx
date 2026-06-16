/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, MouseEvent } from "react";
import { Heart, MessageSquare, Share2, Bookmark, Star, Sparkles, User, Flame } from "lucide-react";
import { TimelineFeedItem } from "../types";

interface TimelineFeedProps {
  onSelectProjectName?: (projName: string) => void;
}

export default function TimelineFeed({ onSelectProjectName }: TimelineFeedProps) {
  const [feeds, setFeeds] = useState<TimelineFeedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [likesState, setLikesState] = useState<Record<string, { count: number; active: boolean }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeeds() {
      try {
        const response = await fetch("/api/timeline");
        if (response.ok) {
          const data: TimelineFeedItem[] = await response.json();
          setFeeds(data);

          // Initialize likes hash map local states
          const likesMap: Record<string, { count: number; active: boolean }> = {};
          data.forEach((feed) => {
            likesMap[feed.id] = { count: feed.likes, active: !!feed.isLiked };
          });
          setLikesState(likesMap);
        }
      } catch (err) {
        console.error("Failed to load timeline feeds", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeeds();
  }, []);

  const handleLikeToggle = (feedId: string, e: MouseEvent) => {
    e.stopPropagation();
    setLikesState((prev) => {
      const current = prev[feedId] || { count: 0, active: false };
      return {
        ...prev,
        [feedId]: {
          count: current.active ? current.count - 1 : current.count + 1,
          active: !current.active,
        },
      };
    });
  };

  const categories = [
    { id: "all", label: "相关动态" },
    { id: "recommendation", label: "高价值推荐" },
  ];

  const filteredFeeds = feeds.filter((feed) => {
    if (activeCategory === "all") return true;
    return feed.feedType === activeCategory;
  });

  return (
    <div className="pb-32 px-4 select-none animate-fade-in text-[#dae2fd] max-w-3xl mx-auto w-full">
      {/* Category Toggles Slider */}
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-4 pt-2 -mx-4 px-4 scroll-smooth snap-x">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`snap-start whitespace-nowrap px-5 py-2 rounded-full font-mono text-[10px] tracking-wider uppercase font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#a078ff] text-slate-950 border-[#d0bcff]/20 shadow-[0_0_15px_rgba(208,188,255,0.25)]"
                  : "bg-[#171f33]/60 text-[#cbc3d7] border-white/5 hover:bg-[#171f33]"
              }`}
            >
              {cat.id === "recommendation" && (
                <Star className="w-3.5 h-3.5 text-amber-200 fill-amber-300 inline mr-1" />
              )}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Outer Timeline Container */}
      <div className="relative mt-2">
        {/* Vertical alignment line for desktop layout */}
        <div className="timeline-line hidden md:block" />

        {loading ? (
          <div className="flex items-center justify-center py-20 text-xs text-[#cbc3d7]/50 font-mono">
            载入星空流实时动态中...
          </div>
        ) : filteredFeeds.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-xs text-[#cbc3d7]/50 font-mono">
            该过滤赛道中暂无最新的星系对齐动态。
          </div>
        ) : (
          <div className="flex flex-col gap-4 relative z-10">
            {filteredFeeds.map((feed) => {
              const likeInfo = likesState[feed.id] || { count: feed.likes, active: false };

              return (
                <article
                  key={feed.id}
                  className={`relative p-5 flex flex-col gap-3.5 backdrop-blur-md rounded-2xl border transition-colors ${
                    feed.feedType === "recommendation" || feed.feedType === "expansion"
                      ? "shimmer-border bg-[#171f33]/45"
                      : "bg-[#171f33]/30 border-white/5"
                  }`}
                >
                  {/* Glowing blur overlay for featured recommended star */}
                  {feed.feedType === "recommendation" && (
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-[#fbabff]/20 to-[#d0bcff]/20 rounded-2xl blur-xs -z-10" />
                  )}

                  {/* Header Author Info */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {feed.avatarUrl ? (
                        <img
                          src={feed.avatarUrl}
                          alt={feed.author}
                          className={`w-10 h-10 rounded-full border object-cover ${
                            feed.feedType === "recommendation" ? "border-[#fbabff]/40" : "border-[#d0bcff]/30"
                          }`}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2d3449] border border-white/10 flex items-center justify-center text-[#d0bcff]">
                          {feed.feedType === "recommendation" ? (
                            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                      )}
                      <div>
                        <h3 className="font-sans text-xs font-bold text-[#dae2fd]">
                          {feed.author}
                        </h3>
                        <p
                          className={`font-mono text-[9px] uppercase tracking-wider font-semibold mt-0.5 ${
                            feed.feedType === "expansion"
                              ? "text-[#4cd7f6]"
                              : feed.feedType === "recommendation"
                              ? "text-[#fbabff] font-bold"
                              : "text-[#cbc3d7]/60"
                          }`}
                        >
                          {feed.feedTypeLabel}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] text-[#cbc3d7]/40">
                      {feed.timeAgo}
                    </span>
                  </div>

                  {/* Content body based on Type */}
                  {feed.feedType === "expansion" && (
                    <div className="bg-[#0b1326]/50 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2 select-none">
                        <span className="px-1.5 py-0.5 rounded bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/30 font-mono text-[8.5px] uppercase font-bold tracking-wider">
                          技术创新
                        </span>
                        <span
                          onClick={() => onSelectProjectName?.(feed.projectName || "")}
                          className="font-mono text-[10px] text-[#cbc3d7]/80 hover:text-[#d0bcff] transition-colors cursor-pointer"
                        >
                          @{feed.projectName}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-[#dae2fd] leading-relaxed line-clamp-3">
                        {feed.projectIntro}
                      </p>
                    </div>
                  )}

                  {feed.feedType === "comment" && (
                    <div className="space-y-3.5">
                      <p className="font-sans text-xs text-[#dae2fd] leading-relaxed">
                        {feed.content}
                      </p>
                      {feed.projectName && (
                        <div
                          onClick={() => onSelectProjectName?.(feed.projectName?.replace("探讨: ", "") || "")}
                          className="p-3 bg-[#0b1326]/40 rounded-xl border-l-[3px] border-[#dae2fd]/30 text-[#cbc3d7] font-mono text-[10px] hover:bg-[#171f33] transition-colors cursor-pointer"
                        >
                          <span className="text-[#d0bcff] mr-1 font-semibold">@</span>
                          {feed.projectName}
                        </div>
                      )}
                    </div>
                  )}

                  {feed.feedType === "recommendation" && (
                    <div
                      onClick={() => onSelectProjectName?.(feed.projectName || "")}
                      className="group cursor-pointer relative"
                    >
                      <div className="h-32 rounded-xl overflow-hidden relative border border-white/5 mb-1.5 shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent z-10" />
                        <div className="absolute bottom-3.5 left-3.5 z-25">
                          <h4 className="font-display text-sm font-bold text-[#dae2fd] group-hover:text-[#d0bcff] transition-colors mb-1">
                            {feed.projectName}
                          </h4>
                          <span className="font-mono text-[8px] px-2 py-0.5 rounded border border-white/20 text-white/90 bg-slate-900/60 backdrop-blur-md uppercase tracking-wider font-semibold">
                            {feed.projectIntro}
                          </span>
                        </div>
                        {feed.projectCover && (
                          <img
                            src={feed.projectCover}
                            alt="Project abstract image cover"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interacting triggers */}
                  <div className="flex items-center gap-6 mt-1 pt-3.5 border-t border-white/5">
                    {/* Like button timeline */}
                    <button
                      onClick={(e) => handleLikeToggle(feed.id, e)}
                      className={`flex items-center gap-2 cursor-pointer transition-colors ${
                        likeInfo.active ? "text-rose-400" : "text-[#cbc3d7]/60 hover:text-[#d0bcff]"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likeInfo.active ? "fill-rose-500" : ""}`} />
                      <span className="font-mono text-[10px]">{likeInfo.count}</span>
                    </button>

                    {/* Comment feed timeline button */}
                    <button className="flex items-center gap-2 text-[#cbc3d7]/60 hover:text-[#4cd7f6] transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-mono text-[10px]">
                        {feed.feedType === "expansion" ? feed.replyCount : "回复"}
                      </span>
                    </button>

                    {/* Share feed timeline button */}
                    <button className="flex items-center gap-1 text-[#cbc3d7]/60 hover:text-[#4cd7f6] transition-colors ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
