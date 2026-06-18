/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import * as THREE from "three";
import SpriteText from "three-spritetext";
import { Project, getRadarAverage } from "../types";

interface StarMapGraphProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
}

// 纹理全局缓存，防止在渲染循环中重复加载引起闪烁
const textureCache: Record<string, THREE.Texture> = {};
const getTexture = (url: string) => {
  if (!textureCache[url]) {
    textureCache[url] = new THREE.TextureLoader().load(url);
  }
  return textureCache[url];
};

// 基于雷达图平均值映射节点颜色
const getRadarColor = (avg: number) => {
  if (avg < 30) return "#d0bcff"; // 初期: 紫
  if (avg < 50) return "#b28dff"; // 发展中
  if (avg < 65) return "#4cd7f6"; // 中等: 蓝
  if (avg < 80) return "#fbabff"; // 良好: 粉
  if (avg < 90) return "#34d399"; // 优秀: 绿
  return "#fbbf24"; // 顶级: 金
};

export default function StarMapGraph({ projects, onSelectProject }: StarMapGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<any>());
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle resize and mouse move
  useEffect(() => {
    // 监听父容器真实尺寸
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          // 避免高度为0的初始状态
          if (width > 0 && height > 0) {
            setDimensions({ width, height });
          }
        }
      });
      observer.observe(containerRef.current);
      
      const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
      window.addEventListener("mousemove", handleMouseMove);
      
      return () => {
        observer.disconnect();
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, []);

  // Compute graph data
  const graphData = useMemo(() => {
    const gNodes: any[] = projects.map((p) => ({
      id: p.id,
      name: p.name,
      val: Math.max(1, Math.min(20, (p.painPointCount || 10) / 15 + (p.likes || 10) / 50)), // Normalize size based on interactions
      color: getRadarColor(getRadarAverage(p.radar)),
      score: p.auroraScore,
      intro: p.intro,
      painPointCount: p.painPointCount || 0,
      tags: p.tags,
    }));

    const gLinks: any[] = [];
    
    // Connect projects that share the same domain or tags
    for (let i = 0; i < gNodes.length; i++) {
      for (let j = i + 1; j < gNodes.length; j++) {
        const nodeA = gNodes[i];
        const nodeB = gNodes[j];
        
        let connectionStrength = 0;
        const commonTags = nodeA.tags.filter((t: string) => nodeB.tags.includes(t));
        connectionStrength += commonTags.length * 0.5;

        if (connectionStrength > 0) {
          gLinks.push({
            source: nodeA.id,
            target: nodeB.id,
            value: connectionStrength
          });
        }
      }
    }

    return { nodes: gNodes, links: gLinks };
  }, [projects]);

  // Dynamically calculate camera orbit distance based on the number of nodes
  const orbitDistance = useMemo(() => {
    // Base distance 400, expands up to 1200 depending on node density
    return Math.max(400, Math.min(1200, graphData.nodes.length * 10 + 350));
  }, [graphData.nodes.length]);

  // Adjust physics engine to avoid overlapping
  useEffect(() => {
    // Wrap in a small timeout to ensure the internal D3 engine is fully initialized by three-forcegraph
    const timer = setTimeout(() => {
      if (fgRef.current) {
        const chargeForce = fgRef.current.d3Force('charge');
        if (chargeForce) chargeForce.strength(-120); // 减弱斥力，避免球体飞出屏幕边界
        
        const linkForce = fgRef.current.d3Force('link');
        if (linkForce) linkForce.distance(40); // 缩短连线距离
        
        // Force graph natively reheats on data change, manual reheat can crash if called too early
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [graphData]);

  // Use a ref to track hover state inside the animation loop without triggering re-renders of the effect
  const isHoveringRef = useRef(false);
  useEffect(() => {
    isHoveringRef.current = !!hoverNode;
  }, [hoverNode]);

  // Camera animation loop for macro view (slow rotation)
  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;
    let isRotating = true;
    
    // Set initial camera position ONLY ONCE
    if (fgRef.current) {
      fgRef.current.cameraPosition(
        { x: 0, y: 100, z: orbitDistance }, // 稍微俯视
        { x: 0, y: -50, z: 0 } // 视点下移，从而让画面在屏幕上整体下移，避开顶部 UI
      );
    }

    const animate = () => {
      if (fgRef.current && !isHoveringRef.current && isRotating) {
        angle += Math.PI / 1500;
        fgRef.current.cameraPosition(
          {
            x: orbitDistance * Math.sin(angle),
            y: 80, // 保持俯视
            z: orbitDistance * Math.cos(angle),
          },
          { x: 0, y: -50, z: 0 } // 保持视点下移
        );
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [orbitDistance]); // Re-run if orbitDistance calculation changes

  const handleNodeHover = useCallback((node: any) => {
    setHoverNode(node || null);

    if (node) {
      const hNodes = new Set<string>();
      const hLinks = new Set<any>();
      hNodes.add(node.id);
      graphData.links.forEach((link: any) => {
        if (link.source.id === node.id || link.target.id === node.id) {
          hLinks.add(link);
          hNodes.add(link.source.id);
          hNodes.add(link.target.id);
        }
      });
      setHighlightNodes(hNodes);
      setHighlightLinks(hLinks);
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, [graphData.links]);

  const handleNodeClick = useCallback((node: any) => {
    if (!node) return;
    
    // Camera zoom in animation
    const distance = 100;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    
    fgRef.current?.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node, // lookAt ({ x, y, z })
      1000  // ms transition duration
    );

    // Call prop event after a small delay
    setTimeout(() => {
      onSelectProject(node.id);
    }, 500);
  }, [onSelectProject]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#030712] overflow-hidden group">
      {/* 深空背景层 */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none transition-transform duration-[20s] group-hover:scale-110"
        style={{ backgroundImage: 'url(/api/static/images/banners/profile_hero.png)', filter: 'brightness(0.6) contrast(1.2) grayscale(0.2)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#030712]/40 to-[#030712] pointer-events-none" />

      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#030712"
        nodeRelSize={4}
        nodeVal="val"
        nodeLabel={() => ""} // Use fixed React HUD panel instead to prevent mobile overflow
        nodeThreeObject={(node: any) => {
          // 只有第一次时创建 THREE 对象，后续直接复用并更新状态
          if (!node.__threeObj) {
            const group = new THREE.Group();
            
            const nodeVal = node.val || 4;
            const radius = Math.cbrt(nodeVal) * 6; // 稍微放大一点星球
            
            // 1. 星球本体 (Sphere)
            const imgIndex = (node.id.charCodeAt(0) % 4) + 1;
            const texUrl = `/hot_thumb_${imgIndex}.png`;
            const texture = getTexture(texUrl);
            
            const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
            const sphereMat = new THREE.MeshBasicMaterial({ 
              map: texture, 
              transparent: true,
              color: 0xffffff
            });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            group.add(sphere);

            // 2. 光晕层 (Atmosphere)
            const atmosGeo = new THREE.SphereGeometry(radius * 1.2, 32, 32);
            const atmosMat = new THREE.MeshBasicMaterial({
              color: node.color,
              transparent: true,
              opacity: 0.15,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            });
            const atmos = new THREE.Mesh(atmosGeo, atmosMat);
            group.add(atmos);

            // 3. 标签文字 (SpriteText)
            const sprite = new SpriteText(node.name);
            sprite.textHeight = Math.max(3, radius * 0.5); 
            sprite.fontFace = "system-ui, sans-serif";
            sprite.fontWeight = "bold";
            sprite.position.y = radius + sprite.textHeight / 2 + 2; 
            group.add(sprite);

            // 缓存到 node 实例上
            node.__threeObj = group;
            node.__sphereMat = sphereMat;
            node.__atmosMat = atmosMat;
            node.__sprite = sprite;
          }

          // 每次被调用时（例如 Hover 状态改变），直接更新材质属性，而不是重新创建
          const isFaded = hoverNode && !highlightNodes.has(node.id);
          const opacity = isFaded ? 0.2 : 1;
          
          node.__sphereMat.opacity = opacity;
          node.__sphereMat.color.setHex(isFaded ? 0x444444 : 0xffffff);
          
          if (node.__atmosMat) {
            node.__atmosMat.opacity = hoverNode?.id === node.id ? 0.5 : (isFaded ? 0.05 : 0.15);
          }
          
          node.__sprite.color = isFaded ? "rgba(255, 255, 255, 0.1)" : "rgba(218, 226, 253, 0.9)";
          
          return node.__threeObj;
        }}
        nodeResolution={32}
        linkOpacity={0.2}
        linkColor={(link: any) => highlightLinks.has(link) ? "#4cd7f6" : "rgba(100, 150, 255, 0.15)"}
        linkWidth={(link: any) => highlightLinks.has(link) ? 3 : 1}
        linkDirectionalParticles={(link: any) => highlightLinks.has(link) ? 6 : 2}
        linkDirectionalParticleWidth={(link: any) => highlightLinks.has(link) ? 2.5 : 1}
        linkDirectionalParticleColor={(link: any) => highlightLinks.has(link) ? "#fbabff" : "#4cd7f6"}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        enableNodeDrag={false}
        showNavInfo={false}
      />

      {/* React HUD Panel (Meso View Overlay) */}
      {hoverNode && (
        <div 
          className="fixed z-50 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-fade-in pointer-events-none transition-all duration-75 border border-white/10 w-[calc(100vw-32px)] md:w-80"
          style={
            dimensions.width < 768
              ? { left: 16, bottom: 96 } // 移动端固定在底部
              : { 
                  left: mousePos.x + 350 > dimensions.width ? mousePos.x - 340 : mousePos.x + 20,
                  top: mousePos.y + 200 > dimensions.height ? mousePos.y - 180 : mousePos.y + 20 
                } // PC端跟随鼠标
          }
        >
          {/* Card Background / Blur */}
          <div className="absolute inset-0 bg-[#0b1326]/80 backdrop-blur-xl z-0" />
          
          <div className="relative z-10 flex flex-col">
            {/* Header / Thumbnail */}
            <div className="flex gap-3 p-4 pb-3 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <div 
                className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 shadow-lg border border-white/10"
                style={{ backgroundImage: `url(/hot_thumb_${(hoverNode.id.charCodeAt(0) % 4) + 1}.png)` }}
              />
              <div className="flex flex-col justify-center overflow-hidden">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-black/40 border border-white/10 text-[#cbc3d7]/80">
                    {hoverNode.tags && hoverNode.tags[0] ? hoverNode.tags[0] : "GENERATIVE"}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: hoverNode.color, color: hoverNode.color }} />
                </div>
                <h3 className="font-display font-bold text-white text-sm truncate tracking-wide shadow-black drop-shadow-md">
                  {hoverNode.name}
                </h3>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-4 pt-3">
              <p className="font-sans text-xs text-[#cbc3d7]/80 leading-relaxed line-clamp-2 mb-3">
                <span className="text-amber-400 mr-1">💡</span>
                "{hoverNode.intro}"
              </p>
              
              {/* Footer Metrics */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-mono text-[#cbc3d7]/60">
                  <span className="flex items-center gap-1 text-amber-300">
                    <span>⚡</span> {hoverNode.painPointCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>💬</span> {(hoverNode.val * 3).toFixed(0)}
                  </span>
                </div>
                <div className="text-[9px] text-[#4cd7f6] uppercase tracking-widest font-bold animate-pulse">
                  点击锁定节点
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HUD 科技坐标系装饰 (替换原水印) */}
      <div className="absolute bottom-24 left-6 z-0 pointer-events-none select-none opacity-60 flex flex-col gap-1">
        <div className="flex items-end gap-2">
          <div className="w-8 h-8 border-l-2 border-b-2 border-[#4cd7f6]/40 relative">
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-[#4cd7f6]" />
          </div>
          <div className="flex flex-col mb-1">
            <span className="font-mono text-[10px] text-[#4cd7f6]/70 uppercase tracking-[0.3em] leading-none mb-1">
              SYS.COORD_X: 42.11 / Y: 18.09
            </span>
            <span className="font-mono text-[8px] text-[#cbc3d7]/40 uppercase tracking-widest leading-none">
              INTERACTIVE VALUE NETWORK TOPOLOGY
            </span>
          </div>
        </div>
        <div className="ml-10 w-32 h-[1px] bg-gradient-to-r from-[#4cd7f6]/30 to-transparent" />
        <div className="ml-10 w-24 h-[1px] bg-gradient-to-r from-[#d0bcff]/20 to-transparent mt-0.5" />
      </div>
    </div>
  );
}
