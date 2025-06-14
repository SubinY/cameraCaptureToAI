import { ModeToggle } from "@/components/common/mode-toggle";
import { RoomView } from "@/components/camera/room-view";
import { HistoryCard } from "@/components/analysis/history-card";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-2 sm:p-4">
      {/* 主卡片容器 - 四周留白 */}
      <div className="w-full max-w-[1400px] h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] bg-milk-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl flex card-border">
        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-milk-white">
          {/* 主视图区域 - 自适应高度 */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3 p-2 sm:p-3 bg-milk-white rounded-xl">
            {/* 左侧大视图 - 固定最小高度 */}
            <div className="md:col-span-3 h-full min-h-[300px] sm:min-h-[400px]">
              <RoomView />
            </div>

            {/* 右侧历史记录 - 自适应宽高，带滚动条 */}
            <div className="hidden md:block md:col-span-1 h-full overflow-hidden">
              <HistoryCard className="h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 固定在右下角的主题切换按钮 */}
      <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        <ModeToggle />
      </div>
    </div>
  );
} 