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
				{/* Column 1: Brand and contact */}
				<div className="footer-column brand-column">
					<div className="brand-section">
						<h2>
							JobBoard<span className="ai">AI</span>
						</h2>
						<p className="tagline">{t('footer.tagline')}</p>
					</div>

					<div className="contact-section">
						<div className="contact-item">
							<span className="contact-label">{t('footer.customer_care')}</span>
							<a href="tel:+821048672909" className="contact-value">
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

				{/* Column 2: Newsletter */}
				<div className="footer-column newsletter-column">
					<h3>{t('footer.newsletter')}</h3>
					<p className="newsletter-desc">{t('footer.newsletter_desc')}</p>

					<div className="subscribe-form">
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t('footer.email_placeholder')}
							className="email-input"
						/>
						<button onClick={handleSubscribe} className="subscribe-btn" aria-label={t('footer.subscribe')}>
							{t('footer.subscribe')}
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

				{/* Column 3: Quick links */}
				<div className="footer-column links-column">
					<div className="links-group">
						<h3>{t('footer.popular_searches')}</h3>
						<ul>
							<li>
								<a href="#">{t('footer.job_search1')}</a>
							</li>
							<li>
								<a href="#">{t('footer.job_search2')}</a>
							</li>
							<li>
								<a href="#">{t('footer.job_search3')}</a>
							</li>
							<li>
								<a href="#">{t('footer.job_search4')}</a>
							</li>
						</ul>
					</div>

					<div className="links-group">
						<h3>{t('footer.quick_links')}</h3>
						<ul>
							<li>
								<a href="#">{t('footer.terms')}</a>
							</li>
							<li>
								<a href="#">{t('footer.privacy')}</a>
							</li>
							<li>
								<a href="#">{t('footer.pricing')}</a>
							</li>
							<li>
								<a href="#">{t('footer.services')}</a>
							</li>
							<li>
								<a href="#">{t('footer.contact')}</a>
							</li>
							<li>
								<a href="#">{t('footer.faqs')}</a>
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
