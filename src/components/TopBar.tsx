import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FaBarsStaggered } from "react-icons/fa6";

export function TopBar() {
  return (
    <div className="relative flex items-center justify-center p-2 text-white h-14">
      <div className="absolute left-4 flex items-center gap-3">
        <div className="bg-white/20 rounded-full p-2">
          <FaArrowLeft className="w-4 h-4" />
        </div>
        <h1 className="text-base">『타이탄의 도구들』 인사이트</h1>
      </div>
      <div className="absolute right-4">
        <button className="flex items-center space-x-2 rounded-full px-3.5 py-1.5 bg-white/20">
          <FaBarsStaggered className="w-[14px] h-[14px]" />
          <span className="text-sm">목차</span>
        </button>
      </div>
    </div>
  );
}
