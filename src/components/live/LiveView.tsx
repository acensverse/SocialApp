"use client"

import Image from "next/image"
import { X, Users, Share2, MoreHorizontal, Maximize2 } from "lucide-react"
import { LiveStream } from "./mockData"
import { LiveChat } from "./LiveChat"

interface LiveViewProps {
  stream: LiveStream;
  onClose: () => void;
}

export function LiveView({ stream, onClose }: LiveViewProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300">
      {/* Video Content */}
      <div className="relative flex-1 bg-black flex items-center justify-center p-2 md:p-8">
        <div className="relative aspect-video w-full max-w-5xl rounded-3xl md:rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(239,68,68,0.2)] border border-white/5">
          <Image 
            src={stream.thumbnail} 
            alt={stream.title}
            fill
            className="object-cover opacity-60 scale-105 blur-[2px]"
          />
          
          {/* Mock Video Player Controls */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-white text-center space-y-3 md:space-y-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                    <div className="w-0 h-0 border-t-[8px] md:border-t-[10px] border-t-transparent border-l-[12px] md:border-l-[15px] border-l-white border-b-[8px] md:border-b-[10px] border-b-transparent ml-1" />
                </div>
                <p className="font-black text-lg md:text-xl tracking-tight">Buffering Stream...</p>
             </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          
          {/* Header Overlay */}
          <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
              <div className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full animate-pulse" />
                Live
              </div>
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[11px] font-bold text-white flex items-center gap-1.5 md:gap-2">
                <Users className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {stream.viewers.toLocaleString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
              <button className="bg-white/10 hover:bg-white/20 p-1.5 md:p-2.5 rounded-full backdrop-blur-xl border border-white/10 transition-all text-white">
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-1.5 md:p-2.5 rounded-full backdrop-blur-xl border border-white/10 transition-all text-white">
                <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Overlay */}
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 flex items-end justify-between">
            <div className="max-w-[70%] md:max-w-xl">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                <div className="relative w-8 h-8 md:w-12 md:h-12">
                  <Image 
                    src={stream.userImage} 
                    alt={stream.userName}
                    fill
                    className="rounded-full object-cover border-2 border-red-500"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-white text-base md:text-2xl tracking-tight leading-tight truncate">{stream.title}</h2>
                  <p className="text-white/60 text-[10px] md:text-[14px] font-medium">@{stream.userName}</p>
                </div>
              </div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl backdrop-blur-xl border border-white/10 transition-all text-white">
              <Maximize2 className="w-4 h-4 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-3 bg-white/10 hover:bg-red-500 rounded-xl md:rounded-2xl backdrop-blur-xl border border-white/10 transition-all text-white z-50 group"
        >
          <X className="w-5 h-5 md:w-7 md:h-7 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full md:w-[400px] h-[400px] md:h-full">
        <LiveChat initialComments={stream.comments} />
      </div>
    </div>
  )
}
