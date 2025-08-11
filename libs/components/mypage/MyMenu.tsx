import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem, IconButton } from '@mui/material';
import PortraitIcon from '@mui/icons-material/Portrait';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';

type CategoryKey =
	| 'addProperty'
	| 'myProperties'
	| 'myFavorites'
	| 'recentlyVisited'
	| 'myArticles'
	| 'writeArticle'
	| 'myProfile'
	| 'followers'
	| 'followings';

const MyMenu: React.FC = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	// normalize category (handles string[] | string | undefined)
	const category = useMemo<CategoryKey>(() => {
		const q = router.query?.category;
		const val = Array.isArray(q) ? q[0] : q;
		const fallback: CategoryKey = 'myProfile';
		const all: CategoryKey[] = [
			'addProperty',
			'myProperties',
			'myFavorites',
			'recentlyVisited',
			'myArticles',
			'writeArticle',
			'myProfile',
			'followers',
			'followings',
		];
		return (all.includes(val as CategoryKey) ? (val as CategoryKey) : fallback) as CategoryKey;
	}, [router.query?.category]);

	const isAgent = user?.memberType === 'AGENT';
	const isAdmin = user?.memberType === 'ADMIN';

	const isActive = (key: CategoryKey) => (category === key ? 'focus' : '');

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) {
				logOut();
			}
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err?.message);
		}
	};

	return (
		<Stack
			width="100%"
			padding="30px 24px"
			className="my-menu"
			sx={{
				position: { md: 'sticky' },
				top: { md: 24 },
				gap: 2,
			}}
		>
			{/* Profile header */}
			<Stack className="profile" direction="row" alignItems="center" gap={2}>
				<Box
					component="div"
					className="profile-img"
					sx={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden' }}
				>
					<img
						src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/defaultMember.jpg'}
						alt="member-photo"
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				</Box>

				<Stack className="user-info" minWidth={0}>
					<Typography className="user-name" noWrap>
						{user?.memberNick ?? 'Guest'}
					</Typography>

					{user?.memberPhone && (
						<Box component="div" className="user-phone" display="flex" alignItems="center" gap={0.75}>
							<img src="/img/icons/call.svg" alt="phone" />
							<Typography className="p-number">{user.memberPhone}</Typography>
						</Box>
					)}

					{isAdmin ? (
						<a href="/_admin/users" target="_blank" rel="noreferrer">
							<Typography className="view-list">ADMIN</Typography>
						</a>
					) : (
						<Typography className="view-list">{user?.memberType || 'USER'}</Typography>
					)}
				</Stack>
			</Stack>

			{/* Sections */}
			<Stack className="sections" gap={2}>
				{/* Manage Listings */}
				<Stack className="section" sx={{ mt: 1 }}>
					<Typography className="title" variant="h5">
						MANAGE LISTINGS
					</Typography>

					<List className="sub-section" sx={{ p: 0 }}>
						{isAgent && (
							<>
								<ListItem className={isActive('addProperty')}>
									<Link
										href={{ pathname: '/mypage', query: { category: 'addProperty' } }}
										scroll={false}
										className="w-100"
									>
										<div className="flex-box">
											{category === 'addProperty' ? (
												<img className="com-icon" src="/img/icons/whiteTab.svg" alt="add" />
											) : (
												<img className="com-icon" src="/img/icons/newTab.svg" alt="add" />
											)}
											<Typography className="sub-title" variant="subtitle1" component="p">
												Create new Job
											</Typography>
											<IconButton aria-label="decor" sx={{ ml: 'auto' }}>
												<PortraitIcon />
											</IconButton>
										</div>
									</Link>
								</ListItem>

								<ListItem className={isActive('myProperties')}>
									<Link
										href={{ pathname: '/mypage', query: { category: 'myProperties' } }}
										scroll={false}
										className="w-100"
									>
										<div className="flex-box">
											{category === 'myProperties' ? (
												<img className="com-icon" src="/img/icons/homeWhite.svg" alt="props" />
											) : (
												<img className="com-icon" src="/img/icons/home.svg" alt="props" />
											)}
											<Typography className="sub-title" variant="subtitle1" component="p">
												My Posted Jobs
											</Typography>
											<IconButton aria-label="decor" sx={{ ml: 'auto' }}>
												<PortraitIcon />
											</IconButton>
										</div>
									</Link>
								</ListItem>
							</>
						)}

						<ListItem className={isActive('myFavorites')}>
							<Link href={{ pathname: '/mypage', query: { category: 'myFavorites' } }} scroll={false} className="w-100">
								<div className="flex-box">
									{category === 'myFavorites' ? (
										<img className="com-icon" src="/img/icons/likeWhite.svg" alt="favorites" />
									) : (
										<img className="com-icon" src="/img/icons/like.svg" alt="favorites" />
									)}
									<Typography className="sub-title" variant="subtitle1" component="p">
										My Favorites
									</Typography>
								</div>
							</Link>
						</ListItem>

						<ListItem className={isActive('recentlyVisited')}>
							<Link
								href={{ pathname: '/mypage', query: { category: 'recentlyVisited' } }}
								scroll={false}
								className="w-100"
							>
								<div className="flex-box">
									{category === 'recentlyVisited' ? (
										<img className="com-icon" src="/img/icons/searchWhite.svg" alt="recent" />
									) : (
										<img className="com-icon" src="/img/icons/search.svg" alt="recent" />
									)}
									<Typography className="sub-title" variant="subtitle1" component="p">
										Recently Visited
									</Typography>
								</div>
							</Link>
						</ListItem>

						<ListItem className={isActive('followers')}>
							<Link href={{ pathname: '/mypage', query: { category: 'followers' } }} scroll={false} className="w-100">
								<div className="flex-box">
									<svg
										className="com-icon"
										fill={category === 'followers' ? 'white' : 'black'}
										height="16px"
										width="16px"
										viewBox="0 0 328 328"
									>
										<g>
											<path d="M52.25,64.001c0,34.601,28.149,62.749,62.75,62.749c34.602,0,62.751-28.148,62.751-62.749 S149.602,1.25,115,1.25C80.399,1.25,52.25,29.4,52.25,64.001z" />
											<path d="M217.394,262.357c2.929,2.928,6.768,4.393,10.606,4.393c3.839,0,7.678-1.465,10.607-4.394 c5.857-5.858,5.857-15.356-0.001-21.214l-19.393-19.391l19.395-19.396c5.857-5.858,5.857-15.356-0.001-21.214 c-5.858-5.857-15.356-5.856-21.214,0.001l-30,30.002c-2.813,2.814-4.393,6.629-4.393,10.607c0,3.979,1.58,7.794,4.394,10.607 L217.394,262.357z" />
											<path d="M15,286.75h125.596c19.246,24.348,49.031,40,82.404,40c57.896,0,105-47.103,105-105 c0-57.896-47.104-105-105-105c-34.488,0-65.145,16.716-84.297,42.47c-7.764-1.628-15.695-2.47-23.703-2.47 c-63.411,0-115,51.589-115,115C0,280.034,6.716,286.75,15,286.75z M223,146.75c41.355,0,75,33.645,75,75s-33.645,75-75,75 s-75-33.645-75-75S181.644,146.75,223,146.75z" />
										</g>
									</svg>
									<Typography className="sub-title" variant="subtitle1" component="p">
										My Followers
									</Typography>
								</div>
							</Link>
						</ListItem>

						<ListItem className={isActive('followings')}>
							<Link href={{ pathname: '/mypage', query: { category: 'followings' } }} scroll={false} className="w-100">
								<div className="flex-box">
									<svg
										className="com-icon"
										fill={category === 'followings' ? 'white' : 'black'}
										height="16px"
										width="16px"
										viewBox="0 0 328 328"
									>
										<g>
											<path d="M177.75,64.001C177.75,29.4,149.601,1.25,115,1.25c-34.602,0-62.75,28.15-62.75,62.751 S80.398,126.75,115,126.75C149.601,126.75,177.75,98.602,177.75,64.001z" />
											<path d="M228.606,181.144c-5.858-5.857-15.355-5.858-21.214-0.001c-5.857,5.857-5.857,15.355,0,21.214 l19.393,19.396l-19.393,19.391c-5.857,5.857-5.857,15.355,0,21.214c2.93,2.929,6.768,4.394,10.607,4.394 c3.838,0,7.678-1.465,10.605-4.393l30-29.998c2.813-2.814,4.395-6.629,4.395-10.607c0-3.978-1.58-7.793-4.394-10.607 L228.606,181.144z" />
											<path d="M223,116.75c-34.488,0-65.145,16.716-84.298,42.47c-7.763-1.628-15.694-2.47-23.702-2.47 c-63.412,0-115,51.589-115,115c0,8.284,6.715,15,15,15h125.596c19.246,24.348,49.03,40,82.404,40c57.896,0,105-47.103,105-105 C328,163.854,280.896,116.75,223,116.75z M223,296.75c-41.356,0-75-33.645-75-75s33.644-75,75-75c41.354,0,75,33.645,75,75 S264.354,296.75,223,296.75z" />
										</g>
									</svg>
									<Typography className="sub-title" variant="subtitle1" component="p">
										My Followings
									</Typography>
								</div>
							</Link>
						</ListItem>
					</List>
				</Stack>

				{/* Community */}
				<Stack className="section" sx={{ mt: 1 }}>
					<Typography className="title" variant="h5">
						Community
					</Typography>
					<List className="sub-section" sx={{ p: 0 }}>
						<ListItem className={isActive('myArticles')}>
							<Link href={{ pathname: '/mypage', query: { category: 'myArticles' } }} scroll={false} className="w-100">
								<div className="flex-box">
									{category === 'myArticles' ? (
										<img className="com-icon" src="/img/icons/discoveryWhite.svg" alt="articles" />
									) : (
										<img className="com-icon" src="/img/icons/discovery.svg" alt="articles" />
									)}
									<Typography className="sub-title" variant="subtitle1" component="p">
										Articles
									</Typography>
								</div>
							</Link>
						</ListItem>

						<ListItem className={isActive('writeArticle')}>
							<Link
								href={{ pathname: '/mypage', query: { category: 'writeArticle' } }}
								scroll={false}
								className="w-100"
							>
								<div className="flex-box">
									{category === 'writeArticle' ? (
										<img className="com-icon" src="/img/icons/whiteTab.svg" alt="write" />
									) : (
										<img className="com-icon" src="/img/icons/newTab.svg" alt="write" />
									)}
									<Typography className="sub-title" variant="subtitle1" component="p">
										Write Article
									</Typography>
								</div>
							</Link>
						</ListItem>
					</List>
				</Stack>

				{/* Manage Account */}
				<Stack className="section" sx={{ mt: 3 }}>
					<Typography className="title" variant="h5">
						MANAGE ACCOUNT
					</Typography>
					<List className="sub-section" sx={{ p: 0 }}>
						<ListItem className={isActive('myProfile')}>
							<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }} scroll={false} className="w-100">
								<div className="flex-box">
									{category === 'myProfile' ? (
										<img className="com-icon" src="/img/icons/userWhite.svg" alt="profile" />
									) : (
										<img className="com-icon" src="/img/icons/user.svg" alt="profile" />
									)}
									<Typography className="sub-title" variant="subtitle1" component="p">
										My Profile
									</Typography>
								</div>
							</Link>
						</ListItem>

						<ListItem onClick={logoutHandler} sx={{ cursor: 'pointer' }}>
							<div className="flex-box">
								<img className="com-icon" src="/img/icons/logout.svg" alt="logout" />
								<Typography className="sub-title" variant="subtitle1" component="p">
									Logout
								</Typography>
							</div>
						</ListItem>
					</List>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default MyMenu;
