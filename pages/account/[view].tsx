'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	IconButton,
	Stack,
	TextField,
	Typography,
	InputAdornment,
	Divider,
	Paper,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhoneIphoneOutlined from '@mui/icons-material/PhoneIphoneOutlined';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [{ params: { view: 'login' } }, { params: { view: 'join' } }],
		fallback: 'blocking',
	};
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale as string, ['common'])),
	},
});

const AuthView: NextPage = () => {
	const router = useRouter();
	const view = (router.query.view as string) || 'login';
	const isLogin = useMemo(() => view === 'login', [view]);

	const [showPassword, setShowPassword] = useState(false);
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' as 'USER' | 'AGENT' });
	const [remember, setRemember] = useState(true);
	const [loading, setLoading] = useState(false);

	const handleInput = useCallback((name: keyof typeof input, value: string) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	}, []);

	const doLogin = useCallback(async () => {
		if (!input.nick || !input.password) return;
		try {
			setLoading(true);
			await logIn(input.nick, input.password);
			await router.push(`${(router.query.referrer as string) ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setLoading(false);
		}
	}, [input, router]);

	const doSignUp = useCallback(async () => {
		if (!input.nick || !input.password || !input.phone || !input.type) return;
		try {
			setLoading(true);
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${(router.query.referrer as string) ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setLoading(false);
		}
	}, [input, router]);

	const goto = (next: 'login' | 'join') => {
		if (next === view) return;
		router.replace(`/account/${next}`);
	};

	return (
		<Stack className="auth">
			<div className="auth__bg" aria-hidden />

			<Stack className="auth__container">
				<Box className="auth__split">
					<Paper elevation={0} className="auth__card">
						{/* Logo */}
						<Box className="auth__logo">
							<img src="/img/logo/logoText.svg" alt="JobBoardAI" />
							<span>JobBoardAI</span>
						</Box>

						<Box className="auth__title">
							<Typography variant="h4">{isLogin ? 'Welcome back' : 'Create your account'}</Typography>
							<Typography className="auth__subtitle">
								{isLogin
									? 'Log in to continue your job search.'
									: 'Sign up and let your AI agent apply while you sleep.'}
							</Typography>
						</Box>

						<Stack
							className="auth__form"
							spacing={1.75}
							onKeyDown={(e: any) => {
								if (e.key === 'Enter') {
									isLogin ? doLogin() : doSignUp();
								}
							}}
						>
							<TextField
								fullWidth
								label="Nickname"
								value={input.nick}
								onChange={(e) => handleInput('nick', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<PersonOutline fontSize="small" />
										</InputAdornment>
									),
								}}
							/>

							<TextField
								fullWidth
								type={showPassword ? 'text' : 'password'}
								label="Password"
								value={input.password}
								onChange={(e) => handleInput('password', e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LockOutlined fontSize="small" />
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position="end">
											<IconButton onClick={() => setShowPassword((s) => !s)} edge="end" aria-label="toggle password">
												{showPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>

							{!isLogin && (
								<TextField
									fullWidth
									label="Phone"
									value={input.phone}
									onChange={(e) => handleInput('phone', e.target.value)}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<PhoneIphoneOutlined fontSize="small" />
											</InputAdornment>
										),
									}}
								/>
							)}

							{/* Options */}
							{!isLogin ? (
								<Box className="auth__register">
									<span className="text">I want to be registered as:</span>
									<div>
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														checked={input.type === 'USER'}
														onChange={() => handleInput('type', 'USER')}
													/>
												}
												label="User"
											/>
										</FormGroup>
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														checked={input.type === 'AGENT'}
														onChange={() => handleInput('type', 'AGENT')}
													/>
												}
												label="Company"
											/>
										</FormGroup>
									</div>
								</Box>
							) : (
								<Box className="auth__remember">
									<FormGroup>
										<FormControlLabel
											control={
												<Checkbox size="small" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
											}
											label="Remember me"
										/>
									</FormGroup>
									<a className="auth__link" href="#">
										Lost your password?
									</a>
								</Box>
							)}

							<Button
								className="auth__cta"
								variant="contained"
								endIcon={<ArrowOutwardIcon />}
								disabled={
									loading || (isLogin ? !input.nick || !input.password : !input.nick || !input.password || !input.phone)
								}
								onClick={isLogin ? doLogin : doSignUp}
							>
								{isLogin ? 'Login' : 'Sign up'}
							</Button>

							<Box className="auth__switch">
								{isLogin ? (
									<Typography variant="body2">
										Not registered yet? <b onClick={() => goto('join')}>Sign up</b>
									</Typography>
								) : (
									<Typography variant="body2">
										Already have an account? <b onClick={() => goto('login')}>Log in</b>
									</Typography>
								)}
							</Box>

							<Divider className="auth__or">OR</Divider>

							{/* Providers split left/right with icons */}
							<Stack direction="row" spacing={1} className="auth__providers">
								<Button
									variant="outlined"
									className="auth__btn auth__btn--google"
									startIcon={<img src="/img/brands/g.png" alt="Google" />}
								>
									Continue with Google
								</Button>
								<Button
									variant="outlined"
									className="auth__btn auth__btn--github"
									startIcon={<img src="/img/brands/github.png" alt="GitHub" />}
								>
									Continue with GitHub
								</Button>
							</Stack>
						</Stack>
					</Paper>

					{/* Right – Visual */}
					<Box className="auth__right">
						<div className="auth__right-glow" />
						<div className="auth__right-card">
							<h3>Faster hiring with JobBoardAI</h3>
							<p>Auto‑apply the moment a role is posted, track responses, and get interview‑ready insights.</p>
							<ul>
								<li>⚡ First‑mover applications</li>
								<li>🤖 Smart matching and filters</li>
								<li>📈 Responses and interview tracking</li>
							</ul>

							<div className="auth__stats">
								<div className="stat">
									<b>26</b>
									<span>apps today</span>
								</div>
								<div className="stat">
									<b>86%</b>
									<span>match score</span>
								</div>
								<div className="stat">
									<b>1.8d</b>
									<span>avg response</span>
								</div>
							</div>
						</div>
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(AuthView);
