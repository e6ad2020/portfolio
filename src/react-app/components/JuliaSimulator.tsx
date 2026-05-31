import React, { useState, useEffect, useRef } from "react";
import { SparklesIcon, UsersIcon } from "../assets/icons";

interface Message {
	sender: "user" | "julia";
	text: string;
	time: string;
}

interface RoutineStep {
	stepName: string;
	productType: string;
	details: string;
}

export const JuliaSimulator: React.FC = () => {
	const [step, setStep] = useState<"welcome" | "gender" | "wizard" | "chat">("welcome");
	const [wizardStep, setWizardStep] = useState<number>(0);
	const [skinType, setSkinType] = useState<string>("");
	const [mainConcern, setMainConcern] = useState<string>("");
	const [routine, setRoutine] = useState<RoutineStep[] | null>(null);

	const [isJuliaSpeaking, setIsJuliaSpeaking] = useState<boolean>(false);
	const [isJuliaThinking, setIsJuliaThinking] = useState<boolean>(false);
	const [chatMessages, setChatMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState<string>("");

	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [chatMessages, isJuliaSpeaking, isJuliaThinking]);

	// Simulate Julia speaking voice waves and printing text
	const juliaSpeak = (text: string) => {
		setIsJuliaThinking(true);
		setIsJuliaSpeaking(false);

		setTimeout(() => {
			setIsJuliaThinking(false);
			setIsJuliaSpeaking(true);
			setChatMessages((prev) => [
				...prev,
				{
					sender: "julia",
					text,
					time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				},
			]);

			// Speak for 3.5 seconds
			setTimeout(() => {
				setIsJuliaSpeaking(false);
			}, 4000);
		}, 1000);
	};

	const startChat = () => {
		setStep("gender");
	};

	const selectGender = () => {
		setStep("wizard");
		setWizardStep(1);
	};

	const handleWizardNext = () => {
		if (wizardStep === 1) {
			setWizardStep(2);
		} else if (wizardStep === 2) {
			generateRoutine();
		}
	};

	const generateRoutine = () => {
		setIsJuliaThinking(true);
		setTimeout(() => {
			setIsJuliaThinking(false);
			let generated: RoutineStep[] = [];

			if (skinType === "Oily") {
				generated = [
					{ stepName: "Cleanse (AM/PM)", productType: "Salicylic Acid Cleanser", details: "Removes excess sebum, deep cleans pores without stripping moisture." },
					{ stepName: "Treat (PM)", productType: "Niacinamide 10% Serum", details: "Regulates sebum production, minimizes pore appearance and refines skin texture." },
					{ stepName: "Moisturize (AM/PM)", productType: "Lightweight Gel Hydrator", details: "Oil-free, hyaluronic-based hydration that absorbs instantly." },
					{ stepName: "Protect (AM)", productType: "Mattifying SPF 50+", details: "Protects against UV damage with a dry-touch, non-greasy finish." }
				];
			} else if (skinType === "Dry") {
				generated = [
					{ stepName: "Cleanse (AM/PM)", productType: "Hydrating Cream Cleanser", details: "Gently removes impurities while preserving the lipid skin barrier." },
					{ stepName: "Treat (AM/PM)", productType: "Hyaluronic Acid & Panthenol", details: "Draws moisture into deep skin layers and plumps up fine lines." },
					{ stepName: "Moisturize (AM/PM)", productType: "Ceramide Rich Barrier Cream", details: "Replenishes natural lipids, locking in hydration all day." },
					{ stepName: "Protect (AM)", productType: "Dewy Finish Sun Cream SPF 50", details: "Broad spectrum sun shield with nourishing oils for a luminous glow." }
				];
			} else {
				// Sensitive / Combination
				generated = [
					{ stepName: "Cleanse (AM/PM)", productType: "Gentle Centella Cleanser", details: "Soothing pH-balanced formula that calms redness." },
					{ stepName: "Treat (PM)", productType: "AHA/BHA Exfoliating Toner", details: "Gently sweeps away dead cells on dry areas while unclogging the T-zone (2x a week)." },
					{ stepName: "Moisturize (AM/PM)", productType: "Cica Soothing Cream", details: "Repairs sensitive skin barriers and balances hydration." },
					{ stepName: "Protect (AM)", productType: "Physical Mineral Sunscreen", details: "Zinc-oxide based protection that won't irritate reactive skin." }
				];
			}

			setRoutine(generated);
			setStep("chat");
			setChatMessages([
				{
					sender: "julia",
					text: `Hi! Based on your skin type (${skinType}) and concern (${mainConcern}), I have curated a personalized skincare routine for you. You can review it below or ask me any questions about these products!`,
					time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				}
			]);
		}, 1500);
	};

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputText.trim()) return;

		const userMsg = inputText;
		setChatMessages((prev) => [
			...prev,
			{
				sender: "user",
				text: userMsg,
				time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			},
		]);
		setInputText("");

		// Simple rule-based chatbot simulated response
		let reply = "I understand. To address this, make sure to drink plenty of water and apply moisturizer on damp skin. Would you like me to adjust your routine?";
		const msgLower = userMsg.toLowerCase();
		if (msgLower.includes("acne") || msgLower.includes("pimple")) {
			reply = "For acne flare-ups, I recommend incorporating a gentle Salicylic Acid (BHA) wash and applying a spot treatment with Benzoyl Peroxide or Tea Tree Oil. Avoid picking at them!";
		} else if (msgLower.includes("sun") || msgLower.includes("spf") || msgLower.includes("sunscreen")) {
			reply = "Sunscreen is the absolute most important step! Apply 2 finger lengths of SPF 50 every morning, and reapply every 2 hours if you are outdoors. It prevents premature aging and dark spots.";
		} else if (msgLower.includes("morning") || msgLower.includes("night") || msgLower.includes("when")) {
			reply = "Cleanser and moisturizer should be used both AM and PM. Serums like Vitamin C are best in the morning (under sunscreen), whereas retinoids and peeling acids should only be used at night.";
		} else if (msgLower.includes("thank") || msgLower.includes("thanks")) {
			reply = "You are so welcome! Taking care of your skin is a form of self-care. Let me know if you need anything else! 🤍";
		}

		juliaSpeak(reply);
	};

	return (
		<div className="julia-container">
			{/* Left side - Julia visualizer */}
			<div className="julia-visualizer">
				<div className="julia-avatar-box">
					<div className={`julia-glow ${isJuliaSpeaking ? "speaking" : ""} ${isJuliaThinking ? "thinking" : ""}`}></div>
					<div className={`julia-avatar-circle ${isJuliaSpeaking ? "active" : ""}`}>
						<span className="avatar-letter">J</span>
					</div>
					{/* Voice Wave Animation */}
					{isJuliaSpeaking && (
						<div className="voice-waves">
							<div className="wave wave-1"></div>
							<div className="wave wave-2"></div>
							<div className="wave wave-3"></div>
							<div className="wave wave-4"></div>
							<div className="wave wave-5"></div>
						</div>
					)}
					{isJuliaThinking && (
						<div className="thinking-dots">
							<span></span>
							<span></span>
							<span></span>
						</div>
					)}
				</div>
				<div className="julia-voice-status">
					<h3>Julia</h3>
					<p className="status-label">
						{isJuliaSpeaking ? "Speaking..." : isJuliaThinking ? "Thinking..." : "Listening (Live Connected)"}
					</p>
				</div>

				<div className="visualizer-info">
					<SparklesIcon size={16} className="text-pink" />
					<span>Gemini Multimodal Live API via WebRTC</span>
				</div>
			</div>

			{/* Right side - Interaction screen */}
			<div className="julia-screen">
				{step === "welcome" && (
					<div className="welcome-step">
						<SparklesIcon size={40} className="step-icon text-purple" />
						<h2>Meet Julia, your Skincare Advisor</h2>
						<p>
							An AI-powered voice assistant capable of analyzing skin types, addressing skincare concerns, and building routines.
						</p>
						<button className="start-btn" onClick={startChat}>
							Get Started
						</button>
					</div>
				)}

				{step === "gender" && (
					<div className="gender-step">
						<UsersIcon size={40} className="step-icon text-blue" />
						<h2>Select your profile</h2>
						<p>Julia customizes recommendations based on skincare demographics.</p>
						<div className="gender-options">
							<button className="gender-btn male" onClick={() => selectGender()}>
								<span className="gender-icon">👨</span>
								<span>Gentleman</span>
							</button>
							<button className="gender-btn female" onClick={() => selectGender()}>
								<span className="gender-icon">👩</span>
								<span>Lady</span>
							</button>
						</div>
					</div>
				)}

				{step === "wizard" && (
					<div className="wizard-step">
						{wizardStep === 1 ? (
							<div className="wizard-question">
								<span className="step-indicator">Question 1 of 2</span>
								<h2>What is your skin type?</h2>
								<div className="wizard-options">
									{["Oily", "Dry", "Combination / Sensitive"].map((type) => (
										<button
											key={type}
											className={`wizard-opt-btn ${skinType === type ? "selected" : ""}`}
											onClick={() => setSkinType(type)}
										>
											{type}
										</button>
									))}
								</div>
								<button
									className="wizard-next-btn"
									onClick={handleWizardNext}
									disabled={!skinType}
								>
									Next
								</button>
							</div>
						) : (
							<div className="wizard-question">
								<span className="step-indicator">Question 2 of 2</span>
								<h2>What is your main skin concern?</h2>
								<div className="wizard-options">
									{["Acne & Clogged Pores", "Dryness & Flaking", "Redness & Sensitivity", "Aging & Fine Lines"].map((concern) => (
										<button
											key={concern}
											className={`wizard-opt-btn ${mainConcern === concern ? "selected" : ""}`}
											onClick={() => setMainConcern(concern)}
										>
											{concern}
										</button>
									))}
								</div>
								<button
									className="wizard-next-btn"
									onClick={handleWizardNext}
									disabled={!mainConcern}
								>
									Generate Routine
								</button>
							</div>
						)}
					</div>
				)}

				{step === "chat" && (
					<div className="chat-interface">
						{/* Chat messages */}
						<div className="chat-messages-container">
							{chatMessages.map((msg, index) => (
								<div key={index} className={`chat-bubble-row ${msg.sender}`}>
									<div className="chat-bubble">
										<p>{msg.text}</p>
										<span className="time">{msg.time}</span>
									</div>
								</div>
							))}
							{isJuliaThinking && (
								<div className="chat-bubble-row julia">
									<div className="chat-bubble typing">
										<div className="typing-indicator">
											<span></span>
											<span></span>
											<span></span>
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Routine Display */}
						{routine && (
							<div className="routine-panel">
								<h4 className="routine-title">
									<SparklesIcon size={14} /> My Custom Skincare Routine
								</h4>
								<div className="routine-steps">
									{routine.map((item, idx) => (
										<div key={idx} className="routine-step-card">
											<div className="step-number">{idx + 1}</div>
											<div className="step-content">
												<h5>{item.stepName}</h5>
												<span className="product-tag">{item.productType}</span>
												<p>{item.details}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Text input */}
						<form onSubmit={handleSendMessage} className="chat-input-form">
							<input
								type="text"
								placeholder="Ask Julia a question... (e.g. 'How do I treat acne?')"
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								className="chat-text-input"
								disabled={isJuliaSpeaking || isJuliaThinking}
							/>
							<button
								type="submit"
								className="chat-send-btn"
								disabled={!inputText.trim() || isJuliaSpeaking || isJuliaThinking}
							>
								Send
							</button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
};
