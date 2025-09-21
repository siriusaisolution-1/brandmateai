export function SocialProofBar() {
    return (
        <section className="py-8 text-center bg-muted/20">
            <div className="container">
                <p className="text-sm uppercase text-muted-foreground tracking-widest">
                TRUSTED BY 100+ BRANDS, AGENCIES & CREATORS
                </p>
                {/* In a real app, you would map over an array of logos here */}
                <div className="mt-4 flex justify-center items-center gap-8 opacity-60">
                    <p>Logo 1</p>
                    <p>Logo 2</p>
                    <p>Logo 3</p>
                    <p>Logo 4</p>
                </div>
            </div>
        </section>
    );
}
