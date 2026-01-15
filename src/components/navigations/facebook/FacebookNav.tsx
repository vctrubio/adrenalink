import { NavLeft, NavCenter, NavRight } from ".";

const FacebookNav = () => {
    return (
        <header className="sticky top-0 z-40 w-full bg-card border-t border-facebook/30 border-b border-facebook shadow-sm shadow-[0_-4px_6px_-1px_rgb(var(--secondary)/0.1)]">
            <div className="container flex h-14 md:h-16 items-center justify-between px-3 sm:px-6 lg:px-8 mx-auto">
                <NavLeft />
                <NavCenter />
                <NavRight />
            </div>
        </header>
    );
};

export default FacebookNav;
