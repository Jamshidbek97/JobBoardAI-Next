import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import Top from '../Top';
import Footer from '../Footer';
import Chat from '../Chat';
import { getJwtToken, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';

type LayoutOverrides = {
	hideHero?: boolean;
	title?: string;
	desc?: string;
};

type LayoutWrappedComponent = React.ComponentType & {
	layoutOverrides?: LayoutOverrides;
};

const routeMeta: Record<string, { title: string; desc: string }> = {
	'/': { title: 'JobBoardAI', desc: 'Your AI Job Hunter — faster applications, more interviews.' },
	'/job': { title: 'Jobs', desc: 'Fresh roles matched to your profile.' },
	'/agent': { title: 'Agents', desc: 'Meet the AI agents that apply for you.' },
	'/agent/detail': { title: 'Agent', desc: 'Agent overview & performance.' },
	'/mypage': { title: 'My Page', desc: 'Your applications, responses, and interviews.' },
	'/community': { title: 'Community', desc: 'Tips, templates, and interview advice.' },
	'/community/detail': { title: 'Community', desc: 'Discussion & insights.' },
	'/cs': { title: 'Support', desc: 'We’re here to help.' },
	'/member': { title: 'Member', desc: 'Profile, settings & preferences.' },
	// Auth (dynamic)
	'/account/login': { title: 'Login', desc: 'Welcome back.' },
	'/account/join': { title: 'Sign Up', desc: 'Create your account in seconds.' },
};

const withLayoutBasic = (Component: LayoutWrappedComponent) => {
	const Wrapped = (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');
		const user = useReactiveVar(userVar);

		// Pull per-page overrides if provided
		const overrides: LayoutOverrides = Component.layoutOverrides ?? {};

		// Update user info if JWT exists
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		// Resolve meta by pathname (fallback to dynamic auth if needed)
		const { title, desc } = useMemo(() => {
			const path = router.pathname;
			// When using dynamic route like /account/[view], resolve from asPath
			if (path.startsWith('/account/')) {
				const isLogin = router.asPath.includes('/account/login');
				return isLogin ? routeMeta['/account/login'] : routeMeta['/account/join'];
			}
			return routeMeta[path] ?? routeMeta['/'];
		}, [router.pathname, router.asPath]);

		const finalTitle = overrides.title ?? title;
		const finalDesc = overrides.desc ?? desc;

		const hideHero = overrides.hideHero ?? router.pathname.startsWith('/account');

		return (
			<>
				<Head>
					<title>{finalTitle} · JobBoardAI</title>
					<meta name="title" content={`${finalTitle} · JobBoardAI`} />
					<meta name="description" content={finalDesc} />
					<meta property="og:title" content={`${finalTitle} · JobBoardAI`} />
					<meta property="og:description" content={finalDesc} />
					<meta property="og:type" content="website" />
					<meta name="theme-color" content="#4f46e5" />
					{/* Swiper styles remain global */}
					<link rel="preconnect" href="https://fonts.gstatic.com" />
				</Head>

				<Stack id="pc-wrap">
					<Stack id="top">
						<Top />
					</Stack>

					{!hideHero && (
						<Stack className="jb-hero">
							<div className="jb-hero__bg" aria-hidden />
							<Stack className="container">
								<strong className="jb-hero__title">{t(finalTitle)}</strong>
								<span className="jb-hero__desc">{t(finalDesc)}</span>
							</Stack>
						</Stack>
					)}

					<Stack id="main">
						<Component {...props} />
					</Stack>

					{user?._id && <Chat />}

					<Stack id="footer">
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	};

	// Preserve display name for DevTools
	Wrapped.displayName = `withLayoutBasic(${Component.displayName || Component.name || 'Component'})`;
	return Wrapped;
};

export default withLayoutBasic;
