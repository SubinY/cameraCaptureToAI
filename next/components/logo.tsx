export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-tech-gradient rounded-lg animate-pulse-subtle"></div>
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">智</div>
      </div>
      <span className="text-xl font-bold bg-clip-text text-transparent bg-tech-gradient">智能家居</span>
    </div>
  )
}

