import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { 
	Stack, 
	Typography, 
	Box, 
	Avatar, 
	IconButton, 
	Chip,
	Card,
	CardContent,
	CardMedia,
	CardActions,
	Tooltip,
	Fade
} from '@mui/material';
import { 
	RemoveRedEye as ViewIcon,
	Favorite as FavoriteIcon,
	FavoriteBorder as FavoriteBorderIcon,
	Person as PersonIcon,
	AccessTime as TimeIcon
} from '@mui/icons-material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeArticleHandler: any;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, size = 'normal', likeArticleHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const imagePath: string = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: '/img/community/communityImg.png';

	/** HANDLERS **/
	const chooseArticleHandler = (e: React.SyntheticEvent, boardArticle: BoardArticle) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'FREE': return '#2196F3';
			case 'RECOMMEND': return '#4CAF50';
			case 'NEWS': return '#FF9800';
			case 'HUMOR': return '#E91E63';
			default: return '#2196F3';
		}
	};

	const getCategoryLabel = (category: string) => {
		switch (category) {
			case 'FREE': return 'Free Board';
			case 'RECOMMEND': return 'Recommendation';
			case 'NEWS': return 'News';
			case 'HUMOR': return 'Humor';
			default: return 'Community';
		}
	};

	if (device === 'mobile') {
		return <div>COMMUNITY CARD MOBILE</div>;
	} else {
		return (
			<Fade in={true} timeout={600}>
				<Card 
					sx={{ 
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						cursor: 'pointer',
						transition: 'all 0.3s ease-in-out',
						'&:hover': {
							transform: 'translateY(-4px)',
							boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
						},
						borderRadius: 3,
						overflow: 'hidden',
						border: '1px solid rgba(0,0,0,0.08)'
					}}
					onClick={(e: any) => chooseArticleHandler(e, boardArticle)}
				>
					{/* Image Section */}
					<Box sx={{ position: 'relative' }}>
						<CardMedia
							component="img"
							height="200"
							image={imagePath}
							alt={boardArticle?.articleTitle}
							sx={{ 
								objectFit: 'cover',
								'&:hover': {
									transform: 'scale(1.05)',
									transition: 'transform 0.3s ease-in-out'
								}
							}}
						/>
						
						{/* Category Badge */}
						<Chip
							label={getCategoryLabel(boardArticle?.articleCategory)}
							size="small"
							sx={{
								position: 'absolute',
								top: 12,
								left: 12,
								bgcolor: getCategoryColor(boardArticle?.articleCategory),
								color: 'white',
								fontWeight: 600,
								fontSize: '0.75rem'
							}}
						/>

						{/* Date Badge */}
						<Box sx={{
							position: 'absolute',
							bottom: 12,
							right: 12,
							bgcolor: 'rgba(0,0,0,0.7)',
							color: 'white',
							borderRadius: 2,
							px: 2,
							py: 0.5,
							textAlign: 'center'
						}}>
							<Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
								<Moment format="MMM">{boardArticle?.createdAt}</Moment>
							</Typography>
							<Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
								<Moment format="DD">{boardArticle?.createdAt}</Moment>
							</Typography>
						</Box>
					</Box>

					{/* Content Section */}
					<CardContent sx={{ flexGrow: 1, p: 3 }}>
						{/* Author Info */}
						<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
							<Avatar 
								sx={{ 
									width: 40, 
									height: 40,
									bgcolor: getCategoryColor(boardArticle?.articleCategory)
								}}
								onClick={(e: any) => {
									e.stopPropagation();
									goMemberPage(boardArticle?.memberData?._id as string);
								}}
							>
								{boardArticle?.memberData?.memberNick?.charAt(0) || <PersonIcon />}
							</Avatar>
							<Box sx={{ flex: 1 }}>
								<Typography 
									variant="subtitle2" 
									sx={{ 
										fontWeight: 600,
										color: getCategoryColor(boardArticle?.articleCategory),
										cursor: 'pointer',
										'&:hover': { textDecoration: 'underline' }
									}}
									onClick={(e: any) => {
										e.stopPropagation();
										goMemberPage(boardArticle?.memberData?._id as string);
									}}
								>
									{boardArticle?.memberData?.memberNick || 'Anonymous'}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									<TimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
									<Moment fromNow>{boardArticle?.createdAt}</Moment>
								</Typography>
							</Box>
						</Stack>

						{/* Article Title */}
						<Typography 
							variant="h6" 
							sx={{ 
								fontWeight: 700,
								mb: 2,
								lineHeight: 1.3,
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
								color: '#1a1a1a'
							}}
						>
							{boardArticle?.articleTitle}
						</Typography>

						{/* Article Description (if available) */}
						{boardArticle?.articleContent && (
							<Typography 
								variant="body2" 
								color="text.secondary"
								sx={{ 
									mb: 2,
									display: '-webkit-box',
									WebkitLineClamp: 3,
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden',
									lineHeight: 1.5
								}}
							>
								{boardArticle.articleContent.replace(/<[^>]*>/g, '').substring(0, 120)}...
							</Typography>
						)}
					</CardContent>

					{/* Actions Section */}
					<CardActions sx={{ 
						p: 3, 
						pt: 0,
						justifyContent: 'space-between',
						alignItems: 'center'
					}}>
						<Stack direction="row" spacing={1} alignItems="center">
							<Tooltip title="Views">
								<Stack direction="row" alignItems="center" spacing={0.5}>
									<ViewIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
									<Typography variant="body2" color="text.secondary">
										{boardArticle?.articleViews || 0}
									</Typography>
								</Stack>
							</Tooltip>
						</Stack>

						<Stack direction="row" spacing={1} alignItems="center">
							<Tooltip title={boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? "Unlike" : "Like"}>
								<IconButton 
									size="small"
									onClick={(e: any) => likeArticleHandler(e, user, boardArticle?._id)}
									sx={{
										color: boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite 
											? getCategoryColor(boardArticle?.articleCategory) 
											: 'text.secondary',
										'&:hover': {
											bgcolor: `${getCategoryColor(boardArticle?.articleCategory)}15`
										}
									}}
								>
									{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
										<FavoriteIcon sx={{ fontSize: 20 }} />
									) : (
										<FavoriteBorderIcon sx={{ fontSize: 20 }} />
									)}
								</IconButton>
							</Tooltip>
							<Typography variant="body2" color="text.secondary">
								{boardArticle?.articleLikes || 0}
							</Typography>
						</Stack>
					</CardActions>
				</Card>
			</Fade>
		);
	}
};

export default CommunityCard;
