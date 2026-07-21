export default function LogoLayoutSkeleton() {
  return (
    <div className="flex h-svh w-full items-center justify-center bg-[#FFF] dark:bg-black">
      <div className="relative flex items-center justify-center">
        {/* Soft expanding rings */}
        <span
          aria-hidden
          className="absolute size-28 rounded-full border border-green-800/20 dark:border-green-500/20 animate-[logo-ring_2.4s_ease-out_infinite]"
        />
        <span
          aria-hidden
          className="absolute size-28 rounded-full border border-green-800/15 dark:border-green-500/15 animate-[logo-ring_2.4s_ease-out_infinite] [animation-delay:0.8s]"
        />

        {/* Spinning accent arc */}
        <span
          aria-hidden
          className="absolute size-24 rounded-full border-2 border-transparent border-t-green-800 dark:border-t-green-500 animate-spin [animation-duration:1.1s]"
        />

        {/* Logo — gentle breathe, not a full spin */}
        <div className="relative z-10 animate-[logo-breathe_2.2s_ease-in-out_infinite]">
          <img
            src="/assets/darkFxRebate-logo.svg"
            alt="FXREBATE"
            className="h-10 w-auto dark:hidden"
          />
          <img
            src="/assets/lightFxRebate-logo.svg"
            alt="FXREBATE"
            className="hidden h-10 w-auto dark:block"
          />
        </div>
      </div>

      <style>{`
        @keyframes logo-breathe {
          0%, 100% { opacity: 0.72; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes logo-ring {
          0% { transform: scale(0.85); opacity: 0.55; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
