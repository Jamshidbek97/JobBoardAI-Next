// libs/components/home/HomeAdditional.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
	Rocket as RocketIcon,
	TrendingUp as TrendingUpIcon,
	Star as StarIcon,
	Users as UsersIcon,
	Briefcase as BriefcaseIcon,
	Zap as ZapIcon,
	ArrowForward as ArrowForwardIcon,
	PlayArrow as PlayArrowIcon
} from '@mui/icons-material';

const brands = [
	{ name: 'Google', logo: '/img/brands/google.png', color: '#4285F4' },
	{ name: 'Netflix', logo: '/img/brands/netflix.png', color: '#E50914' },
	{ name: 'Amazon', logo: '/img/brands/amazon.png', color: '#FF9900' },
	{ name: 'GitHub', logo: '/img/brands/github.png', color: '#181717' },
	{ name: 'Airbnb', logo: '/img/brands/airbnb.png', color: '#FF5A5F' },
	{ name: 'Spotify', logo: '/img/brands/spotify.png', color: '#1DB954' },
	{ name: 'Microsoft', logo: '/img/brands/microsoft.png', color: '#0078D4' },
	{ name: 'Apple', logo: '/img/brands/apple.png', color: '#000000' },
];

const tags = [
	{ name: 'React', color: '#61DAFB', icon: '⚛️' },
	{ name: 'TypeScript', color: '#3178C6', icon: '📘' },
	{ name: 'Next.js', color: '#000000', icon: '⚡' },
	{ name: 'NestJS', color: '#E0234E', icon: '🪺' },
	{ name: 'GraphQL', color: '#E10098', icon: '🔷' },
	{ name: 'UI/UX', color: '#FF6B6B', icon: '🎨' },
	{ name: 'Node.js', color: '#339933', icon: '🟢' },
	{ name: 'Python', color: '#3776AB', icon: '🐍' },
];

const features = [
	{
		icon: <RocketIcon />,
		title: 'AI-Powered Matching',
		description: 'Smart algorithms match you with the perfect job opportunities'
	},
	{
		icon: <TrendingUpIcon />,
		title: 'Career Growth',
		description: 'Track your progress and discover new career paths'
	},
	{
		icon: <StarIcon />,
		title: 'Top Companies',
		description: 'Connect with leading tech companies worldwide'
	}
];

export default function HomeAdditional() {
	const router = useRouter();
	const [activeTag, setActiveTag] = useState<string | null>(null);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [animatedStats, setAnimatedStats] = useState({
		jobs: 0,
		companies: 0,
		satisfaction: 0
	});

	// Animate stats on mount
	useEffect(() => {
		const animateStats = () => {
			const duration = 2000;
			const steps = 60;
			const stepDuration = duration / steps;
			
			let currentStep = 0;
			const interval = setInterval(() => {
				currentStep++;
				const progress = currentStep / steps;
				
				setAnimatedStats({
					jobs: Math.floor(12000 * progress),
					companies: Math.floor(2300 * progress),
					satisfaction: Math.floor(97 * progress)
				});
				
				if (currentStep >= steps) {
					clearInterval(interval);
				}
			}, stepDuration);
		};

		animateStats();
	}, []);

	const handleTagClick = (tagName: string) => {
		setActiveTag(tagName);
		// Navigate to jobs page with tag filter
		router.push({
			pathname: '/jobs',
			query: { 
				input: JSON.stringify({
					page: 1,
					limit: 10,
					search: { text: tagName },
					direction: 'DESC'
				})
			}
		});
	};

	const handleGetStarted = () => {
		router.push('/jobs');
	};

	const handleWatchDemo = () => {
		setIsVideoPlaying(true);
		// In a real app, this would open a video modal
		console.log('Opening demo video...');
	};

	return (
		<section className="home-additional">
			{/* Background Elements */}
			<div className="ha-background">
				<div className="ha-bg-circle ha-bg-circle--1"></div>
				<div className="ha-bg-circle ha-bg-circle--2"></div>
				<div className="ha-bg-circle ha-bg-circle--3"></div>
				<div className="ha-bg-grid"></div>
			</div>

			<div className="ha-container">
				{/* Left Content */}
				<div className="ha-copy">
					<div className="ha-badge">
						<ZapIcon className="ha-badge-icon" />
						<span>AI-Powered Job Matching</span>
					</div>

					<h1 className="ha-title">
						Find your dream job{' '}
						<span className="ha-title-gradient">faster</span>
						<br />
						than ever before
					</h1>

					<p className="ha-subtitle">
						Join thousands of developers who've found their perfect role through our 
						AI-powered platform. Smart filters, curated listings, and personalized 
						recommendations tailored to your skills and career goals.
					</p>

					{/* Interactive Tags */}
					<div className="ha-tags">
						{tags.map((tag) => (
							<button
								key={tag.name}
								className={`ha-tag ${activeTag === tag.name ? 'active' : ''}`}
								onClick={() => handleTagClick(tag.name)}
								style={{ '--tag-color': tag.color } as React.CSSProperties}
							>
								<span className="ha-tag-icon">{tag.icon}</span>
								<span className="ha-tag-text">#{tag.name}</span>
							</button>
						))}
					</div>

					{/* Animated Stats */}
					<div className="ha-stats">
						<div className="ha-stat">
							<div className="ha-stat-icon">
								<BriefcaseIcon />
							</div>
							<div className="ha-stat-content">
								<span className="ha-stat-number">{animatedStats.jobs.toLocaleString()}+</span>
								<small className="ha-stat-label">Open Roles</small>
							</div>
						</div>
						<div className="ha-stat">
							<div className="ha-stat-icon">
								<UsersIcon />
							</div>
							<div className="ha-stat-content">
								<span className="ha-stat-number">{animatedStats.companies.toLocaleString()}+</span>
								<small className="ha-stat-label">Companies</small>
							</div>
						</div>
						<div className="ha-stat">
							<div className="ha-stat-icon">
								<StarIcon />
							</div>
							<div className="ha-stat-content">
								<span className="ha-stat-number">{animatedStats.satisfaction}%</span>
								<small className="ha-stat-label">Success Rate</small>
							</div>
						</div>
					</div>

					{/* CTA Buttons */}
					<div className="ha-actions">
						<button className="ha-btn ha-btn--primary" onClick={handleGetStarted}>
							<span>Get Started</span>
							<ArrowForwardIcon className="ha-btn-icon" />
						</button>
						<button className="ha-btn ha-btn--secondary" onClick={handleWatchDemo}>
							<PlayArrowIcon className="ha-btn-icon" />
							<span>Watch Demo</span>
						</button>
					</div>

					{/* Features */}
					<div className="ha-features">
						{features.map((feature, index) => (
							<div key={index} className="ha-feature">
								<div className="ha-feature-icon">
									{feature.icon}
								</div>
								<div className="ha-feature-content">
									<h4 className="ha-feature-title">{feature.title}</h4>
									<p className="ha-feature-desc">{feature.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Right Visual */}
				<div className="ha-visual">
					{/* Main Card */}
					<div className="ha-card">
						<div className="ha-card-header">
							<div className="ha-card-badge">
								<StarIcon className="ha-card-badge-icon" />
								<span>Featured Job</span>
							</div>
							<div className="ha-card-company">
								<img src="/img/brands/google.png" alt="Google" className="ha-card-logo" />
								<div className="ha-card-company-info">
									<h4>Senior React Developer</h4>
									<p>Google • Mountain View, CA</p>
								</div>
							</div>
						</div>
						
						<div className="ha-card-content">
							<div className="ha-card-tags">
								<span className="ha-card-tag">React</span>
								<span className="ha-card-tag">TypeScript</span>
								<span className="ha-card-tag">Remote</span>
							</div>
							<div className="ha-card-salary">$120k - $180k</div>
						</div>

						<div className="ha-card-footer">
							<button className="ha-card-btn">Apply Now</button>
							<button className="ha-card-btn ha-card-btn--outline">Save</button>
						</div>
					</div>

					{/* Floating Elements */}
					<div className="ha-float ha-float--1">
						<BriefcaseIcon />
						<span>New Jobs</span>
					</div>
					<div className="ha-float ha-float--2">
						<TrendingUpIcon />
						<span>Trending</span>
					</div>
					<div className="ha-float ha-float--3">
						<StarIcon />
						<span>Top Rated</span>
					</div>

					{/* Animated Background Elements */}
					<div className="ha-visual-bg">
						<div className="ha-visual-circle ha-visual-circle--1"></div>
						<div className="ha-visual-circle ha-visual-circle--2"></div>
						<div className="ha-visual-circle ha-visual-circle--3"></div>
					</div>
				</div>
			</div>

			{/* Enhanced Marquee */}
			<div className="ha-marquee">
				<div className="ha-marquee-content">
					<div className="ha-marquee-text">Trusted by leading companies worldwide</div>
				</div>
				<div className="ha-track">
					{[...brands, ...brands].map((brand, i) => (
						<div className="ha-brand" key={`${brand.name}-${i}`}>
							<img 
								src={brand.logo} 
								alt={brand.name} 
								className="ha-brand-logo"
								style={{ '--brand-color': brand.color } as React.CSSProperties}
							/>
						</div>
					))}
				</div>
			</div>

			{/* Enhanced Wave */}
			<svg className="ha-wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
				<defs>
					<linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
						<stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.1" />
						<stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
					</linearGradient>
				</defs>
				<path 
					d="M0,80 C240,140 480,20 720,60 C960,100 1200,60 1440,100 L1440,120 L0,120 Z" 
					fill="url(#waveGradient)" 
				/>
			</svg>
		</section>
	);
}
