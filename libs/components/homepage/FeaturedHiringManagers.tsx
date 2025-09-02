import React, { useState, useEffect } from 'react';
import { Box, Button, Skeleton, Typography, Chip, Avatar, Paper, Grid } from '@mui/material';
import { useTranslation } from 'next-i18next';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import { Direction } from '../../enums/common.enum';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_AGENTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import Image from 'next/image';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';

interface FeaturedHiringManagersProps {
	initialInput?: AgentsInquiry;
}

const FeaturedHiringManagers = ({ 
	initialInput = { 
		page: 1, 
		limit: 4, 
		sort: 'createdAt', 
		direction: Direction.DESC, 
		search: {} 
	} 
}: FeaturedHiringManagersProps) => {
	const { t, i18n } = useTranslation('common');
	const [featuredHiringManagers, setFeaturedHiringManagers] = useState<Member[]>([]);
	const [isClient, setIsClient] = useState(false);
	const router = useRouter();

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const { loading: getAgentsLoading, refetch: getAgentsRefetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFeaturedHiringManagers(data?.getAgents?.list || []);
		},
	});

	const toggleLikeMember = async (e: React.MouseEvent, memberId: string) => {
		e.preventDefault();
		e.stopPropagation();
		
		try {
			await likeTargetMember({ variables: { input: memberId } });
			await getAgentsRefetch();
		} catch (err) {
			console.error('Error toggling like:', err);
		}
	};

	const toggleFollowMember = async (e: React.MouseEvent, memberId: string) => {
		e.preventDefault();
		e.stopPropagation();
		
		try {
			const isFollowed = isMemberFollowed(featuredHiringManagers.find(m => m._id === memberId));
			if (isFollowed) {
				await unsubscribe({ variables: { input: memberId } });
			} else {
				await subscribe({ variables: { input: memberId } });
			}
			await getAgentsRefetch();
		} catch (err) {
			console.error('Error toggling follow:', err);
		}
	};

	const handleCardClick = (memberId: string) => {
		router.push(`/agent/detail?agentId=${memberId}`);
	};

	// Check if member is liked by current user
	const isMemberLiked = (member: Member) => {
		return Array.isArray(member?.meLiked) && member.meLiked.length > 0 && member.meLiked[0]?.myFavorite === true;
	};

	// Check if member is followed by current user
	const isMemberFollowed = (member: Member | undefined) => {
		return member?.meFollowed && Array.isArray(member.meFollowed) && member.meFollowed.length > 0 && member.meFollowed[0]?.myFollowing === true;
	};

	// Helper function to get time ago
	const getJoinedTime = (createdAt: Date | string) => {
		const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
		
		if (diffInDays === 0) return t('Today');
		if (diffInDays === 1) return t('Yesterday');
		if (diffInDays < 7) return t('{{days}} days ago', { days: diffInDays });
		if (diffInDays < 30) return t('{{weeks}} weeks ago', { weeks: Math.floor(diffInDays / 7) });
		if (diffInDays < 365) return t('{{months}} months ago', { months: Math.floor(diffInDays / 30) });
		return t('{{years}} years ago', { years: Math.floor(diffInDays / 365) });
	};

	const renderHiringManagerCard = (member: Member) => (
		<div className="featured-hiring-manager-card" onClick={() => handleCardClick(member._id)}>
			<div className="card-header">
				<div className="profile-section">
					<div className="avatar-container">
						<Avatar 
							src={(() => {
								// Check if memberImage exists and is valid
								if (!member?.memberImage || 
									member.memberImage === 'undefined' || 
									member.memberImage === 'null' ||
									member.memberImage.trim() === '') {
									return '/img/defaultMember.jpg';
								}
								
								// Check if it's already a full URL (starts with http/https)
								if (member.memberImage.startsWith('http://') || member.memberImage.startsWith('https://')) {
									return member.memberImage;
								}
								
								// Otherwise, prepend the API URL
								return `${REACT_APP_API_URL}/${member.memberImage}`;
							})()}
							className="member-avatar"
							sx={{ width: 80, height: 80 }}
						/>
						<div className="online-indicator"></div>
					</div>
					<div className="action-buttons">
						<Button
							className={`like-button ${isMemberLiked(member) ? 'liked' : ''}`}
							onClick={(e: any) => toggleLikeMember(e, member._id)}
							sx={{ minWidth: 'auto', p: 1 }}
						>
							{isMemberLiked(member) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						</Button>
						<Button
							className={`follow-button ${isMemberFollowed(member) ? 'followed' : ''}`}
							onClick={(e: any) => toggleFollowMember(e, member._id)}
							sx={{ minWidth: 'auto', p: 1 }}
						>
							<PersonAddIcon />
						</Button>
					</div>
				</div>

				<div className="member-info">
					<Typography className="member-name" variant="h6">
						{isClient ? member.memberNick : ''}
					</Typography>
					<Chip 
						icon={<BusinessIcon />} 
						label={isClient ? t('Recruiter') : ''} 
						size="small" 
						className="role-chip"
						sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
					/>
					{member.memberAddress && (
						<div className="location-info">
							<LocationOnOutlinedIcon fontSize="small" />
							<span>{isClient ? member.memberAddress : ''}</span>
						</div>
					)}
					{member.memberDesc && (
						<Typography className="member-bio" variant="body2">
							{isClient ? member.memberDesc : ''}
						</Typography>
					)}
				</div>
			</div>

			<div className="engagement-stats">
				<div className="stat-item">
					<WorkOutlineOutlinedIcon fontSize="small" />
					<span>{isClient ? t('Jobs Posted') : ''}</span>
					<span className="stat-value">{member.memberPostedJobs || 0}</span>
				</div>
				<div className="stat-item">
					<VisibilityOutlinedIcon fontSize="small" />
					<span>{isClient ? t('Profile Views') : ''}</span>
					<span className="stat-value">{member.memberViews || 0}</span>
				</div>
				<div className="stat-item">
					<FavoriteOutlinedIcon fontSize="small" />
					<span>{isClient ? t('Likes') : ''}</span>
					<span className="stat-value">{member.memberLikes || 0}</span>
				</div>
				<div className="stat-item">
					<PersonAddIcon fontSize="small" />
					<span>{isClient ? t('Followers') : ''}</span>
					<span className="stat-value">{member.memberFollowers || 0}</span>
				</div>
			</div>

			<div className="card-footer">
				<span className="joined-time">
					{isClient ? t('Joined {{time}}', { time: getJoinedTime(member.createdAt) }) : ''}
				</span>
				<Button 
					variant="contained" 
					className="view-profile-button" 
					size="small"
					onClick={(e: React.MouseEvent) => {
						e.stopPropagation();
						handleCardClick(member._id);
					}}
				>
					{isClient ? t('View Profile') : ''}
				</Button>
			</div>
		</div>
	);

	const renderSkeleton = () => (
		<div className="featured-hiring-manager-card skeleton">
			<div className="s-row">
				<Skeleton variant="circular" width={80} height={80} />
			</div>
			<Skeleton variant="text" width="90%" height={28} />
			<Skeleton variant="text" width="55%" />
			<div className="member-details">
				<Skeleton variant="text" width="40%" />
				<Skeleton variant="text" width="40%" />
			</div>
			<div className="stats-container">
				<Skeleton variant="rounded" width={60} height={24} />
				<Skeleton variant="rounded" width={70} height={24} />
				<Skeleton variant="rounded" width={65} height={24} />
				<Skeleton variant="rounded" width={75} height={24} />
			</div>
		</div>
	);

	if (!isClient) {
		return null;
	}

	return (
		<section className="featured-hiring-managers">
			<div className="featured-hiring-managers-container">
				<div className="section-header">
					<Typography className="section-title" variant="h3">
						{isClient ? t('Latest Hiring Managers') : ''}
					</Typography>
					<Typography className="section-subtitle" variant="body1">
						{isClient ? t('Connect with the most recent recruiters and hiring managers') : ''}
					</Typography>
				</div>

				<div className="hiring-managers-grid-container">
					{getAgentsLoading ? (
						<Grid container spacing={3}>
							{Array.from({ length: 4 }).map((_, index) => (
								<Grid item xs={12} sm={6} md={3} key={index}>
									{renderSkeleton()}
								</Grid>
							))}
						</Grid>
					) : (
						<Grid container spacing={3}>
							{featuredHiringManagers.map((member) => (
								<Grid item xs={12} sm={6} md={3} key={member._id}>
									{renderHiringManagerCard(member)}
								</Grid>
							))}
						</Grid>
					)}
				</div>

				<div className="view-all-section">
					<Button 
						variant="outlined" 
						className="view-all-button"
						onClick={() => router.push('/agent')}
					>
						{isClient ? t('View All Hiring Managers') : ''}
					</Button>
				</div>
			</div>
		</section>
	);
};

export default FeaturedHiringManagers;
