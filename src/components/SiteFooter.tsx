export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          Made by
          <a href="https://github.com/Sokanon" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-foreground">
            <img src="https://avatars.githubusercontent.com/u/53493508?v=4" alt="So" className="h-4 w-4 rounded-full" />
            <span className="hand-underline">So</span>
          </a>
          from
          <a href="https://gamified.studio" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-foreground">
            <img src="https://avatars.githubusercontent.com/u/164414310?v=4" alt="Gamified Studio" className="h-4 w-4 rounded-full" />
            <span className="hand-underline">Gamified.studio</span>
          </a>
        </span>
        <a href="https://railway.com?referralCode=_xv-mn" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 text-foreground">
          <img src="https://avatars.githubusercontent.com/u/66716858?s=200&v=4" alt="Railway" className="h-4 w-4 rounded-full" />
          <span className="hand-underline">Deployed on Railway</span>
        </a>
      </div>
    </footer>
  );
}
