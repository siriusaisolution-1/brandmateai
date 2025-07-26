'use client';

// ... (imports are unchanged)

export function AppTopbar() {
    const { data: user } = useUser();

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            {/* ... (Sheet for mobile is unchanged) */}
            
            <div className="w-full flex-1">
                {/* Search button that will trigger the command palette */}
                <form>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search brands or actions... (⌘+K)"
                            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                            // This input is for show, the real logic is in the palette
                            onFocus={(e) => e.target.blur()} // Prevent typing
                        />
                    </div>
                </form>
            </div>

            {/* ... (Notifications and User Menu are unchanged) */}
        </header>
    );
}
