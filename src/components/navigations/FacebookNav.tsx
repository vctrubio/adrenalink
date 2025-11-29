import { NavLeft } from "./facebook/NavLeft";
import { NavCenter } from "./facebook/NavCenter";
import { NavRight } from "./facebook/NavRight";

const FacebookNav = () => {
    return (
        <header className="sticky top-0 z-40 w-full bg-facebook border-b border-facebook shadow-sm">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">
                <NavLeft />
                <NavCenter />
                <NavRight />
            </div>
        </header>
    );
};

export default FacebookNav;
