import { NavLeft, NavCenter, NavRight } from "./facebook";

const FacebookNav = () => {
    return (
        <header className="sticky top-0 z-40 w-full bg-card border-b border-facebook shadow-sm">
            <div className="container flex h-14 md:h-16 items-center justify-between px-3 sm:px-6 lg:px-8 mx-auto">
                <NavLeft />
                <NavCenter />
                <NavRight />
            </div>
        </header>
    );
};

export default FacebookNav;
