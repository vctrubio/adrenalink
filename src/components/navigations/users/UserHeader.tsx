import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface UserHeaderProps {
	firstName: string;
	lastName: string;
}

export default function UserHeader({ firstName, lastName }: UserHeaderProps) {
	return (
		<div className="relative w-full bg-background border-b border-border">
			<div className="container mx-auto px-6 py-8">
				<div className="flex items-center gap-6">
					{/* User Avatar Icon */}
					<div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg bg-primary flex items-center justify-center">
						<AdranlinkIcon className="text-primary-foreground" size={48} />
					</div>

					{/* User Name */}
					<div>
						<h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
							{firstName} {lastName}
						</h1>
					</div>
				</div>
			</div>
		</div>
	);
}
