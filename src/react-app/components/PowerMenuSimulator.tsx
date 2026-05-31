import React, { useState, useEffect, useRef } from "react";
import { MonitorIcon } from "../assets/icons";

interface Action {
	id: string;
	labelEn: string;
	labelAr: string;
	labelDe: string;
	icon: string;
	color: string;
}

export const PowerMenuSimulator: React.FC = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [language, setLanguage] = useState<"en" | "ar" | "de">("en");
	const [screenState, setScreenState] = useState<"desktop" | "shutdown" | "restart" | "suspend" | "logout">("desktop");
	const containerRef = useRef<HTMLDivElement>(null);

	const actions: Action[] = [
		{ id: "shutdown", labelEn: "Power Off", labelAr: "إيقاف التشغيل", labelDe: "Ausschalten", icon: "⏻", color: "#e63946" },
		{ id: "restart", labelEn: "Restart", labelAr: "إعادة التشغيل", labelDe: "Neustarten", icon: "⟲", color: "#f4a261" },
		{ id: "suspend", labelEn: "Suspend", labelAr: "سكون", labelDe: "Bereitschaft", icon: "🌙", color: "#457b9d" },
		{ id: "logout", labelEn: "Log Out", labelAr: "تسجيل الخروج", labelDe: "Abmelden", icon: "👤", color: "#2a9d8f" },
	];

	// Handle keydown for Alt+F4 capture inside container
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if (!isOpen) return;

			if (e.key === "Escape") {
				setIsOpen(false);
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % actions.length);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				setSelectedIndex((prev) => (prev - 1 + actions.length) % actions.length);
			} else if (e.key === "Enter") {
				e.preventDefault();
				triggerAction(actions[selectedIndex]);
			}
		};

		window.addEventListener("keydown", handleGlobalKeyDown);
		return () => {
			window.removeEventListener("keydown", handleGlobalKeyDown);
		};
	}, [isOpen, selectedIndex]);

	// Specific handler for Alt+F4 key combo
	useEffect(() => {
		const handleAltF4 = (e: KeyboardEvent) => {
			// Check if container contains the active element
			if (containerRef.current && containerRef.current.contains(document.activeElement)) {
				if (e.altKey && e.key === "F4") {
					e.preventDefault();
					setIsOpen(true);
				}
			}
		};

		window.addEventListener("keydown", handleAltF4);
		return () => {
			window.removeEventListener("keydown", handleAltF4);
		};
	}, []);

	const triggerAction = (action: Action) => {
		setIsOpen(false);
		setScreenState(action.id as any);

		setTimeout(() => {
			setScreenState("desktop");
		}, 3000);
	};

	const getTranslations = () => {
		switch (language) {
			case "ar":
				return {
					title: "قائمة الطاقة",
					desc: "اختر إجراء لتنفيذه على النظام",
					triggerBtn: "اضغط لتشغيل القائمة (Alt + F4)",
					statusText: "اضغط على Alt+F4 أو انقر فوق الزر لتشغيل القائمة. يمكنك استخدام الأسهم ولوحة المفاتيح للتنقل.",
					stateShutdown: "جاري إيقاف التشغيل...",
					stateRestart: "جاري إعادة التشغيل...",
					stateSuspend: "جاري الدخول في وضع السكون...",
					stateLogout: "جاري تسجيل الخروج..."
				};
			case "de":
				return {
					title: "Power-Menü",
					desc: "Wählen Sie eine Aktion aus",
					triggerBtn: "Klicken oder Alt+F4 drücken",
					statusText: "Drücken Sie Alt+F4 oder klicken Sie auf die Schaltfläche. Verwenden Sie die Pfeiltasten zur Navigation.",
					stateShutdown: "System wird heruntergefahren...",
					stateRestart: "System wird neu gestartet...",
					stateSuspend: "System geht in den Ruhezustand...",
					stateLogout: "Benutzer wird abgemeldet..."
				};
			default:
				return {
					title: "Power Menu",
					desc: "Select an action to perform",
					triggerBtn: "Trigger Power Menu (Alt + F4)",
					statusText: "Focus this area & press Alt+F4, or click the button. Use arrow keys + Enter to navigate.",
					stateShutdown: "Shutting down...",
					stateRestart: "Restarting system...",
					stateSuspend: "Entering sleep mode...",
					stateLogout: "Logging out user..."
				};
		}
	};

	const t = getTranslations();

	return (
		<div
			ref={containerRef}
			className="power-menu-simulator-container"
			tabIndex={0} // Allows keyboard focus
		>
			{/* Simulator Screen */}
			<div className={`desktop-screen state-${screenState}`}>
				{/* Top Panel (Gnome style) */}
				<div className="gnome-top-panel">
					<div className="left-panel">
						<span className="app-menu-btn">Activities</span>
					</div>
					<div className="center-panel">
						<span className="clock">May 31, 23:18</span>
					</div>
					<div className="right-panel">
						<span className="status-icons">📶 🔋 98% ⚙️</span>
						{/* Language Toggle in top bar */}
						<div className="lang-selector-gnome">
							<button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
							<button className={language === "ar" ? "active" : ""} onClick={() => setLanguage("ar")}>AR</button>
							<button className={language === "de" ? "active" : ""} onClick={() => setLanguage("de")}>DE</button>
						</div>
					</div>
				</div>

				{/* Desktop Area */}
				<div className="desktop-area">
					{screenState === "desktop" ? (
						<div className="desktop-content">
							<MonitorIcon size={64} className="desktop-icon-main" />
							<h2>GNOME Shell Desktop</h2>
							<p className="desktop-tip">{t.statusText}</p>
							<button className="trigger-altf4-btn" onClick={() => setIsOpen(true)}>
								{t.triggerBtn}
							</button>
						</div>
					) : (
						<div className="black-screen-overlay">
							<div className="shutdown-loader">
								<div className="spinner"></div>
								<p>{screenState === "shutdown" ? t.stateShutdown : 
								   screenState === "restart" ? t.stateRestart : 
								   screenState === "suspend" ? t.stateSuspend : t.stateLogout}</p>
							</div>
						</div>
					)}
				</div>

				{/* Floating GNOME Dialog */}
				{isOpen && (
					<div className="gnome-dialog-overlay" onClick={() => setIsOpen(false)}>
						<div 
							className="gnome-power-dialog"
							onClick={(e) => e.stopPropagation()} // Prevent closing when clicking dialog itself
						>
							<div className="dialog-header">
								<h3>{t.title}</h3>
								<p>{t.desc}</p>
							</div>

							<div className="dialog-actions-row">
								{actions.map((action, idx) => (
									<button
										key={action.id}
										className={`action-btn-gnome ${selectedIndex === idx ? "focused" : ""}`}
										onMouseEnter={() => setSelectedIndex(idx)}
										onClick={() => triggerAction(action)}
									>
										<div className="icon-circle" style={{ backgroundColor: action.color }}>
											{action.icon}
										</div>
										<span className="action-label">
											{language === "en" ? action.labelEn : 
											 language === "ar" ? action.labelAr : action.labelDe}
										</span>
									</button>
								))}
							</div>

							<div className="dialog-footer">
								<button className="cancel-btn" onClick={() => setIsOpen(false)}>
									{language === "ar" ? "إلغاء" : language === "de" ? "Abbrechen" : "Cancel"}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
