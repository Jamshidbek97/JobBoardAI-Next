// libs/components/home/HomeAdditional.tsx
import React from 'react';

const brands = [
	'/img/brands/google.png',
	'/img/brands/netflix.png',
	'/img/brands/amazon.png',
	'/img/brands/github.png',
	'/img/brands/airbnb.png',
	'/img/brands/spotify.png',
];

const tags = ['React', 'TypeScript', 'Next.js', 'NestJS', 'GraphQL', 'UI/UX'];

export default function HomeAdditional() {
	return (
		<section className="home-additional">
			<div className="ha-container">
				{/* Copy */}
				<div className="ha-copy">
					<h2 className="ha-title">
						Find your next role <span>faster</span>.
					</h2>
					<p className="ha-sub">Smart filters, curated listings, and AI guidance tailored to your skills.</p>

					<div className="ha-tags">
						{tags.map((t) => (
							<button key={t} className="ha-tag" type="button">
								#{t}
							</button>
						))}
					</div>

					<div className="ha-stats">
						<div className="stat">
							<span>12k+</span>
							<small>Open Roles</small>
						</div>
						<div className="stat">
							<span>2.3k</span>
							<small>Companies</small>
						</div>
						<div className="stat">
							<span>97%</span>
							<small>Match Satisfaction</small>
						</div>
					</div>
				</div>

				{/* Visual */}
				<div className="ha-visual">
					<div className="ha-card">
						<div className="badge">Featured</div>
						<div className="row r1" />
						<div className="row r2" />
						<div className="row r3" />
						<div className="row r4" />
					</div>

					<div className="ha-float ha-float--1">💼</div>
					<div className="ha-float ha-float--2">⚡</div>
					<div className="ha-float ha-float--3">✨</div>
				</div>
			</div>

			{/* Marquee */}
			<div className="ha-marquee">
				<div className="ha-track">
					{[...brands, ...brands].map((src, i) => (
						<div className="brand" key={`${src}-${i}`}>
							<img src={src} alt="brand" />
						</div>
					))}
				</div>
			</div>

			<svg className="ha-wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
				<path d="M0,80 C240,140 480,20 720,60 C960,100 1200,60 1440,100 L1440,120 L0,120 Z" fill="#fff" />
			</svg>
		</section>
	);
}
