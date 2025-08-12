import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
	Stack, 
	Typography, 
	Box, 
	List, 
	ListItem, 
	IconButton,
	Avatar,
	Chip,
	Divider,
	Button
} from '@mui/material';
import { 
	Portrait as PortraitIcon,
	Add as AddIcon,
	Home as HomeIcon,
	Favorite as FavoriteIcon,
	Search as SearchIcon,
	Article as ArticleIcon,
	Edit as EditIcon,
	Person as PersonIcon,
	People as PeopleIcon,
	PersonAdd as PersonAddIcon,
	Logout as LogoutIcon,
	AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
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

	const isActive = (key: CategoryKey) => category === key;

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) {
				logOut();
			}
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err?.message);
		}
	};

	const getMenuIcon = (key: CategoryKey, isActive: boolean) => {
		const iconColor = isActive ? 'white' : '#666';
		const iconSize = 20;

		switch (key) {
			case 'addProperty': return <AddIcon sx={{ color: iconColor, fontSize: iconSize }} />;
			case 'myProperties': return <HomeIcon sx={{ color: iconColor, fontSize: iconSize }} />;
			case 'myFavorites': return <FavoriteIcon sx={{ color: iconColor, fontSize: iconSize }} />;
			case 'recentlyVisited': return <SearchIcon sx={{ color: iconColor, fontSize: iconSize }} />;
			case 'myArticles': return <ArticleIcon sx={{ color: iconColor, fontSize: iconSize }} />;
			case 'writeArticle': return <EditIcon sx={{ color: iconColor, fontSize: iconSize }} />;
			case 'myProfile': return <PersonIcon sx={{ color: iconColor, fontSize: iconSize }} />;
			case 'followers': return <PeopleIcon sx={{ color: iconColor, fontSize: iconSize }} />;
			case 'followings': return <PersonAddIcon sx={{ color: iconColor, fontSize: iconSize }} />;
			default: return <PortraitIcon sx={{ color: iconColor, fontSize: iconSize }} />;
		}
	};

	return (
		<Box sx={{ 
			bgcolor: 'white',
			borderRadius: 3,
			boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
			overflow: 'hidden'
		}}>
			{/* Profile Header */}
			<Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Avatar 
						src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/defaultMember.jpg'}
						sx={{ 
							width: 64, 
							height: 64,
							border: '3px solid #f0f0f0'
						}}
					/>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography variant="h6" sx={{ 
							fontWeight: 600,
							color: '#1a1a1a',
							mb: 0.5,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap'
						}}>
							{user?.memberNick ?? 'Guest'}
						</Typography>
						
						{user?.memberPhone && (
							<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
								{user.memberPhone}
							</Typography>
						)}

						{isAdmin ? (
							<Chip 
								label="ADMIN" 
								size="small" 
								color="error" 
								icon={<AdminIcon />}
								sx={{ fontSize: '0.7rem' }}
							/>
						) : (
							<Chip 
								label={user?.memberType || 'USER'} 
								size="small" 
								color="primary"
								sx={{ fontSize: '0.7rem' }}
							/>
						)}
					</Box>
				</Stack>
			</Box>

			{/* Navigation Menu */}
			<Box sx={{ p: 2 }}>
				{/* Manage Listings Section */}
				{isAgent && (
					<>
						<Typography variant="overline" sx={{ 
							color: 'text.secondary',
							fontWeight: 600,
							letterSpacing: 1,
							mb: 1,
							display: 'block'
						}}>
							MANAGE LISTINGS
						</Typography>
						
						<List sx={{ p: 0, mb: 2 }}>
							<ListItem sx={{ p: 0, mb: 1 }}>
								<Link
									href={{ pathname: '/mypage', query: { category: 'addProperty' } }}
									scroll={false}
									style={{ textDecoration: 'none', width: '100%' }}
								>
									<Button
										fullWidth
										startIcon={getMenuIcon('addProperty', isActive('addProperty'))}
										sx={{
											justifyContent: 'flex-start',
											px: 2,
											py: 1.5,
											borderRadius: 2,
											textTransform: 'none',
											fontWeight: 500,
											color: isActive('addProperty') ? 'white' : '#666',
											bgcolor: isActive('addProperty') ? '#2196F3' : 'transparent',
											'&:hover': {
												bgcolor: isActive('addProperty') ? '#1976D2' : '#f5f5f5'
											}
										}}
									>
										Create New Job
									</Button>
								</Link>
							</ListItem>

							<ListItem sx={{ p: 0, mb: 1 }}>
								<Link
									href={{ pathname: '/mypage', query: { category: 'myProperties' } }}
									scroll={false}
									style={{ textDecoration: 'none', width: '100%' }}
								>
									<Button
										fullWidth
										startIcon={getMenuIcon('myProperties', isActive('myProperties'))}
										sx={{
											justifyContent: 'flex-start',
											px: 2,
											py: 1.5,
											borderRadius: 2,
											textTransform: 'none',
											fontWeight: 500,
											color: isActive('myProperties') ? 'white' : '#666',
											bgcolor: isActive('myProperties') ? '#2196F3' : 'transparent',
											'&:hover': {
												bgcolor: isActive('myProperties') ? '#1976D2' : '#f5f5f5'
											}
										}}
									>
										My Posted Jobs
									</Button>
								</Link>
							</ListItem>
						</List>

						<Divider sx={{ my: 2 }} />
					</>
				)}

				{/* Personal Section */}
				<Typography variant="overline" sx={{ 
					color: 'text.secondary',
					fontWeight: 600,
					letterSpacing: 1,
					mb: 1,
					display: 'block'
				}}>
					PERSONAL
				</Typography>

				<List sx={{ p: 0, mb: 2 }}>
					<ListItem sx={{ p: 0, mb: 1 }}>
						<Link
							href={{ pathname: '/mypage', query: { category: 'myProfile' } }}
							scroll={false}
							style={{ textDecoration: 'none', width: '100%' }}
						>
							<Button
								fullWidth
								startIcon={getMenuIcon('myProfile', isActive('myProfile'))}
								sx={{
									justifyContent: 'flex-start',
									px: 2,
									py: 1.5,
									borderRadius: 2,
									textTransform: 'none',
									fontWeight: 500,
									color: isActive('myProfile') ? 'white' : '#666',
									bgcolor: isActive('myProfile') ? '#2196F3' : 'transparent',
									'&:hover': {
										bgcolor: isActive('myProfile') ? '#1976D2' : '#f5f5f5'
									}
								}}
							>
								My Profile
							</Button>
						</Link>
					</ListItem>

					<ListItem sx={{ p: 0, mb: 1 }}>
						<Link
							href={{ pathname: '/mypage', query: { category: 'myFavorites' } }}
							scroll={false}
							style={{ textDecoration: 'none', width: '100%' }}
						>
							<Button
								fullWidth
								startIcon={getMenuIcon('myFavorites', isActive('myFavorites'))}
								sx={{
									justifyContent: 'flex-start',
									px: 2,
									py: 1.5,
									borderRadius: 2,
									textTransform: 'none',
									fontWeight: 500,
									color: isActive('myFavorites') ? 'white' : '#666',
									bgcolor: isActive('myFavorites') ? '#2196F3' : 'transparent',
									'&:hover': {
										bgcolor: isActive('myFavorites') ? '#1976D2' : '#f5f5f5'
									}
								}}
							>
								My Favorites
							</Button>
						</Link>
					</ListItem>

					<ListItem sx={{ p: 0, mb: 1 }}>
						<Link
							href={{ pathname: '/mypage', query: { category: 'recentlyVisited' } }}
							scroll={false}
							style={{ textDecoration: 'none', width: '100%' }}
						>
							<Button
								fullWidth
								startIcon={getMenuIcon('recentlyVisited', isActive('recentlyVisited'))}
								sx={{
									justifyContent: 'flex-start',
									px: 2,
									py: 1.5,
									borderRadius: 2,
									textTransform: 'none',
									fontWeight: 500,
									color: isActive('recentlyVisited') ? 'white' : '#666',
									bgcolor: isActive('recentlyVisited') ? '#2196F3' : 'transparent',
									'&:hover': {
										bgcolor: isActive('recentlyVisited') ? '#1976D2' : '#f5f5f5'
									}
								}}
							>
								Recently Visited
							</Button>
						</Link>
					</ListItem>
				</List>

				<Divider sx={{ my: 2 }} />

				{/* Community Section */}
				<Typography variant="overline" sx={{ 
					color: 'text.secondary',
					fontWeight: 600,
					letterSpacing: 1,
					mb: 1,
					display: 'block'
				}}>
					COMMUNITY
				</Typography>

				<List sx={{ p: 0, mb: 2 }}>
					<ListItem sx={{ p: 0, mb: 1 }}>
						<Link
							href={{ pathname: '/mypage', query: { category: 'myArticles' } }}
							scroll={false}
							style={{ textDecoration: 'none', width: '100%' }}
						>
							<Button
								fullWidth
								startIcon={getMenuIcon('myArticles', isActive('myArticles'))}
								sx={{
									justifyContent: 'flex-start',
									px: 2,
									py: 1.5,
									borderRadius: 2,
									textTransform: 'none',
									fontWeight: 500,
									color: isActive('myArticles') ? 'white' : '#666',
									bgcolor: isActive('myArticles') ? '#2196F3' : 'transparent',
									'&:hover': {
										bgcolor: isActive('myArticles') ? '#1976D2' : '#f5f5f5'
									}
								}}
							>
								My Articles
							</Button>
						</Link>
					</ListItem>

					<ListItem sx={{ p: 0, mb: 1 }}>
						<Link
							href={{ pathname: '/mypage', query: { category: 'writeArticle' } }}
							scroll={false}
							style={{ textDecoration: 'none', width: '100%' }}
						>
							<Button
								fullWidth
								startIcon={getMenuIcon('writeArticle', isActive('writeArticle'))}
								sx={{
									justifyContent: 'flex-start',
									px: 2,
									py: 1.5,
									borderRadius: 2,
									textTransform: 'none',
									fontWeight: 500,
									color: isActive('writeArticle') ? 'white' : '#666',
									bgcolor: isActive('writeArticle') ? '#2196F3' : 'transparent',
									'&:hover': {
										bgcolor: isActive('writeArticle') ? '#1976D2' : '#f5f5f5'
									}
								}}
							>
								Write Article
							</Button>
						</Link>
					</ListItem>

					<ListItem sx={{ p: 0, mb: 1 }}>
						<Link
							href={{ pathname: '/mypage', query: { category: 'followers' } }}
							scroll={false}
							style={{ textDecoration: 'none', width: '100%' }}
						>
							<Button
								fullWidth
								startIcon={getMenuIcon('followers', isActive('followers'))}
								sx={{
									justifyContent: 'flex-start',
									px: 2,
									py: 1.5,
									borderRadius: 2,
									textTransform: 'none',
									fontWeight: 500,
									color: isActive('followers') ? 'white' : '#666',
									bgcolor: isActive('followers') ? '#2196F3' : 'transparent',
									'&:hover': {
										bgcolor: isActive('followers') ? '#1976D2' : '#f5f5f5'
									}
								}}
							>
								My Followers
							</Button>
						</Link>
					</ListItem>

					<ListItem sx={{ p: 0, mb: 1 }}>
						<Link
							href={{ pathname: '/mypage', query: { category: 'followings' } }}
							scroll={false}
							style={{ textDecoration: 'none', width: '100%' }}
						>
							<Button
								fullWidth
								startIcon={getMenuIcon('followings', isActive('followings'))}
								sx={{
									justifyContent: 'flex-start',
									px: 2,
									py: 1.5,
									borderRadius: 2,
									textTransform: 'none',
									fontWeight: 500,
									color: isActive('followings') ? 'white' : '#666',
									bgcolor: isActive('followings') ? '#2196F3' : 'transparent',
									'&:hover': {
										bgcolor: isActive('followings') ? '#1976D2' : '#f5f5f5'
									}
								}}
							>
								My Followings
							</Button>
						</Link>
					</ListItem>
				</List>

				<Divider sx={{ my: 2 }} />

				{/* Logout Button */}
				<Button
					fullWidth
					startIcon={<LogoutIcon />}
					onClick={logoutHandler}
					sx={{
						justifyContent: 'flex-start',
						px: 2,
						py: 1.5,
						borderRadius: 2,
						textTransform: 'none',
						fontWeight: 500,
						color: '#666',
						bgcolor: 'transparent',
						'&:hover': {
							bgcolor: '#ffebee',
							color: '#d32f2f'
						}
					}}
				>
					Logout
				</Button>
			</Box>
		</Box>
	);
};

export default MyMenu;
