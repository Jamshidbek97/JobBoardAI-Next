import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

const Footer = () => {
	const { t } = useTranslation('common');
	const [email, setEmail] = useState('');
	const currentYear = moment().year();

	const handleSubscribe = () => {
		if (email) {
			alert(`${t('footer.subscribed')} ${email}`);
			setEmail('');
		}
	};

	return (
		<div className="footer-container">
			<div className="footer-grid">
				<div className="footer-column brand-column">
					<div className="brand-section">
						<h2>
							JobBoard<span className="ai">AI</span>
						</h2>
						<p className="tagline">{t('Tagline')}</p>
					</div>

					<div className="contact-section">
						<div className="contact-item">
							<span className="contact-label">{t('Customer Care')}</span>
							<a href="tel:+821056291297" className="contact-value">
								+82 10 5629 1297
							</a>
						</div>

						<div className="contact-item">
							<span className="contact-label">{t('footer.support')}</span>
							<a href="mailto:support@jobboardai.com" className="contact-value">
								support@jobboardai.com
							</a>
						</div>

						<div className="contact-item">
							<span className="contact-label">{t('footer.available')}</span>
							<span className="hours-value">9AM - 6PM (KST)</span>
						</div>
					</div>
				</div>

				<div className="footer-column newsletter-column">
					<h3>{t('Newsletter')}</h3>
					<p className="newsletter-desc">{t('Newsletter description')}</p>

					<div className="subscribe-form">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t('footer.email_placeholder')}
							className="email-input"
						/>
						<button onClick={handleSubscribe} className="subscribe-btn" aria-label={t('footer.subscribe')}>
							{t('Subscribe')}
							<span className="send-icon">→</span>
						</button>
					</div>

					<div className="social-section">
						<p>{t('footer.follow_us')}</p>
						<div className="social-icons">
							<a href="#" className="social-icon" aria-label="Facebook">
								<FacebookOutlinedIcon />
							</a>
							<a href="#" className="social-icon" aria-label="Telegram">
								<TelegramIcon />
							</a>
							<a href="#" className="social-icon" aria-label="Instagram">
								<InstagramIcon />
							</a>
							<a href="#" className="social-icon" aria-label="Twitter">
								<TwitterIcon />
							</a>
						</div>
					</div>
				</div>

				<div className="footer-column links-column">
					<div className="links-group">
						<h3>Popular Searches</h3>
						<ul>
							<li>
								<a href="#">Frontend Developer Jobs</a>
							</li>
							<li>
								<a href="#">Remote Internships</a>
							</li>
							<li>
								<a href="#">Full-stack Developer in Seoul</a>
							</li>
							<li>
								<a href="#">Part-time React Jobs</a>
							</li>
						</ul>
					</div>

					<div className="links-group">
						<h3>Quick Links</h3>
						<ul>
							<li>
								<a href="#">Terms & Conditions</a>
							</li>
							<li>
								<a href="#">Privacy Policy</a>
							</li>
							<li>
								<a href="#">Pricing</a>
							</li>
							<li>
								<a href="#">Our Services</a>
							</li>
							<li>
								<a href="#">Contact Us</a>
							</li>
							<li>
								<a href="#">FAQs</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Column 4: Discover */}
				<div className="footer-column discover-column">
					<div className="links-group">
						<h3>{t('footer.discover')}</h3>
						<div className="location-grid">
							<a href="#" className="location-card">
								<div className="location-icon">📍</div>
								<span>Seoul</span>
							</a>
							<a href="#" className="location-card">
								<div className="location-icon">📍</div>
								<span>Gyeongido</span>
							</a>
							<a href="#" className="location-card">
								<div className="location-icon">📍</div>
								<span>Busan</span>
							</a>
							<a href="#" className="location-card">
								<div className="location-icon">📍</div>
								<span>Jejudo</span>
							</a>
							<a href="#" className="location-card">
								<div className="location-icon">📍</div>
								<span>Incheon</span>
							</a>
							<a href="#" className="location-card">
								<div className="location-icon">📍</div>
								<span>Suwon</span>
							</a>
							<a href="#" className="location-card">
								<div className="location-icon">📍</div>
								<span>Sokcho</span>
							</a>
						</div>
					</div>
				</div>
			</div>

			<div className="footer-bottom">
				<div className="copyright">
					© JobBoardAI – {t('footer.all_rights')} {currentYear}
				</div>
				<div className="legal-links">
					<a href="#">{t('footer.privacy')}</a>
					<a href="#">{t('footer.terms')}</a>
					<a href="#">{t('footer.sitemap')}</a>
				</div>
			</div>
		</div>
	);
};

export default Footer;
