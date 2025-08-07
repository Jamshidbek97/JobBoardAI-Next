import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Box, Menu, MenuItem, Button, Avatar, Badge, Divider } from '@mui/material';
import { CaretDown, Bell } from 'phosphor-react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';

const Top = () => {
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [lang, setLang] = useState<string>('en');
	const [scrolled, setScrolled] = useState(false);
	const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
	const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);

	// Navigation items
	const navItems = [
		{ label: t('Home'), path: '/' },
		{ label: t('Jobs'), path: '/jobs' },
		{ label: t('Companies'), path: '/companies' },
		{ label: t('Community'), path: '/community?articleCategory=FREE' },
		{ label: t('CS'), path: '/cs' }, // Changed from Resources to CS
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

				<nav className="main-nav">
					{navItems.map((item) => (
						<Link key={item.path} href={item.path} className={router.pathname === item.path ? 'active' : ''}>
							{item.label}
						</Link>
					))}
					{/* Add "My Page" when user is logged in */}
					{user?._id && (
						<Link href="/mypage" className={router.pathname === '/mypage' ? 'active' : ''}>
							{t('My Page')}
						</Link>
					)}
				</nav>

				<div className="user-actions">
					{user?._id && (
						<Badge badgeContent={3} color="error" className="notification-badge">
							<Bell size={24} weight="duotone" />
						</Badge>
					)}

					<div className="lang-selector" onClick={(e) => setLangMenuAnchor(e.currentTarget)}>
						<span className={`flag flag-${lang}`}></span>
						<CaretDown size={14} weight="bold" />
					</div>

					{user?._id ? (
						<div className="user-profile" onClick={handleUserMenuOpen}>
							<Avatar
								src={user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
								className="avatar"
							/>
							<span className="user-name">{user.memberNick}</span>
							<CaretDown size={14} weight="bold" />
						</div>
					) : (
						<div className="auth-buttons">
							<Link href="/account/login">
								<Button variant="text">{t('Login')}</Button>
							</Link>
							<Link href="/account/join">
								<Button variant="contained" className="signup-btn">
									{t('Register')}
								</Button>
							</Link>
						</div>
					)}
				</div>
			</div>

			{/* Language Selector Menu */}
			<Menu
				anchorEl={langMenuAnchor}
				open={Boolean(langMenuAnchor)}
				onClose={() => setLangMenuAnchor(null)}
				className="lang-menu"
			>
				<MenuItem onClick={() => handleLangChange('en')}>
					<span className="flag flag-en"></span>
					{t('English')}
				</MenuItem>
				<MenuItem onClick={() => handleLangChange('kr')}>
					<span className="flag flag-kr"></span>
					{t('Korean')}
				</MenuItem>
				<MenuItem onClick={() => handleLangChange('ru')}>
					<span className="flag flag-ru"></span>
					{t('Russian')}
				</MenuItem>
			</Menu>

			{/* User Menu */}
			<Menu
				anchorEl={userMenuAnchor}
				open={Boolean(userMenuAnchor)}
				onClose={handleUserMenuClose}
				className="user-menu"
			>
				<MenuItem onClick={() => router.push('/mypage')}>{t('My Profile')}</MenuItem>
				<MenuItem onClick={() => router.push('/mypage/applications')}>{t('My Applications')}</MenuItem>
				<MenuItem onClick={() => router.push('/mypage/settings')}>{t('Account Settings')}</MenuItem>
				<Divider />
				<MenuItem onClick={handleLogout}>
					<Logout fontSize="small" className="logout-icon" />
					{t('Logout')}
				</MenuItem>
			</Menu>
		</header>
	);
};

export default Top;
