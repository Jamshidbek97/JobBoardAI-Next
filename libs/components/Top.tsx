import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Box, Menu, MenuItem, Button, Avatar, Badge, Divider, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { CaretDown } from 'phosphor-react';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { NEXT_PUBLIC_API_URL } from '../config';
import NotificationBell from './common/NotificationBell';
import CloseIcon from '@mui/icons-material/Close';

const Top = () => {
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [lang, setLang] = useState<string>('en');
	const [isClient, setIsClient] = useState(false);
	
	// Ensure translations are loaded
	useEffect(() => {
		if (i18n && i18n.language && i18n.language !== lang) {
			i18n.changeLanguage(lang);
		}
	}, [lang, i18n]);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const [scrolled, setScrolled] = useState(false);
	const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
	const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Debug logging
	useEffect(() => {
		console.log('🔍 Top Component Debug:');
		console.log('- Window width:', window.innerWidth);
		console.log('- Mobile menu state:', mobileMenuOpen);
		console.log('- Is client:', isClient);
		console.log('- Should show mobile toggle:', window.innerWidth <= 768);
	}, [mobileMenuOpen, isClient]);

	// Navigation items - moved inside render to ensure translations update
	const navItems = [
		{ label: t ? t('Home') : 'Home', path: '/' },
		{ label: t ? t('Jobs') : 'Jobs', path: '/jobs' },
		{ label: t ? t('Companies') : 'Companies', path: '/agent' },
		{ label: t ? t('Community') : 'Community', path: '/community?articleCategory=FREE' },
		{ label: t ? t('CS') : 'CS', path: '/cs' }, // Changed from Resources to CS
	];

	useEffect(() => {
		const storedLang = localStorage.getItem('locale') || 'en';
		setLang(storedLang);

		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};

		window.addEventListener('scroll', handleScroll);

		// Initialize user if token exists
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);

		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const handleLangChange = async (newLang: string) => {
		setLang(newLang);
		localStorage.setItem('locale', newLang);
		setLangMenuAnchor(null);
		// Update i18n language
		if (i18n && i18n.changeLanguage) {
			await i18n.changeLanguage(newLang);
		}
		// Navigate to the same page with new locale
		await router.push(router.asPath, router.asPath, { locale: newLang });
	};

	const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setUserMenuAnchor(event.currentTarget);
	};

	const handleUserMenuClose = () => {
		setUserMenuAnchor(null);
	};

	const handleLogout = () => {
		logOut();
		handleUserMenuClose();
		router.push('/');
	};

	return (
		<header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
			<div className="container">
				<div className="logo">
					<Link href="/">
						<span>
							JobBoard<span className="ai">AI</span>
						</span>
					</Link>
				</div>

				{/* Mobile Menu Toggle - ALWAYS VISIBLE ON MOBILE */}
				<div className="mobile-menu-toggle-wrapper" style={{ marginLeft: 'auto' }}>
					<IconButton 
						className="mobile-menu-toggle"
						onClick={() => {
							console.log('🔥 Mobile menu button clicked!');
							setMobileMenuOpen(true);
						}}
						style={{
							display: 'flex',
							color: '#1890ff',
							backgroundColor: '#fff',
							borderRadius: '8px',
							padding: '12px',
							border: '2px solid #1890ff',
							boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
							minWidth: '48px',
							height: '48px',
						}}
					>
						<MenuIcon style={{ fontSize: 24 }} />
					</IconButton>
				</div>

				<nav className="main-nav">
					{isClient && navItems.map((item) => (
						<Link key={item.path} href={item.path} className={router.pathname === item.path ? 'active' : ''}>
							{item.label}
						</Link>
					))}
				</nav>

				<div className="user-actions">
					{user?._id && <NotificationBell />}

					<div className="lang-selector" onClick={(e) => setLangMenuAnchor(e.currentTarget)}>
						<span className={`flag flag-${lang}`}></span>
						<CaretDown size={14} weight="bold" />
					</div>

					{user?._id ? (
						<div className="user-profile" onClick={handleUserMenuOpen}>
							<Avatar
								src={user?.memberImage ? `${NEXT_PUBLIC_API_URL}/${user.memberImage}` : '/img/defaultMember.jpg'}
								className="avatar"
							/>
							<span className="user-name">{user.memberNick}</span>
							<CaretDown size={14} weight="bold" />
						</div>
					) : (
						<div className="auth-buttons">
							<Link href="/account/login">
								<Button variant="text">{isClient ? t('Login') : ''}</Button>
							</Link>
							<Link href="/account/join">
								<Button variant="contained" className="signup-btn">
									{isClient ? t('Register') : ''}
								</Button>
							</Link>
						</div>
					)}

					{/* Mobile Menu Toggle - AT THE END */}
					<IconButton 
						className="mobile-menu-toggle"
						onClick={() => {
							console.log('🔥 Mobile menu button clicked!');
							setMobileMenuOpen(true);
						}}
						style={{
							display: 'flex',
							color: '#1890ff',
							backgroundColor: '#fff',
							borderRadius: '8px',
							padding: '12px',
							border: '2px solid #1890ff',
							boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
							minWidth: '48px',
							height: '48px',
							marginLeft: '16px',
						}}
					>
						<MenuIcon style={{ fontSize: 24 }} />
					</IconButton>
				</div>
			</div>

			<Menu
				anchorEl={langMenuAnchor}
				open={Boolean(langMenuAnchor)}
				onClose={() => setLangMenuAnchor(null)}
				className="lang-menu"
			>
				<MenuItem onClick={() => handleLangChange('en')}>
					<span className="flag flag-en"></span>
					{isClient ? t('English') : ''}
				</MenuItem>
				<MenuItem onClick={() => handleLangChange('kr')}>
					<span className="flag flag-kr"></span>
					{isClient ? t('Korean') : ''}
				</MenuItem>
				<MenuItem onClick={() => handleLangChange('ru')}>
					<span className="flag flag-ru"></span>
					{isClient ? t('Russian') : ''}
				</MenuItem>
			</Menu>

			{/* User Menu */}
			<Menu
				anchorEl={userMenuAnchor}
				open={Boolean(userMenuAnchor)}
				onClose={handleUserMenuClose}
				className="user-menu"
			>
				<MenuItem onClick={() => router.push('/mypage')}>{isClient ? t('My Profile') : ''}</MenuItem>
				<MenuItem onClick={() => router.push('/mypage/applications')}>{isClient ? t('My Applications') : ''}</MenuItem>
				<MenuItem onClick={() => router.push('/mypage/notifications')}>{isClient ? t('Notifications') : ''}</MenuItem>
				{/* Show Application Management for agents (users who post jobs) */}
				<MenuItem onClick={() => router.push('/mypage/applications-management')}>
					{isClient ? t('Application Management') : ''}
				</MenuItem>
				<MenuItem onClick={() => router.push('/mypage')}>{isClient ? t('Account Settings') : ''}</MenuItem>
				<Divider />
				<MenuItem onClick={handleLogout}>
					<Logout fontSize="small" className="logout-icon" />
					{isClient ? t('Logout') : ''}
				</MenuItem>
			</Menu>

			{/* Mobile Menu Drawer */}
			<Drawer
				anchor="left"
				open={mobileMenuOpen}
				onClose={() => setMobileMenuOpen(false)}
				sx={{
					'& .MuiDrawer-paper': {
						width: '280px',
						padding: '20px',
						backgroundColor: '#fff',
					},
				}}
			>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<div className="logo">
						<Link href="/" onClick={() => setMobileMenuOpen(false)}>
							<span>
								JobBoard<span className="ai">AI</span>
							</span>
						</Link>
					</div>
					<IconButton onClick={() => setMobileMenuOpen(false)}>
						<CloseIcon />
					</IconButton>
				</Box>

				<List>
					{isClient && navItems.map((item) => (
						<ListItem 
							key={item.path} 
							button 
							component={Link}
							href={item.path}
							onClick={() => setMobileMenuOpen(false)}
							sx={{
								borderRadius: '8px',
								mb: 1,
								backgroundColor: router.pathname === item.path ? '#f0f8ff' : 'transparent',
								color: router.pathname === item.path ? '#1890ff' : '#333',
								'&:hover': {
									backgroundColor: '#f5f5f5',
								},
							}}
						>
							<ListItemText primary={item.label} />
						</ListItem>
					))}
				</List>

				<Divider sx={{ my: 2 }} />

				{/* Mobile User Actions */}
				<Box sx={{ mt: 'auto' }}>
					{user?._id ? (
						<Box>
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
								<Avatar
									src={user?.memberImage ? `${NEXT_PUBLIC_API_URL}/${user.memberImage}` : '/img/defaultMember.jpg'}
									className="avatar"
									sx={{ mr: 2 }}
								/>
								<Box>
									<Box sx={{ fontWeight: 600, color: '#333' }}>{user.memberNick}</Box>
									<Box sx={{ fontSize: '14px', color: '#666' }}>Member</Box>
								</Box>
							</Box>
							<Button 
								fullWidth 
								variant="outlined" 
								onClick={() => { router.push('/mypage'); setMobileMenuOpen(false); }}
								sx={{ mb: 1 }}
							>
								{isClient ? t('My Profile') : ''}
							</Button>
							<Button 
								fullWidth 
								variant="contained" 
								onClick={handleLogout}
								color="error"
							>
								{isClient ? t('Logout') : ''}
							</Button>
						</Box>
					) : (
						<Box>
							<Button 
								fullWidth 
								variant="outlined" 
								onClick={() => { router.push('/account/login'); setMobileMenuOpen(false); }}
								sx={{ mb: 1 }}
							>
								{isClient ? t('Login') : ''}
							</Button>
							<Button 
								fullWidth 
								variant="contained" 
								onClick={() => { router.push('/account/join'); setMobileMenuOpen(false); }}
							>
								{isClient ? t('Register') : ''}
							</Button>
						</Box>
					)}
				</Box>
			</Drawer>
		</header>
	);
};

export default Top;
