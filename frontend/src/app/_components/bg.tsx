export function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(52, 211, 153, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52, 211, 153, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px"
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(52, 211, 153, 0.10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52, 211, 153, 0.10) 1px, transparent 1px)
          `,
          backgroundSize: "200px 200px"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5" />
      <div className="absolute inset-0 bg-gradient-to-tl from-emerald-500/10 via-transparent to-transparent" />
    </div>
  )
}
