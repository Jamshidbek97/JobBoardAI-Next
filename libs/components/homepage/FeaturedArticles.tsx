import React, { useState, useEffect } from 'react';
import { Box, Button, Skeleton, Typography, Chip, Avatar, Paper } from '@mui/material';
import { useTranslation } from 'next-i18next';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ForumIcon from '@mui/icons-material/Forum';
import { Direction } from '../../enums/common.enum';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import Image from 'next/image';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';

interface FeaturedArticlesProps {
	initialInput?: BoardArticlesInquiry;
}

const FeaturedArticles = ({ 
	initialInput = { 
		page: 1, 
		limit: 6, 
		sort: 'articleViews', 
		direction: Direction.DESC, 
		search: {} 
	} 
}: FeaturedArticlesProps) => {
	const { t, i18n } = useTranslation('common');
	const [featuredArticles, setFeaturedArticles] = useState<BoardArticle[]>([]);
	const [isClient, setIsClient] = useState(false);
	const router = useRouter();

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const { loading: getArticlesLoading, refetch: getArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setFeaturedArticles(data?.getBoardArticles?.list),
	});

	const toggleLikeArticle = async (e: React.MouseEvent, articleId: string) => {
		e.preventDefault();
		e.stopPropagation();
		
		try {
			await likeTargetBoardArticle({ variables: { input: articleId } });
			await getArticlesRefetch();
		} catch (err) {
			console.error('Error toggling like:', err);
		}
	};

	const handleCardClick = (articleId: string, category: string) => {
		router.push(`/community/detail?id=${articleId}&articleCategory=${category}`);
	};

	// Check if article is liked by current user
	const isArticleLiked = (article: BoardArticle) => {
		return Array.isArray(article?.meLiked) && article.meLiked.length > 0 && article.meLiked[0]?.myFavorite === true;
	};

	// Helper function to get time ago
	const getPostedTime = (createdAt: Date | string) => {
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

	// Helper function to get category info
	const getCategoryInfo = (category: BoardArticleCategory) => {
		switch (category) {
			case BoardArticleCategory.NEWS:
				return {
					title: t('News'),
					icon: <NewspaperIcon />,
					color: '#FF9800'
				};
			case BoardArticleCategory.HUMOR:
				return {
					title: t('Humor'),
					icon: <SentimentSatisfiedAltIcon />,
					color: '#E91E63'
				};
			case BoardArticleCategory.TRENDING:
				return {
					title: t('Trending'),
					icon: <TrendingUpIcon />,
					color: '#4CAF50'
				};
			default:
				return {
					title: t('Community'),
					icon: <ForumIcon />,
					color: '#2196F3'
				};
		}
	};

	const renderArticleCard = (article: BoardArticle) => {
		const categoryInfo = getCategoryInfo(article.articleCategory);
		
		return (
			<div className="featured-article-card" onClick={() => handleCardClick(article._id, article.articleCategory)}>
				<div className="article-image-container">
					<Image 
						src={article.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '/img/community/articleImg.png'}
						alt={article.articleTitle}
						width={400}
						height={200}
						className="article-image"
					/>
					<div className="article-overlay">
						<Button
							className={`like-button ${isArticleLiked(article) ? 'liked' : ''}`}
							onClick={(e) => toggleLikeArticle(e, article._id)}
							sx={{ minWidth: 'auto', p: 1 }}
						>
							{isArticleLiked(article) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						</Button>
					</div>
					<Chip 
						icon={categoryInfo.icon}
						label={isClient ? categoryInfo.title : ''} 
						size="small" 
						className="category-chip"
						sx={{ 
							bgcolor: categoryInfo.color, 
							color: 'white',
							position: 'absolute',
							top: 12,
							left: 12
						}}
					/>
				</div>

				<div className="article-content">
					<Typography className="article-title" variant="h6">
						{isClient ? article.articleTitle : ''}
					</Typography>
					
					<Typography className="article-excerpt" variant="body2">
						{isClient ? (article.articleContent.length > 120 
							? `${article.articleContent.substring(0, 120)}...` 
							: article.articleContent) : ''}
					</Typography>

					<div className="article-meta">
						<div className="author-info">
							<Avatar 
								src={article.memberData?.memberImage ? `${REACT_APP_API_URL}/${article.memberData.memberImage}` : '/img/defaultMember.jpg'}
								className="author-avatar"
								sx={{ width: 24, height: 24 }}
							/>
							<span className="author-name">
								{isClient ? article.memberData?.memberNick : ''}
							</span>
						</div>
						
						<div className="engagement-stats">
							<div className="stat-item">
								<VisibilityOutlinedIcon fontSize="small" />
								<span>{article.articleViews || 0}</span>
							</div>
							<div className="stat-item">
								<FavoriteOutlinedIcon fontSize="small" />
								<span>{article.articleLikes || 0}</span>
							</div>
							<div className="stat-item">
								<CommentOutlinedIcon fontSize="small" />
								<span>{article.articleComments || 0}</span>
							</div>
						</div>
					</div>

					<div className="article-footer">
						<span className="posted-time">
							{isClient ? getPostedTime(article.createdAt) : ''}
						</span>
						<Button 
							variant="contained" 
							className="read-more-button" 
							size="small"
							onClick={(e: React.MouseEvent) => {
								e.stopPropagation();
								handleCardClick(article._id, article.articleCategory);
							}}
						>
							{isClient ? t('Read More') : ''}
						</Button>
					</div>
				</div>
			</div>
		);
	};

	const renderSkeleton = () => (
		<div className="featured-article-card skeleton">
			<Skeleton variant="rectangular" width="100%" height={200} />
			<div className="article-content">
				<Skeleton variant="text" width="90%" height={28} />
				<Skeleton variant="text" width="100%" />
				<Skeleton variant="text" width="60%" />
				<div className="article-meta">
					<Skeleton variant="circular" width={24} height={24} />
					<Skeleton variant="text" width="40%" />
				</div>
			</div>
		</div>
	);

	if (!isClient) {
		return null;
	}

	return (
		<section className="featured-articles">
			<div className="featured-articles-container">
				<div className="section-header">
					<Typography className="section-title" variant="h3">
						{isClient ? t('Featured Articles') : ''}
					</Typography>
					<Typography className="section-subtitle" variant="body1">
						{isClient ? t('Discover trending stories and insights from our community') : ''}
					</Typography>
				</div>

				<div className="articles-carousel-container">
					<div className="navigation-buttons">
						<button className="art-prev">
							<WestIcon />
						</button>
						<button className="art-next">
							<EastIcon />
						</button>
					</div>

					<Swiper
						modules={[Navigation, Pagination, Autoplay]}
						spaceBetween={24}
						slidesPerView={'auto'}
						navigation={{
							prevEl: '.art-prev',
							nextEl: '.art-next',
						}}
						pagination={{
							clickable: true,
							el: '.art-pagination',
						}}
						autoplay={{
							delay: 6000,
							disableOnInteraction: false,
						}}
						breakpoints={{
							320: { slidesPerView: 1, spaceBetween: 16 },
							480: { slidesPerView: 1, spaceBetween: 20 },
							640: { slidesPerView: 2, spaceBetween: 24 },
							768: { slidesPerView: 2, spaceBetween: 28 },
							960: { slidesPerView: 3, spaceBetween: 32 },
							1200: { slidesPerView: 3, spaceBetween: 36 },
							1400: { slidesPerView: 4, spaceBetween: 40 },
						}}
						className="articles-swiper"
					>
						{getArticlesLoading
							? Array.from({ length: 6 }).map((_, index) => (
								<SwiperSlide key={index}>{renderSkeleton()}</SwiperSlide>
							))
							: featuredArticles.map((article) => (
								<SwiperSlide key={article._id}>{renderArticleCard(article)}</SwiperSlide>
							))}
					</Swiper>

					<div className="art-pagination"></div>
				</div>

				<div className="view-all-section">
					<Button 
						variant="outlined" 
						className="view-all-button"
						onClick={() => router.push('/community?articleCategory=FREE')}
					>
						{isClient ? t('View All Articles') : ''}
						<EastIcon />
					</Button>
				</div>
			</div>
		</section>
	);
};

export default FeaturedArticles;
