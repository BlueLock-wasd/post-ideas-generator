export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b16] via-[#0a1020] to-[#070b16]" />

      <div className="absolute top-[-10%] left-[5%] h-[600px] w-[600px] rounded-full bg-teal-500/20 blur-[150px] animate-float-slow" />
      <div className="absolute top-[15%] right-[0%] h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px] animate-float-medium" />
      <div className="absolute bottom-[5%] left-[15%] h-[550px] w-[550px] rounded-full bg-blue-500/15 blur-[140px] animate-float-fast" />
      <div className="absolute bottom-[-10%] right-[10%] h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px] animate-float-slow" />

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,22,0.85)_100%)]" />
    </div>
  );
}
