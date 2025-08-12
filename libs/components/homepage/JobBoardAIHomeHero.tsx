'use client';

import { useState } from 'react';
import { Box, Button, Chip, Container, LinearProgress, Paper, Stack, Typography, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const logos = [
	{ name: 'Google', src: '/img/brands/google.png', w: 88, h: 28 },
	{ name: 'Apple', src: '/img/brands/apple.png', w: 28, h: 34 },
	{ name: 'Amazon', src: '/img/brands/amazon.png', w: 90, h: 28 },
	{ name: 'Netflix', src: '/img/brands/netflix.png', w: 90, h: 24 },
	{ name: 'Spotify', src: '/img/brands/spotify.png', w: 90, h: 26 },
	{ name: 'Airbnb', src: '/img/brands/airbnb.png', w: 84, h: 28 },
	{ name: 'GitHub', src: '/img/brands/github.png', w: 80, h: 28 },
	{ name: 'Microsoft', src: '/img/brands/Microsoft_logo.svg.png', w: 76, h: 28 },
];
// NOTE: Do NOT import a module stylesheet here —
// your project loads all SCSS from main.scss globally.
// Make sure you `@use` the SCSS below from main.scss.

export default function JobBoardAIHomeHero() {
	const [hovered, setHovered] = useState(false);

	return (
		<section className="jobboardai-home-hero">
			<Container maxWidth="lg" className="jb-inner">
				{/* Copy */}
				<Box className="jb-copy" sx={{ 
					display: 'flex', 
					flexDirection: 'column', 
					gap: 3,
					'@media (max-width: 600px)': {
						gap: 2,
						textAlign: 'center'
					}
				}}>
					<Typography component="h1" className="jb-title">
						Still Applying the Old Way? <span>You're Already Behind.</span>
					</Typography>

					<Typography variant="body1" className="jb-subtitle">
						Your AI Job Hunter works 24/7 — applying to jobs in real time the moment they're posted, giving you a
						first‑mover edge in today's most competitive markets. More speed. More interviews.
					</Typography>

					<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="jb-cta-row">
						<Button 
							variant="contained" 
							color="primary" 
							size="large" 
							className="jb-cta-primary"
							onClick={() => window.location.href = '/jobs'}
						>
							Create Your AI Job Hunter
							<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className="jb-cta-icon">
								<path d="M10.293 15.707a1 1 0 010-1.414L12.586 12H4a1 1 0 110-2h8.586l-2.293-2.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
							</svg>
						</Button>
						<Button 
							variant="outlined" 
							size="large" 
							className="jb-cta-secondary"
							onClick={() => console.log('Demo clicked')}
						>
							See a Live Demo
						</Button>
						<Typography variant="caption" className="jb-caption">
							Takes less than 60 seconds.
						</Typography>
					</Stack>
				</Box>

				{/* Interactive Card */}
				<Box className="jb-card-col">
					<motion.div
						onMouseEnter={() => setHovered(true)}
						onMouseLeave={() => setHovered(false)}
						onClick={() => setHovered((s) => !s)}
						initial={false}
						animate={{ y: hovered ? -6 : 0 }}
						transition={{ type: 'spring', stiffness: 220, damping: 20 }}
					>
						<div className="jb-card-glow" />

						<Paper elevation={0} className="jb-card">
							<Stack direction="row" alignItems="center" justifyContent="space-between" className="jb-card-header">
								<Stack direction="row" spacing={1.2} alignItems="center" className="jb-agent">
									<Avatar className="jb-avatar">SM</Avatar>
									<Box>
										<Typography className="jb-agent-name">Agent for Sarah M.</Typography>
										<Typography className="jb-agent-sub">Active • Searching Now</Typography>
									</Box>
								</Stack>
								<Chip label="⚡ Auto‑Apply" className="jb-badge-auto" size="small" />
							</Stack>

							{/* Target Roles + Progress */}
							<Box className="jb-targets">
								<Typography className="jb-label">Target Roles</Typography>
								<Stack direction="row" spacing={1} flexWrap="wrap">
									<Chip label="Senior Product Designer" className="jb-tag" size="small" />
									<Chip label="Remote" className="jb-tag" size="small" />
								</Stack>
								<Box className="jb-progress-wrap">
									<LinearProgress
										variant="determinate"
										value={hovered ? 88 : 62}
										classes={{ root: 'jb-progress-root', bar: 'jb-progress-bar' }}
									/>
								</Box>
							</Box>

							{/* Panels */}
							<Box className="jb-panels">
								<AnimatePresence initial={false} mode="wait">
									{!hovered ? (
										<motion.div
											key="summary"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.25 }}
											className="jb-summary"
										>
											<Box className="jb-stats">
												<Stat value={26} label="Applications" />
												<Stat value={8} label="Responses" />
												<Stat value={3} label="Interviews" />
											</Box>

											<Box className="jb-upcoming">
												<Typography className="jb-section-title">Upcoming</Typography>
												<ListItem
													title="Senior Product Designer"
													sub="Acme Corporation • San Francisco, CA"
													meta="3 mins ago"
													badge="Interview Scheduled"
												/>
												<ListItem
													title="UX Researcher"
													sub="Globex Inc • Remote"
													meta="Applying in 2 mins"
													badge="Applying Soon"
												/>
											</Box>
										</motion.div>
									) : (
										<motion.div
											key="details"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.25 }}
											className="jb-details"
										>
											<Box className="jb-kpis">
												<KPI label="First to Apply" value="72%" trend="up" />
												<KPI label="Match Quality" value="86%" trend="up" />
												<KPI label="Avg. Response" value="1.8d" trend="down" />
												<KPI label="Interview Rate" value="11%" trend="up" />
											</Box>

											<Box className="jb-feed">
												{[
													{ tag: 'Applied', title: 'Senior UX Designer', time: 'Just now' },
													{ tag: 'Saved', title: 'Product Designer – Mobile', time: '2m' },
													{ tag: 'Response', title: 'Lead Designer • Atlas', time: '11m' },
													{ tag: 'Follow‑up', title: 'Researcher • Lyra', time: '32m' },
												].map((log, i) => (
													<div key={i} className="jb-feed-row">
														<span className="jb-dot" />
														<div className="jb-feed-text">
															<p className="jb-feed-title">{log.title}</p>
															<p className="jb-feed-tag">{log.tag}</p>
														</div>
														<span className="jb-feed-time">{log.time}</span>
													</div>
												))}
											</Box>
										</motion.div>
									)}
								</AnimatePresence>
							</Box>
						</Paper>

						{/* <Typography variant="caption" className="jb-toggle-hint">
							<span>Hover</span> or <span>Tap</span> to toggle details
						</Typography> */}
					</motion.div>
				</Box>
			</Container>

			{/* Logos strip + link */}
			<Container maxWidth="lg" className="jb-logos-wrap">
				<Typography align="center" className="jb-social-proof" sx={{ mb: 3 }}>
					Join thousands of users who have landed roles at top companies:
				</Typography>
				<Box 
					className="jb-logo-row" 
					role="list"
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						gap: 3,
						'@media (max-width: 600px)': {
							gap: 2,
						}
					}}
				>
					{logos.map((l, i) => (
						<Paper 
							key={i} 
							className="jb-logo-chip" 
							elevation={0} 
							role="listitem"
							sx={{
								transition: 'transform 0.2s ease-in-out',
								'&:hover': {
									transform: 'scale(1.05)',
								}
							}}
						>
							<Link href={`/jobs?company=${encodeURIComponent(l.name)}`} aria-label={`View ${l.name} jobs`}>
								<span className="jb-logo-img">
									<Image src={l.src} alt={`${l.name} logo`} width={l.w} height={l.h} />
								</span>
							</Link>
						</Paper>
					))}
				</Box>
				<Stack direction="row" justifyContent="center" className="jb-userstories-row" sx={{ mt: 3 }}>
					<a href="#stories" className="jb-userstories-link">
						Read User Stories →
					</a>
				</Stack>
			</Container>
		</section>
	);
}

function Stat({ value, label }: { value: number; label: string }) {
	return (
		<Paper elevation={0} className="jb-stat">
			<div className="jb-stat-value">{value}</div>
			<div className="jb-stat-label">{label}</div>
		</Paper>
	);
}

function ListItem({ title, sub, meta, badge }: { title: string; sub: string; meta: string; badge: string }) {
	return (
		<Paper elevation={0} className="jb-item">
			<div>
				<p className="jb-item-title">{title}</p>
				<p className="jb-item-sub">{sub}</p>
				<p className="jb-item-meta">{meta}</p>
			</div>
			<Chip label={badge} size="small" className="jb-item-badge" />
		</Paper>
	);
}

function KPI({ label, value, trend }: { label: string; value: string; trend: 'up' | 'down' }) {
	return (
		<Paper elevation={0} className="jb-kpi">
			<div className="jb-kpi-row">
				<p className="jb-kpi-label">{label}</p>
				<span className={trend === 'up' ? 'jb-trend-up' : 'jb-trend-down'}>{trend === 'up' ? '▲' : '▼'}</span>
			</div>
			<p className="jb-kpi-value">{value}</p>
		</Paper>
	);
}
