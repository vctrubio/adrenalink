import Link from "next/link";

export interface DropdownItemProps {
	id?: string;
	label?: string;
	icon: React.ComponentType<any>;
	color?: string;
	description?: string;
	href?: string;
	onClick?: () => void;
	active?: boolean;
	variant?: "dropdown" | "nav";
}

export function DropdownItem({
	item,
	onClose,
	variant = "dropdown",
}: {
	item: DropdownItemProps;
	onClose?: () => void;
	variant?: "dropdown" | "nav";
}) {
	const Icon = item.icon;
	const isNav = variant === "nav" || item.variant === "nav";

	const handleClick = () => {
		item.onClick?.();
		onClose?.();
	};

	const baseClasses = isNav
		? `relative flex h-14 w-24 items-center justify-center text-muted-foreground transition-colors hover:bg-accent rounded-lg ${
				item.active ? "text-primary" : ""
			}`
		: "flex items-center gap-3 px-3 py-2.5 w-full text-left transition-colors cursor-pointer";

	const navContent = (
		<>
			<Icon className={`h-7 w-7 ${item.active ? "text-primary" : "text-muted-foreground"}`} />
			{item.active && <div className="absolute bottom-0 h-1 w-full bg-primary" />}
		</>
	);

	const dropdownContent = (
		<>
			{Icon && (
				<div
					style={item.color ? { color: item.color } : undefined}
					className="flex-shrink-0"
				>
					<Icon className="w-4 h-4" />
				</div>
			)}
			<div className="flex-1 min-w-0">
				<div className="text-sm font-medium text-foreground">{item.label}</div>
				{item.description && (
					<div className="text-xs text-muted-foreground mt-0.5">
						{item.description}
					</div>
				)}
			</div>
		</>
	);

	const content = isNav ? navContent : dropdownContent;

	const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
		if (isNav) return;
		if (item.color) {
			e.currentTarget.style.backgroundColor = `${item.color}15`;
		} else {
			e.currentTarget.style.backgroundColor = "rgb(var(--accent) / 0.5)";
		}
	};

	const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
		if (isNav) return;
		e.currentTarget.style.backgroundColor = "transparent";
	};

	if (item.href) {
		return (
			<Link
				href={item.href}
				onClick={handleClick}
				className={baseClasses}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{content}
			</Link>
		);
	}

	return (
		<button
			onClick={handleClick}
			className={baseClasses}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{content}
		</button>
	);
}

