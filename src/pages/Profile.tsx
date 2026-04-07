export function Profile() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">Profile</h1>
      <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_0_#7B5EA714] text-center">
        <div className="w-16 h-16 rounded-full bg-[#EEE0FF] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-[#7B5EA7]">M</span>
        </div>
        <h2 className="font-display font-bold text-lg text-[#2D1F3D]">Marta</h2>
        <p className="text-sm text-[#7A6775] mt-1">marta@email.com</p>
        <p className="text-sm text-[#7A6775] mt-6">Auth coming in Phase 2.</p>
      </div>
    </div>
  )
}
