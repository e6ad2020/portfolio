import { useState } from "react";
import { CanteenSimulator } from "./components/CanteenSimulator";
import { JuliaSimulator } from "./components/JuliaSimulator";
import { PowerMenuSimulator } from "./components/PowerMenuSimulator";
import { RtcSimulator } from "./components/RtcSimulator";
import { Interactive3DGrid } from "./components/Interactive3DGrid";
import {
	GitHubIcon,
	ExternalLinkIcon,
	CodeIcon,
	DatabaseIcon,
	TerminalIcon,
	EnvelopeIcon,
	ChevronDownIcon,
	SparklesIcon,
	TypeScriptLogoIcon,
	JavaScriptLogoIcon,
	HtmlCssLogoIcon,
	PythonLogoIcon,
	ReactLogoIcon,
	ViteLogoIcon,
	FramerLogoIcon,
	NodeLogoIcon,
	BunLogoIcon,
	WebSocketLogoIcon,
	JwtLogoIcon,
	LinuxLogoIcon,
	GitLogoIcon
} from "./assets/icons";
import "./App.css";

interface Project {
	id: string;
	title: string;
	tagline: string;
	description: string;
	stack: string[];
	license: string;
	role: string;
	githubUrl: string;
	simulator: React.ComponentType;
	icon: React.ComponentType<{ size?: number; className?: string }>;
}

function App() {
	const [activeDemo, setActiveDemo] = useState<string | null>(null);

	const techIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
		TypeScript: TypeScriptLogoIcon,
		JavaScript: JavaScriptLogoIcon,
		"HTML5 / CSS3": HtmlCssLogoIcon,
		Python: PythonLogoIcon,
		"Shell Scripting (Bash)": TerminalIcon,
		React: ReactLogoIcon,
		Vite: ViteLogoIcon,
		"Framer Motion": FramerLogoIcon,
		"Vanilla CSS System": HtmlCssLogoIcon,
		"Responsive Web Design": CodeIcon,
		"Node.js": NodeLogoIcon,
		Bun: BunLogoIcon,
		"WebSockets (ws)": WebSocketLogoIcon,
		"RESTful APIs": CodeIcon,
		"JWT Authentication": JwtLogoIcon,
		"Linux / Unix": LinuxLogoIcon,
		"Operating Systems (OS)": TerminalIcon,
		"Computer Networks": WebSocketLogoIcon,
		"IT Infrastructure": DatabaseIcon,
		"PostgreSQL / SQLite": DatabaseIcon,
		"Git & GitHub": GitLogoIcon
	};

	const renderSkillTag = (tech: string) => {
		const TechIcon = techIcons[tech] ?? CodeIcon;

		return (
			<span className="tag" key={tech}>
				<TechIcon size={15} className="tag-icon" />
				<span>{tech}</span>
			</span>
		);
	};

	const projects: Project[] = [
		{
			id: "canteen",
			title: "EVA Canteen",
			tagline: "Real-time Cafeteria Ordering & Management System",
			description:
				"A comprehensive dual-interface system designed to streamline canteen operations. It features a student ordering client and a real-time admin analytics dashboard connected via WebSockets, with built-in theme engines (10+ themes) and SQLite database persistence.",
			stack: ["Vanilla JS", "Node.js", "Express.js", "SQLite", "WebSockets (ws)", "Chart.js"],
			license: "GPL-3.0",
			role: "Lead Developer (Collaboration)",
			githubUrl: "https://github.com/e6ad2020/EVA_Canteen",
			simulator: CanteenSimulator,
			icon: CodeIcon
		},
		{
			id: "face",
			title: "Project Face (Julia)",
			tagline: "AI Real-Time Skincare Advisor Assistant",
			description:
				"An intelligent, real-time voice and text skincare advisor named Julia. Utilizes the Google Gemini Multimodal Live API via WebSockets/WebRTC to analyze users' skin types, answer skin health queries, and compile customized day/night skincare routines.",
			stack: ["React", "TypeScript", "Vite", "Google GenAI SDK", "Framer Motion", "Tailwind CSS"],
			license: "MIT",
			role: "Sole Creator",
			githubUrl: "https://github.com/e6ad2020/Project-Face",
			simulator: JuliaSimulator,
			icon: SparklesIcon
		},
		{
			id: "power",
			title: "Power Menu GNOME Extension",
			tagline: "Sleek Alt+F4 Shutdown Dialog for Linux",
			description:
				"A customized shell extension for GNOME that replaces the default system Alt+F4 behavior. When no windows are focused, it presents a highly-polished, keyboard-navigable power management dialogue for Shutdown, Restart, Suspend, and Log Out.",
			stack: ["GJS (Gnome JavaScript)", "GObject", "Shell CSS", "Linux Scripts"],
			license: "MIT",
			role: "Sole Creator",
			githubUrl: "https://github.com/e6ad2020/power-menu-gs-extension",
			simulator: PowerMenuSimulator,
			icon: TerminalIcon
		},
		{
			id: "rtc",
			title: "RTC Resala Participation System",
			tagline: "Charity Volunteer Management & Gamified Portal",
			description:
				"An automated tracking and registration portal created for the RTC Resala charity organization. Designed as a 'Sadqa Jaria' (continuous charity) to replace paper logs, offering volunteer profiles, gamified levels, thresholds, and a real-time leaderboard.",
			stack: ["React", "TypeScript", "Vite", "Supabase", "PostgreSQL", "Tailwind CSS"],
			license: "GPL-3.0",
			role: "Co-Developer (Collaboration with Omar)",
			githubUrl: "https://github.com/Omar-0O/RTC",
			simulator: RtcSimulator,
			icon: DatabaseIcon
		}
	];

	const toggleDemo = (id: string) => {
		if (activeDemo === id) {
			setActiveDemo(null);
		} else {
			setActiveDemo(id);
			// Smooth scroll to the demo container after it expands
			setTimeout(() => {
				const el = document.getElementById(`demo-panel-${id}`);
				if (el) {
					el.scrollIntoView({ behavior: "smooth", block: "nearest" });
				}
			}, 100);
		}
	};

	const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
		e.preventDefault();
		const el = document.getElementById(id);
		if (el) {
			const headerOffset = 80;
			const elementPosition = el.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.scrollY - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth"
			});
		}
	};

	return (
		<div className="portfolio-app">
			{/* Decorative background gradients */}
			<div className="bg-glow bg-glow-1"></div>
			<div className="bg-glow bg-glow-2"></div>
			<Interactive3DGrid />

			{/* Navigation Header */}
			<header className="portfolio-header">
				<div className="header-container">
					<a href="#" className="logo-text">
						<img src="/Logo.svg" alt="Logo" className="nav-logo-img" />
						<span>Eyad<span className="logo-accent">.Gaber</span></span>
					</a>
					<nav className="nav-links">
						<a href="#about" onClick={(e) => scrollToSection(e, "about")}>About</a>
						<a href="#skills" onClick={(e) => scrollToSection(e, "skills")}>Skills</a>
						<a href="#projects" onClick={(e) => scrollToSection(e, "projects")}>Projects</a>
						<a href="#contact" onClick={(e) => scrollToSection(e, "contact")}>Contact</a>
					</nav>
					<div className="header-actions">
						<a
							href="https://github.com/e6ad2020"
							target="_blank"
							rel="noopener noreferrer"
							className="icon-link-btn"
							aria-label="GitHub Profile"
						>
							<GitHubIcon size={20} />
						</a>
					</div>
				</div>
			</header>

			{/* Main Content Container */}
			<main className="portfolio-main">
				{/* Hero Section */}
				<section id="about" className="hero-section">
					<div className="hero-content">
						<span className="welcome-tag">Welcome to my Portfolio</span>
						<h1 className="hero-title">
							Building Robust Systems <br />
							&amp; Interactive Web Apps
						</h1>
						<p className="hero-description">
							I'm a <strong>Full Stack Engineer</strong> &amp; <strong>Systems Developer</strong>. I specialize in 
							<strong> Linux, Operating Systems, Computer Networks, and IT Infrastructure</strong>. 
							I design and implement efficient desktop utilities, AI-driven applications, and database platforms 
							that solve real-world problems. Check out my projects below and play with their live interactive sandboxes!
						</p>
						<div className="hero-actions">
							<a href="#projects" className="primary-btn" onClick={(e) => scrollToSection(e, "projects")}>
								Explore Projects
							</a>
							<a href="#contact" className="secondary-btn" onClick={(e) => scrollToSection(e, "contact")}>
								Get In Touch
							</a>
						</div>
					</div>
				</section>

				{/* Skills Section */}
				<section id="skills" className="skills-section">
					<h2 className="section-heading">My Tech Stack</h2>
					<p className="section-subheading">Tools, languages, and technologies I frequently use to build systems.</p>

					<div className="skills-grid">
						<div className="skills-card">
							<h3>Languages</h3>
							<div className="tags-container">
								{["TypeScript", "JavaScript", "HTML5 / CSS3", "Python", "Shell Scripting (Bash)"].map(renderSkillTag)}
							</div>
						</div>

						<div className="skills-card">
							<h3>Frontend</h3>
							<div className="tags-container">
								{["React", "Vite", "Framer Motion", "Vanilla CSS System", "Responsive Web Design"].map(renderSkillTag)}
							</div>
						</div>

						<div className="skills-card">
							<h3>Backend &amp; APIs</h3>
							<div className="tags-container">
								{["Node.js", "Bun", "WebSockets (ws)", "RESTful APIs", "JWT Authentication"].map(renderSkillTag)}
							</div>
						</div>

						<div className="skills-card">
							<h3>OS, Networks &amp; Systems</h3>
							<div className="tags-container">
								{["Linux / Unix", "Operating Systems (OS)", "Computer Networks", "IT Infrastructure", "PostgreSQL / SQLite", "Git & GitHub"].map(renderSkillTag)}
							</div>
						</div>
					</div>
				</section>

				{/* Projects Section */}
				<section id="projects" className="projects-section">
					<h2 className="section-heading">Featured Projects</h2>
					<p className="section-subheading">
						Playable sandboxes are available for each project. Click <strong>"Play Interactive Demo"</strong> to test them directly!
					</p>

					<div className="projects-list">
						{projects.map((project) => {
							const ProjIcon = project.icon;
							const SimulatorComp = project.simulator;
							const isDemoActive = activeDemo === project.id;

							return (
								<div
									key={project.id}
									className={`project-wrapper ${isDemoActive ? "demo-expanded" : ""}`}
								>
									{/* Main Project Card */}
									<div className="project-card">
										<div className="project-card-main">
											<div className="project-icon-box">
												<ProjIcon size={24} className="proj-icon" />
											</div>
											<div className="project-info">
												<div className="project-meta-top">
													<span className="project-role">{project.role}</span>
													<span className="project-license">License: {project.license}</span>
												</div>
												<h3 className="project-title">{project.title}</h3>
												<p className="project-tagline">{project.tagline}</p>
												<p className="project-desc">{project.description}</p>

												<div className="project-stack">
													{project.stack.map((tech) => (
														<span key={tech} className="stack-badge">
															{tech}
														</span>
													))}
												</div>
											</div>
										</div>

										<div className="project-actions-row">
											<a
												href={project.githubUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="github-link-btn"
											>
												<GitHubIcon size={16} />
												<span>GitHub Repository</span>
												<ExternalLinkIcon size={12} className="arrow-icon" />
											</a>
											<button
												onClick={() => toggleDemo(project.id)}
												className={`demo-toggle-btn ${isDemoActive ? "active" : ""}`}
											>
												<span>{isDemoActive ? "Close Sandbox" : "Play Interactive Demo"}</span>
												<ChevronDownIcon size={16} className="chevron" />
											</button>
										</div>
									</div>

									{/* Expandable Play Sandbox */}
									{isDemoActive && (
										<div id={`demo-panel-${project.id}`} className="demo-panel">
											<div className="demo-panel-header">
												<div className="demo-indicator">
													<span className="pulse-dot"></span>
													<span>Live Sandbox Environment</span>
												</div>
												<p className="demo-instructions">
													This is a simulated demonstration representing the core experience of {project.title}.
												</p>
											</div>
											<div className="demo-panel-body">
												<SimulatorComp />
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</section>

				{/* Contact Section */}
				<section id="contact" className="contact-section">
					<div className="contact-card">
						<div className="contact-glow"></div>
						<div className="contact-content">
							<EnvelopeIcon size={32} className="contact-mail-icon" />
							<h2>Let's Collaborate!</h2>
							<p>
								Have an interesting system utility, web application, or open-source project in mind? 
								Feel free to reach out. I'm always open to discussing new opportunities or helping with charity tech implementations.
							</p>
							<p className="contact-email-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-brand)", marginBottom: "24px" }}>
								eyad.dodo123456789@gmail.com
							</p>
							<div className="contact-actions">
								<a href="mailto:eyad.dodo123456789@gmail.com" className="mail-btn">
									<EnvelopeIcon size={16} />
									<span>Send an Email</span>
								</a>
								<a
									href="https://github.com/e6ad2020"
									target="_blank"
									rel="noopener noreferrer"
									className="github-profile-btn"
								>
									<GitHubIcon size={16} />
									<span>GitHub Profile</span>
								</a>
							</div>
						</div>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="portfolio-footer">
				<div className="footer-container">
					<p>&copy; 2026 Eyad Gaber. All rights reserved. | eyad.dodo123456789@gmail.com</p>
					<p className="footer-meta">
						Powered by React, Cloudflare Workers, and Vanilla CSS.
					</p>
				</div>
			</footer>
		</div>
	);
}

export default App;
