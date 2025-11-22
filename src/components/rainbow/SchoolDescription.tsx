const WELCOME_FORM_LINK = "/welcome";

export const SchoolDescription = () => {
	return (
		<p className="text-lg leading-relaxed text-white/90">
			Sign up via the{" "}
			<a href={WELCOME_FORM_LINK} className="font-bold text-white underline hover:text-white/80 transition-colors">
				Welcome Form
			</a>
			. Register your <span className="font-semibold">Instagram</span>, <span className="font-semibold">website</span>, contact details and <span className="font-semibold">googlePlaceId</span> so we can boost your X. We provide you with a subdomain within us, where you will have your own <span className="font-bold">personal space</span>. Make sure to add an Icon and Banner for style.{" "}
			<span className="font-bold text-yellow-300">Usernames, or subdomains, are unique, so first come first serve</span>. What are you waiting for, begin your journey with us{" "}
			<a href={WELCOME_FORM_LINK} className="font-bold text-white underline hover:text-white/80 transition-colors">
				here
			</a>
			.
		</p>
	);
};
