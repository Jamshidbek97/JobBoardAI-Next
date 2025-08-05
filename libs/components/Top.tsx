import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { MenuItem, Button, Menu, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { CaretDown } from 'phosphor-react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../config';

const StyledMenu = styled(Menu)(({ theme }) => ({
	'& .MuiPaper-root': {
		borderRadius: 12,
		marginTop: theme.spacing(1),
		minWidth: 180,
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		backdropFilter: 'blur(10px)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
		'& .MuiMenuItem-root': {
			padding: '12px 16px',
			fontSize: '14px',
			fontWeight: 500,
			'&:hover': {
				backgroundColor: 'rgba(59, 130, 246, 0.08)',
			},
		},
	},
}));

const Top: React.FC = () => {
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();

	// State management
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
	const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
	const [currentLang, setCurrentLang] = useState<string>('en');

	// Menu states
	const langMenuOpen = Boolean(langMenuAnchor);
	const userMenuOpen = Boolean(userMenuAnchor);

	// Navigation items
	const navigationItems = [
		{ href: '/', label: t('Home') },
		{ href: '/jobs', label: t('Jobs') },
		{ href: '/companies', label: t('Companies') },
		{ href: '/talent', label: t('Talent') },
		{ href: '/resources', label: t('Resources') },
		...(user?._id ? [{ href: '/dashboard', label: t('Dashboard') }] : []),
	];

	const languages = [
		{ code: 'en', label: t('English'), flag: '/img/flag/langen.png' },
		{ code: 'kr', label: t('Korean'), flag: '/img/flag/langkr.png' },
		{ code: 'ru', label: t('Russian'), flag: '/img/flag/langru.png' },
	];

	// Effects
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		const savedLang = localStorage.getItem('locale') || 'en';
		setCurrentLang(savedLang);
	}, []);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	// Handlers
	const handleLanguageChange = useCallback(
		async (langCode: string) => {
			setCurrentLang(langCode);
			localStorage.setItem('locale', langCode);
			setLangMenuAnchor(null);
			await router.push(router.asPath, router.asPath, { locale: langCode });
		},
		[router],
	);

	const handleLogout = () => {
		logOut();
		setUserMenuAnchor(null);
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	return (
		<div className={`top-navbar ${scrolled ? 'scrolled' : ''}`}>
			<div className="navbar-container">
				{/* Logo */}
				<div className="navbar-logo">
					<Link href="/">
						<img src="/img/logo/jobBoardAI-logo.svg" alt="JobBoardAI" />
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="navbar-nav desktop-nav">
					{navigationItems.map((item) => (
						<Link key={item.href} href={item.href}>
							<span className={router.pathname === item.href ? 'active' : ''}>{item.label}</span>
						</Link>
					))}
				</nav>

				{/* Right Side Actions */}
				<div className="navbar-actions">
					{/* Language Selector */}
					<div className="language-selector">
						<Button
							className="lang-button"
							onClick={(e: any) => setLangMenuAnchor(e.currentTarget)}
							endIcon={<CaretDown size={14} />}
						>
							<img
								src={languages.find((lang) => lang.code === currentLang)?.flag || '/img/flag/langen.png'}
								alt=""
								className="flag-icon"
							/>
						</Button>

						<StyledMenu anchorEl={langMenuAnchor} open={langMenuOpen} onClose={() => setLangMenuAnchor(null)}>
							{languages.map((lang) => (
								<MenuItem
									key={lang.code}
									onClick={() => handleLanguageChange(lang.code)}
									selected={currentLang === lang.code}
								>
									<img src={lang.flag} alt="" className="flag-icon-menu" />
									{lang.label}
								</MenuItem>
							))}
						</StyledMenu>
					</div>

					{/* User Actions */}
					{user?._id ? (
						<div className="user-actions">
							<IconButton className="notification-btn">
								<NotificationsOutlinedIcon />
							</IconButton>

							<div className="user-profile" onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
								<img
									src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
									alt="Profile"
									className="profile-image"
								/>
							</div>

							<StyledMenu anchorEl={userMenuAnchor} open={userMenuOpen} onClose={() => setUserMenuAnchor(null)}>
								<MenuItem onClick={() => router.push('/profile')}>
									<AccountCircleOutlinedIcon sx={{ mr: 1.5, fontSize: 18 }} />
									{t('Profile')}
								</MenuItem>
								<MenuItem onClick={handleLogout}>
									<LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} />
									{t('Logout')}
								</MenuItem>
							</StyledMenu>
						</div>
					) : (
						<div className="auth-actions">
							<Link href="/auth/login">
								<Button className="login-btn" variant="outlined">
									{t('Login')}
								</Button>
							</Link>
							<Link href="/auth/register">
								<Button className="register-btn" variant="contained">
									{t('Get Started')}
								</Button>
							</Link>
						</div>
					)}

					{/* Mobile Menu Toggle */}
					<IconButton className="mobile-menu-toggle" onClick={toggleMobileMenu}>
						{mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
					</IconButton>
				</div>
			</div>

			{/* Mobile Menu Drawer */}
			<Drawer anchor="right" open={mobileMenuOpen} onClose={toggleMobileMenu} className="mobile-drawer">
				<div className="mobile-menu">
					<div className="mobile-menu-header">
						<img src="/img/logo/jobBoardAI-logo.svg" alt="JobBoardAI" />
						<IconButton onClick={toggleMobileMenu}>
							<CloseIcon />
						</IconButton>
					</div>

					<List className="mobile-nav-list">
						{navigationItems.map((item) => (
							<ListItem
								key={item.href}
								button
								onClick={() => {
									router.push(item.href);
									setMobileMenuOpen(false);
								}}
							>
								<ListItemText primary={item.label} />
							</ListItem>
						))}
					</List>

					{!user?._id && (
						<div className="mobile-auth-actions">
							<Button
								fullWidth
								variant="outlined"
								onClick={() => {
									router.push('/auth/login');
									setMobileMenuOpen(false);
								}}
							>
								{t('Login')}
							</Button>
							<Button
								fullWidth
								variant="contained"
								onClick={() => {
									router.push('/auth/register');
									setMobileMenuOpen(false);
								}}
							>
								{t('Get Started')}
							</Button>
						</div>
					)}
				</div>
			</Drawer>
		</div>
	);
};

export default Top;
