import React, { useState, useMemo } from "react";
import { TrophyIcon, SearchIcon, SparklesIcon, CheckIcon } from "../assets/icons";

interface Volunteer {
	rank: number;
	name: string;
	level: number;
	points: number;
	hours: number;
	badge: string;
	isUser?: boolean;
}

export const RtcSimulator: React.FC = () => {
	// Sample leaderboard data
	const [volunteers, setVolunteers] = useState<Volunteer[]>([
		{ rank: 1, name: "Omar Abdelrahman", level: 4, points: 580, hours: 48, badge: "⭐ Master" },
		{ rank: 2, name: "Dina Mahmoud", level: 3, points: 410, hours: 32, badge: "⚡ Energetic" },
		{ rank: 3, name: "Eyad Gaber (You)", level: 3, points: 350, hours: 28, badge: "🚀 Innovator", isUser: true },
		{ rank: 4, name: "Anwar Qasem", level: 3, points: 310, hours: 24, badge: "💡 Supportive" },
		{ rank: 5, name: "Ahmed Mohamed", level: 2, points: 220, hours: 18, badge: "🌱 Rising Star" },
		{ rank: 6, name: "Youssef Ibrahim", level: 2, points: 180, hours: 14, badge: "🌱 Rising Star" },
		{ rank: 7, name: "Mariam Ali", level: 1, points: 95, hours: 8, badge: "👶 Novice" },
	]);

	const [searchTerm, setSearchTerm] = useState<string>("");
	const [notification, setNotification] = useState<string | null>(null);

	const handleParticipationSimulation = () => {
		// Increment points by random amount (20 - 45 points) and add 2 hours
		const ptsAdded = Math.floor(20 + Math.random() * 25);
		const hrsAdded = Math.floor(1 + Math.random() * 3);

		setVolunteers((prevVolunteers) => {
			// Update user points and hours
			const updated = prevVolunteers.map((vol) => {
				if (vol.isUser) {
					const newPoints = vol.points + ptsAdded;
					const newHours = vol.hours + hrsAdded;

					// Level up thresholds
					let newLevel = vol.level;
					if (newPoints > 500) newLevel = 4;
					else if (newPoints > 250) newLevel = 3;
					else if (newPoints > 100) newLevel = 2;

					if (newLevel > vol.level) {
						showNotification(`🎉 LEVEL UP! You are now Level ${newLevel}!`);
					} else {
						showNotification(`Added +${ptsAdded} points and +${hrsAdded} hours to your profile!`);
					}

					return {
						...vol,
						points: newPoints,
						hours: newHours,
						level: newLevel,
						badge: newLevel === 4 ? "⭐ Master" : vol.badge,
					};
				}
				return vol;
			});

			// Re-sort volunteers based on points and re-assign ranks
			return updated
				.sort((a, b) => b.points - a.points)
				.map((vol, idx) => ({ ...vol, rank: idx + 1 }));
		});
	};

	const showNotification = (msg: string) => {
		setNotification(msg);
		setTimeout(() => setNotification(null), 4000);
	};

	// Filtered list for search
	const filteredVolunteers = useMemo(() => {
		return volunteers.filter((vol) =>
			vol.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [volunteers, searchTerm]);

	// Extract user details
	const userProfile = volunteers.find((v) => v.isUser)!;

	return (
		<div className="rtc-container">
			{/* Notification toast */}
			{notification && (
				<div className="rtc-toast">
					<SparklesIcon size={16} className="text-yellow" />
					<span>{notification}</span>
				</div>
			)}

			{/* Left Column - User Dashboard Stats */}
			<div className="rtc-dashboard">
				<h4 className="dashboard-title">Volunteer Portal</h4>
				
				<div className="rtc-id-card">
					<div className="card-header-rtc">
						<div className="profile-img-placeholder">EG</div>
						<div className="profile-titles">
							<h5>Eyad Gaber</h5>
							<span className="badge-rtc">Level {userProfile.level} Volunteer</span>
						</div>
					</div>

					<div className="card-stats-row">
						<div className="card-stat">
							<span className="stat-num">{userProfile.points}</span>
							<span className="stat-lbl">Points</span>
						</div>
						<div className="card-stat">
							<span className="stat-num">{userProfile.hours}h</span>
							<span className="stat-lbl">Service Time</span>
						</div>
						<div className="card-stat">
							<span className="stat-num">#{userProfile.rank}</span>
							<span className="stat-lbl">Rank</span>
						</div>
					</div>

					<div className="card-badge-line">
						<span className="badge-lbl">Current Title:</span>
						<span className="badge-val">{userProfile.badge}</span>
					</div>

					<button className="simulate-btn" onClick={handleParticipationSimulation}>
						Log Volunteer Participation (+Points)
					</button>
				</div>

				<div className="level-info-box">
					<h5>Level Thresholds</h5>
					<div className="level-steps-rtc">
						<div className={`level-step-rtc ${userProfile.level >= 1 ? "reached" : ""}`}>
							<CheckIcon size={12} />
							<span>Level 1: Novice (0 - 100 pts)</span>
						</div>
						<div className={`level-step-rtc ${userProfile.level >= 2 ? "reached" : ""}`}>
							<CheckIcon size={12} />
							<span>Level 2: Active (101 - 250 pts)</span>
						</div>
						<div className={`level-step-rtc ${userProfile.level >= 3 ? "reached" : ""}`}>
							<CheckIcon size={12} />
							<span>Level 3: Innovator (251 - 500 pts)</span>
						</div>
						<div className={`level-step-rtc ${userProfile.level >= 4 ? "reached" : ""}`}>
							<CheckIcon size={12} />
							<span>Level 4: Master (501+ pts)</span>
						</div>
					</div>
				</div>
			</div>

			{/* Right Column - Leaderboard Table */}
			<div className="rtc-leaderboard">
				<div className="leaderboard-header">
					<h4>
						<TrophyIcon size={18} className="text-yellow" />
						<span>RTC Volunteer Leaderboard</span>
					</h4>
					<div className="rtc-search">
						<SearchIcon size={16} className="search-ic" />
						<input
							type="text"
							placeholder="Search volunteers..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="search-input"
						/>
					</div>
				</div>

				<div className="leaderboard-table-container">
					<table className="leaderboard-table">
						<thead>
							<tr>
								<th>Rank</th>
								<th>Name</th>
								<th>Level</th>
								<th>Points</th>
								<th>Hours</th>
								<th>Achievement</th>
							</tr>
						</thead>
						<tbody>
							{filteredVolunteers.map((vol) => (
								<tr key={vol.name} className={`${vol.isUser ? "user-row" : ""} rank-${vol.rank}`}>
									<td className="rank-cell">
										{vol.rank === 1 ? "🥇" : vol.rank === 2 ? "🥈" : vol.rank === 3 ? "🥉" : vol.rank}
									</td>
									<td className="name-cell">
										<span className="vol-name">{vol.name}</span>
										{vol.isUser && <span className="you-label">You</span>}
									</td>
									<td>
										<span className="lvl-badge">Lvl {vol.level}</span>
									</td>
									<td className="points-cell">{vol.points}</td>
									<td>{vol.hours} hrs</td>
									<td>
										<span className="ach-badge">{vol.badge}</span>
									</td>
								</tr>
							))}
							{filteredVolunteers.length === 0 && (
								<tr>
									<td colSpan={6} className="no-results-td">
										No volunteers found matching your search.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
