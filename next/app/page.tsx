import { ModeToggle } from "@/components/mode-toggle";
import { RoomView } from "@/components/room-view";
import { RoomsList } from "@/components/rooms-list";
import { DeviceControls } from "@/components/device-controls";
import { SideNav } from "@/components/side-nav";
import { MobileNav } from "@/components/mobile-nav";
import { MobileHeader } from "@/components/mobile-header";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      {/* 移动端顶部导航 - 仅在小屏幕显示 */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <MobileHeader />
      </div>

      {/* 主卡片容器 - 四周留白 */}
      <div className="w-full max-w-[1400px] h-[calc(100vh-2rem)] mt-16 md:mt-0 bg-milk-white rounded-3xl overflow-hidden shadow-xl flex card-border">
        {/* 左侧小导航 - 仅在中等及以上屏幕显示 */}
        <div className="hidden md:block border-r border-milk-light">
          <SideNav />
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-milk-white">
          {/* 主视图区域 */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-milk-white rounded-xl">
            {/* 左侧大视图 */}
            <div className="md:col-span-2 h-full">
              <RoomView />
            </div>

            {/* 右侧房间列表 - 在小屏幕上隐藏 */}
            <div className="hidden md:block md:col-span-1 h-full">
              <RoomsList />
            </div>
          </div>

          {/* 底部区域 - 设备控制和数据分析 */}
          <div className="hidden md:block h-[280px] p-4 border-t border-milk-light overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <DeviceControls />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端底部导航 - 仅在小屏幕显示 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <MobileNav />
      </div>

      {/* 固定在右下角的主题切换按钮 */}
      <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        <ModeToggle />
      </div>
    </div>
  );
}
