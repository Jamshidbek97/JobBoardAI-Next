import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography, Chip, IconButton, Button } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import {
	RemoveRedEye as VisibilityIcon,
	Favorite as FavoriteIcon,
	FavoriteBorder as FavoriteBorderIcon,
	PersonAdd as FollowIcon,
	PersonRemove as UnfollowIcon,
	Work as WorkIcon,
	Star as StarIcon,
	LocationOn as LocationIcon,
	Business as BusinessIcon,
	AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import Image from 'next/image';

interface AgentCardProps {
	agent: any;
	likeMemberHandler: any;
	followMemberHandler?: any;
}

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler, followMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);

	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/defaultMember.jpg';

	// Check if current user has liked this hiring manager
	const isLiked = agent?.meLiked && agent?.meLiked[0]?.myFavorite;

	// Check if current user is following this hiring manager
	const isFollowing = agent?.meFollowed && agent?.meFollowed.length > 0 && agent?.meFollowed[0]?.myFollowing === true;

	// Format member type for display
	const getMemberTypeDisplay = (type: string) => {
		switch (type?.toLowerCase()) {
			case 'admin':
				return 'Admin';
			case 'member':
				return 'Hiring Manager';
			case 'agent':
				return 'Recruiter';
			default:
				return 'Hiring Manager';
		}
	};

	// Get time since member joined
	const getTimeSinceJoined = (createdAt: string) => {
		if (!createdAt) return 'Recently joined';
		const createdDate = new Date(createdAt);
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
		if (diffDays === 0) return 'Joined today';
		if (diffDays === 1) return 'Joined yesterday';
		if (diffDays < 7) return `Joined ${diffDays} days ago`;
		if (diffDays < 30) return `Joined ${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `Joined ${Math.floor(diffDays / 30)} months ago`;
		return `Joined ${Math.floor(diffDays / 365)} years ago`;
	};

	// Handle follow/unfollow
	const handleFollowToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (followMemberHandler) {
			followMemberHandler(user, agent?._id);
		}
	};

	// Handle like toggle
	const handleLikeToggle = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (likeMemberHandler) {
			likeMemberHandler(user, agent?._id);
		}
	};

	return (
		<Stack className="hiring-manager-card">
			{/* Header with image and status */}
			<Box className="card-header">
				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
					className="profile-link"
				>
					<Box className="profile-image-container">
						<Image
							src={imagePath}
							alt={`${agent?.memberFullName || agent?.memberNick} profile`}
							width={80}
							height={80}
							className="profile-image"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.src = '/img/defaultMember.jpg';
							}}
						/>
						{agent?.memberStatus === 'ACTIVE' && <Box className="status-indicator active" />}
					</Box>
				</Link>

				<Box className="header-actions">
					<IconButton
						className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
						onClick={handleLikeToggle}
						aria-label={isLiked ? 'Unlike' : 'Like'}
						title={isLiked ? 'Unlike' : 'Like'}
					>
						{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</IconButton>

					{followMemberHandler && (
						<IconButton
							className={`action-btn follow-btn ${isFollowing ? 'following' : ''}`}
							onClick={handleFollowToggle}
							aria-label={isFollowing ? 'Unfollow' : 'Follow'}
							title={isFollowing ? 'Unfollow' : 'Follow'}
						>
							{isFollowing ? <UnfollowIcon /> : <FollowIcon />}
						</IconButton>
					)}
				</Box>
			</Box>

			{/* Profile Info */}
			<Box className="profile-info">
				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
					className="name-link"
				>
					<Typography className="member-name">{agent?.memberFullName || agent?.memberNick || 'Anonymous'}</Typography>
				</Link>

				<Box className="member-meta">
					<Chip
						icon={<BusinessIcon />}
						label={getMemberTypeDisplay(agent?.memberType)}
						className="member-type-chip"
						size="small"
					/>
					{agent?.memberAddress && (
						<Box className="location-info">
							<LocationIcon className="location-icon" />
							<Typography className="location-text">{agent.memberAddress}</Typography>
						</Box>
					)}
				</Box>

				{agent?.memberDesc && (
					<Typography className="member-description">
						{agent.memberDesc.length > 100 ? `${agent.memberDesc.substring(0, 100)}...` : agent.memberDesc}
					</Typography>
				)}
			</Box>

			{/* Stats Grid */}
			<Box className="stats-grid">
				<Box className="stat-item">
					<WorkIcon className="stat-icon" />
					<Box className="stat-content">
						<Typography className="stat-value">{agent?.memberPostedJobs || 0}</Typography>
						<Typography className="stat-label">Jobs Posted</Typography>
					</Box>
				</Box>

				<Box className="stat-item">
					<VisibilityIcon className="stat-icon" />
					<Box className="stat-content">
						<Typography className="stat-value">{agent?.memberViews || 0}</Typography>
						<Typography className="stat-label">Profile Views</Typography>
					</Box>
				</Box>

				<Box className="stat-item">
					<FavoriteIcon className="stat-icon" />
					<Box className="stat-content">
						<Typography className="stat-value">{agent?.memberLikes || 0}</Typography>
						<Typography className="stat-label">Likes</Typography>
					</Box>
				</Box>

				<Box className="stat-item">
					<FollowIcon className="stat-icon" />
					<Box className="stat-content">
						<Typography className="stat-value">{agent?.memberFollowers || 0}</Typography>
						<Typography className="stat-label">Followers</Typography>
					</Box>
				</Box>
			</Box>

			{/* Footer */}
			<Box className="card-footer">
				<Box className="join-info">
					<TimeIcon className="time-icon" />
					<Typography className="join-text">{getTimeSinceJoined(agent?.createdAt)}</Typography>
				</Box>

				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
					className="view-profile-link"
				>
					<Button variant="outlined" size="small" className="view-profile-btn">
						View Profile
					</Button>
				</Link>
			</Box>
		</Stack>
	);
};

export default AgentCard;
