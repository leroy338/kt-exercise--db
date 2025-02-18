export function GridBackground() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-950">
      <div className="absolute h-full w-full bg-[linear-gradient(to_right,#4ade8015_1px,transparent_1px),linear-gradient(to_bottom,#4ade8015_1px,transparent_1px)] bg-[size:48px_56px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-full max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-500 to-emerald-700 opacity-10 blur-[100px]" />
      </div>
    </div>
  )
} 