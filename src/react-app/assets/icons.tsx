import React from "react";

interface IconProps {
	size?: number;
	className?: string;
	onClick?: () => void;
}

const TechSvg: React.FC<IconProps & { children: React.ReactNode; fill?: string }> = ({
	size = 18,
	className,
	children,
	fill = "none"
}) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill={fill}
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		aria-hidden="true"
	>
		{children}
	</svg>
);

export const TypeScriptLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<rect x="3" y="3" width="18" height="18" rx="2" />
		<path d="M7 8h6" />
		<path d="M10 8v8" />
		<path d="M14 15c.8.7 2.7.8 3.2-.1.4-.8-.1-1.5-1.5-1.9-1.4-.4-1.9-1.2-1.4-2 .5-.9 2.1-1 3-.3" />
	</TechSvg>
);

export const JavaScriptLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<rect x="3" y="3" width="18" height="18" rx="2" />
		<path d="M8 9v5.2c0 1.5-.9 2-2.1 1.4" />
		<path d="M13 15c.8.7 2.7.8 3.2-.1.4-.8-.1-1.5-1.5-1.9-1.4-.4-1.9-1.2-1.4-2 .5-.9 2.1-1 3-.3" />
	</TechSvg>
);

export const HtmlCssLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M5 3h14l-1.2 15.2L12 21l-5.8-2.8L5 3Z" />
		<path d="M9 8h6" />
		<path d="M8.5 12h7l-.4 3.6L12 17l-3.1-1.4" />
	</TechSvg>
);

export const PythonLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M12 3h3.2A3.8 3.8 0 0 1 19 6.8V10H8.8A3.8 3.8 0 0 0 5 13.8V15" />
		<path d="M12 21H8.8A3.8 3.8 0 0 1 5 17.2V14h10.2A3.8 3.8 0 0 0 19 10.2V9" />
		<circle cx="14.5" cy="6.5" r=".6" fill="currentColor" stroke="none" />
		<circle cx="9.5" cy="17.5" r=".6" fill="currentColor" stroke="none" />
	</TechSvg>
);

export const ReactLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<ellipse cx="12" cy="12" rx="9" ry="3.7" />
		<ellipse cx="12" cy="12" rx="9" ry="3.7" transform="rotate(60 12 12)" />
		<ellipse cx="12" cy="12" rx="9" ry="3.7" transform="rotate(120 12 12)" />
		<circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
	</TechSvg>
);

export const ViteLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M4 4.5 12 20l8-15.5-7.2 1.3L12 3 11.2 5.8 4 4.5Z" />
		<path d="m12 8-2.2 4h3L11.6 16 16 10h-3l1-2h-2Z" />
	</TechSvg>
);

export const FramerLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M6 3h12v6H6V3Z" />
		<path d="M6 9h12l-6 6H6V9Z" />
		<path d="M6 15h6v6l-6-6Z" />
	</TechSvg>
);

export const NodeLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
		<path d="M9 15V9l6 6V9" />
	</TechSvg>
);

export const ExpressLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M4 16V8h6" />
		<path d="M4 12h5" />
		<path d="m13 9 7 7" />
		<path d="m20 9-7 7" />
	</TechSvg>
);

export const HonoLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M12 3c3.4 3.4 6 6.2 6 10a6 6 0 0 1-12 0c0-2.5 1.3-4.3 3.1-6.2.2 2.4 1.7 3.6 2.9 4.2V3Z" />
		<path d="M9.5 15a2.5 2.5 0 0 0 5 0c0-1.6-1.1-2.7-2.5-4-1.4 1.3-2.5 2.4-2.5 4Z" />
	</TechSvg>
);

export const BunLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M4.5 11.7C4.5 7.5 7.9 4.8 12 4.8s7.5 2.7 7.5 6.9c0 4.4-3.1 7.5-7.5 7.5s-7.5-3.1-7.5-7.5Z" />
		<path d="M7.6 7.2 5.7 5.1" />
		<path d="M10 6 9.2 3.5" />
		<path d="M14 6l.8-2.5" />
		<path d="M16.4 7.2l1.9-2.1" />
		<circle cx="9.2" cy="12" r=".6" fill="currentColor" stroke="none" />
		<circle cx="14.8" cy="12" r=".6" fill="currentColor" stroke="none" />
		<path d="M10 15c1.1.7 2.9.7 4 0" />
	</TechSvg>
);

export const WebSocketLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M7 7h5l5 5-5 5H7l5-5-5-5Z" />
		<path d="M4 12h8" />
		<path d="M16 8h4v8h-4" />
	</TechSvg>
);

export const JwtLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M12 3v18" />
		<path d="M3 12h18" />
		<path d="m5.6 5.6 12.8 12.8" />
		<path d="m18.4 5.6-12.8 12.8" />
		<circle cx="12" cy="12" r="2.5" />
	</TechSvg>
);

export const LinuxLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M12 3c-2 0-3.4 1.6-3.4 4.1 0 1.5-.4 2.4-1.3 3.8-.8 1.2-1.8 2.9-1.8 5.1 0 3.1 2.7 5 6.5 5s6.5-1.9 6.5-5c0-2.2-1-3.9-1.8-5.1-.9-1.4-1.3-2.3-1.3-3.8C15.4 4.6 14 3 12 3Z" />
		<circle cx="10.5" cy="7.3" r=".5" fill="currentColor" stroke="none" />
		<circle cx="13.5" cy="7.3" r=".5" fill="currentColor" stroke="none" />
		<path d="M10 11h4" />
	</TechSvg>
);

export const GitLogoIcon: React.FC<IconProps> = (props) => (
	<TechSvg {...props}>
		<path d="M12 2.8 21.2 12 12 21.2 2.8 12 12 2.8Z" />
		<path d="M8.5 8.5 15.5 15.5" />
		<path d="M8.5 8.5h5" />
		<circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
		<circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
		<circle cx="13.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
	</TechSvg>
);

export const GitHubIcon: React.FC<IconProps> = ({ size = 20, className, onClick }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		onClick={onClick}
	>
		<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
		<path d="M9 18c-4.51 2-5-2-7-2" />
	</svg>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ size = 18, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M15 3h6v6" />
		<path d="M10 14 21 3" />
		<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
	</svg>
);

export const CodeIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<polyline points="16 18 22 12 16 6" />
		<polyline points="8 6 2 12 8 18" />
	</svg>
);

export const DatabaseIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<ellipse cx="12" cy="5" rx="9" ry="3" />
		<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
		<path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
	</svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<polyline points="4 17 10 11 4 5" />
		<line x1="12" x2="20" y1="19" y2="19" />
	</svg>
);

export const ShoppingCartIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<circle cx="8" cy="21" r="1" />
		<circle cx="19" cy="21" r="1" />
		<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
	</svg>
);

export const MessageSquareIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
	</svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
		<path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
		<path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
	</svg>
);

export const UsersIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
		<path d="M16 3.13a4 4 0 0 1 0 7.75" />
	</svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
		<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
		<path d="M4 22h16" />
		<path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
		<path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
	</svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<circle cx="12" cy="12" r="3" />
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
	</svg>
);

export const PowerIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
		<line x1="12" x2="12" y1="2" y2="12" />
	</svg>
);

export const MonitorIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
		<line x1="8" x2="16" y1="21" y2="21" />
		<line x1="12" x2="12" y1="17" y2="21" />
	</svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<polyline points="6 9 12 15 18 9" />
	</svg>
);

export const EnvelopeIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
		<polyline points="22,6 12,13 2,6" />
	</svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<circle cx="11" cy="11" r="8" />
		<line x1="21" x2="16.65" y1="21" y2="16.65" />
	</svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<polygon points="5 3 19 12 5 21 5 3" />
	</svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<polyline points="20 6 9 17 4 12" />
	</svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
	</svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 20, className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<polyline points="3 6 5 6 21 6" />
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
		<line x1="10" x2="10" y1="11" y2="17" />
		<line x1="14" x2="14" y1="11" y2="17" />
	</svg>
);
