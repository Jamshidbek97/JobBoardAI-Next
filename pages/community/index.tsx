import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { 
	Stack, 
	Tab, 
	Typography, 
	Button, 
	Pagination, 
	Box, 
	Container,
	Chip,
	Avatar,
	IconButton,
	Tooltip,
	Fade,
	CircularProgress
} from '@mui/material';
import { 
	Add as AddIcon,
	TrendingUp as TrendingUpIcon,
	Newspaper as NewsIcon,
	SentimentSatisfiedAlt as HumorIcon,
	Forum as ForumIcon,
	Search as SearchIcon,
	FilterList as FilterIcon
} from '@mui/icons-material';
import CommunityCard from '../../libs/components/common/CommunityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;
	const articleCategory = query?.articleCategory as string;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	if (articleCategory) initialInput.search.articleCategory = articleCategory;

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: boardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: 'FREE' },
				},
				router.pathname,
				{ shallow: true },
			);
	}, []);

	/** HANDLERS **/
	const tabChangeHandler = async (e: T, value: string) => {
		console.log(value);

		setSearchCommunity({ ...searchCommunity, page: 1, search: { articleCategory: value as BoardArticleCategory } });
		await router.push(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			router.pathname,
			{ shallow: true },
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});
			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('Error: likeArticleHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const getCategoryInfo = (category: string) => {
		switch (category) {
			case 'FREE':
				return {
					title: 'Free Board',
					subtitle: 'Express your opinions freely here without content restrictions',
					icon: <ForumIcon />,
					color: '#2196F3'
				};
			case 'RECOMMEND':
				return {
					title: 'Recommendations',
					subtitle: 'Discover curated content and helpful recommendations',
					icon: <TrendingUpIcon />,
					color: '#4CAF50'
				};
			case 'NEWS':
				return {
					title: 'News & Updates',
					subtitle: 'Stay updated with the latest industry news and announcements',
					icon: <NewsIcon />,
					color: '#FF9800'
				};
			case 'HUMOR':
				return {
					title: 'Humor & Fun',
					subtitle: 'Light-hearted content to brighten your day',
					icon: <HumorIcon />,
					color: '#E91E63'
				};
			default:
				return {
					title: 'Community',
					subtitle: 'Join the conversation',
					icon: <ForumIcon />,
					color: '#2196F3'
				};
		}
	};

	const categoryInfo = getCategoryInfo(searchCommunity.search.articleCategory);

	if (device === 'mobile') {
		return <h1>COMMUNITY PAGE MOBILE</h1>;
	} else {
		return (
			<Box className="community-page" sx={{ 
				minHeight: '100vh',
				background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
				pt: 8,
				pb: 6
			}}>
				<Container maxWidth="xl">
					{/* Header Section */}
					<Box sx={{ mb: 6 }}>
						<Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
							<Avatar 
								sx={{ 
									width: 80, 
									height: 80,
									bgcolor: categoryInfo.color,
									boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
								}}
							>
								{categoryInfo.icon}
							</Avatar>
							<Box>
								<Typography variant="h3" sx={{ 
									fontWeight: 700, 
									color: '#1a1a1a',
									mb: 1
								}}>
									{categoryInfo.title}
								</Typography>
								<Typography variant="body1" sx={{ 
									color: '#666',
									maxWidth: 500
								}}>
									{categoryInfo.subtitle}
								</Typography>
							</Box>
						</Stack>
						
						{/* Stats Bar */}
						<Box sx={{ 
							display: 'flex', 
							alignItems: 'center', 
							justifyContent: 'space-between',
							p: 3,
							bgcolor: 'white',
							borderRadius: 3,
							boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
							mb: 4
						}}>
							<Stack direction="row" spacing={4}>
								<Box textAlign="center">
									<Typography variant="h4" sx={{ fontWeight: 700, color: categoryInfo.color }}>
										{totalCount}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Total Articles
									</Typography>
								</Box>
								<Box textAlign="center">
									<Typography variant="h4" sx={{ fontWeight: 700, color: categoryInfo.color }}>
										{Math.ceil(totalCount / searchCommunity.limit)}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Pages
									</Typography>
								</Box>
							</Stack>
							
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={() =>
									router.push({
										pathname: '/mypage',
										query: { category: 'writeArticle' },
									})
								}
								sx={{
									bgcolor: categoryInfo.color,
									'&:hover': { bgcolor: categoryInfo.color, opacity: 0.9 },
									px: 3,
									py: 1.5,
									borderRadius: 2,
									textTransform: 'none',
									fontWeight: 600
								}}
							>
								Write Article
							</Button>
						</Box>
					</Box>

					{/* Main Content */}
					<Box sx={{ display: 'flex', gap: 4 }}>
						{/* Sidebar */}
						<Box sx={{ 
							width: 280, 
							flexShrink: 0,
							position: 'sticky',
							top: 100,
							height: 'fit-content'
						}}>
							<Box sx={{ 
								bgcolor: 'white',
								borderRadius: 3,
								p: 3,
								boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
								mb: 3
							}}>
								<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
									<Avatar 
										src="/img/logo/logoText.svg"
										sx={{ width: 50, height: 50 }}
									/>
									<Box>
										<Typography variant="h6" sx={{ fontWeight: 600 }}>
											JobBoardAI
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Community
										</Typography>
									</Box>
								</Stack>

								<TabContext value={searchCommunity.search.articleCategory}>
									<TabList
										orientation="vertical"
										aria-label="community categories"
										TabIndicatorProps={{ style: { display: 'none' } }}
										onChange={tabChangeHandler}
										sx={{
											'& .MuiTab-root': {
												alignItems: 'flex-start',
												textAlign: 'left',
												minHeight: 48,
												padding: '12px 16px',
												borderRadius: 2,
												marginBottom: 1,
												textTransform: 'none',
												fontWeight: 500,
												color: '#666',
												'&.Mui-selected': {
													bgcolor: `${categoryInfo.color}15`,
													color: categoryInfo.color,
													fontWeight: 600
												},
												'&:hover': {
													bgcolor: '#f5f5f5'
												}
											}
										}}
									>
										<Tab
											value={'FREE'}
											label={
												<Stack direction="row" alignItems="center" spacing={1}>
													<ForumIcon fontSize="small" />
													<span>Free Board</span>
												</Stack>
											}
										/>
										<Tab
											value={'RECOMMEND'}
											label={
												<Stack direction="row" alignItems="center" spacing={1}>
													<TrendingUpIcon fontSize="small" />
													<span>Recommendations</span>
												</Stack>
											}
										/>
										<Tab
											value={'NEWS'}
											label={
												<Stack direction="row" alignItems="center" spacing={1}>
													<NewsIcon fontSize="small" />
													<span>News</span>
												</Stack>
											}
										/>
										<Tab
											value={'HUMOR'}
											label={
												<Stack direction="row" alignItems="center" spacing={1}>
													<HumorIcon fontSize="small" />
													<span>Humor</span>
												</Stack>
											}
										/>
									</TabList>
								</TabContext>
							</Box>
						</Box>

						{/* Main Content Area */}
						<Box sx={{ flex: 1 }}>
							<TabContext value={searchCommunity.search.articleCategory}>
								{/* Loading State */}
								{boardArticlesLoading && (
									<Box sx={{ 
										display: 'flex', 
										justifyContent: 'center', 
										alignItems: 'center',
										minHeight: 400
									}}>
										<CircularProgress size={60} sx={{ color: categoryInfo.color }} />
									</Box>
								)}

								{/* Content Panels */}
								{!boardArticlesLoading && (
									<>
										<TabPanel value="FREE" sx={{ p: 0 }}>
											<Fade in={true} timeout={500}>
												<Box sx={{ 
													display: 'grid',
													gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
													gap: 3
												}}>
													{totalCount ? (
														boardArticles?.map((boardArticle: BoardArticle) => (
															<CommunityCard
																boardArticle={boardArticle}
																key={boardArticle?._id}
																likeArticleHandler={likeArticleHandler}
															/>
														))
													) : (
														<Box sx={{ 
															gridColumn: '1 / -1',
															textAlign: 'center',
															py: 8
														}}>
															<img src="/img/icons/icoAlert.svg" alt="" style={{ width: 64, height: 64, marginBottom: 16 }} />
															<Typography variant="h6" color="text.secondary">
																No articles found in this category
															</Typography>
															<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
																Be the first to share something!
															</Typography>
														</Box>
													)}
												</Box>
											</Fade>
										</TabPanel>

										<TabPanel value="RECOMMEND" sx={{ p: 0 }}>
											<Fade in={true} timeout={500}>
												<Box sx={{ 
													display: 'grid',
													gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
													gap: 3
												}}>
													{totalCount ? (
														boardArticles?.map((boardArticle: BoardArticle) => (
															<CommunityCard
																boardArticle={boardArticle}
																likeArticleHandler={likeArticleHandler}
																key={boardArticle?._id}
															/>
														))
													) : (
														<Box sx={{ 
															gridColumn: '1 / -1',
															textAlign: 'center',
															py: 8
														}}>
															<img src="/img/icons/icoAlert.svg" alt="" style={{ width: 64, height: 64, marginBottom: 16 }} />
															<Typography variant="h6" color="text.secondary">
																No recommendations available
															</Typography>
															<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
																Check back later for curated content
															</Typography>
														</Box>
													)}
												</Box>
											</Fade>
										</TabPanel>

										<TabPanel value="NEWS" sx={{ p: 0 }}>
											<Fade in={true} timeout={500}>
												<Box sx={{ 
													display: 'grid',
													gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
													gap: 3
												}}>
													{totalCount ? (
														boardArticles?.map((boardArticle: BoardArticle) => (
															<CommunityCard
																boardArticle={boardArticle}
																likeArticleHandler={likeArticleHandler}
																key={boardArticle?._id}
															/>
														))
													) : (
														<Box sx={{ 
															gridColumn: '1 / -1',
															textAlign: 'center',
															py: 8
														}}>
															<img src="/img/icons/icoAlert.svg" alt="" style={{ width: 64, height: 64, marginBottom: 16 }} />
															<Typography variant="h6" color="text.secondary">
																No news articles available
															</Typography>
															<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
																Stay tuned for the latest updates
															</Typography>
														</Box>
													)}
												</Box>
											</Fade>
										</TabPanel>

										<TabPanel value="HUMOR" sx={{ p: 0 }}>
											<Fade in={true} timeout={500}>
												<Box sx={{ 
													display: 'grid',
													gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
													gap: 3
												}}>
													{totalCount ? (
														boardArticles?.map((boardArticle: BoardArticle) => (
															<CommunityCard
																boardArticle={boardArticle}
																likeArticleHandler={likeArticleHandler}
																key={boardArticle?._id}
															/>
														))
													) : (
														<Box sx={{ 
															gridColumn: '1 / -1',
															textAlign: 'center',
															py: 8
														}}>
															<img src="/img/icons/icoAlert.svg" alt="" style={{ width: 64, height: 64, marginBottom: 16 }} />
															<Typography variant="h6" color="text.secondary">
																No humor content available
															</Typography>
															<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
																Share something funny to brighten our day!
															</Typography>
														</Box>
													)}
												</Box>
											</Fade>
										</TabPanel>
									</>
								)}
							</TabContext>

							{/* Pagination */}
							{totalCount > 0 && (
								<Box sx={{ 
									mt: 6,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: 2
								}}>
									<Pagination
										count={Math.ceil(totalCount / searchCommunity.limit)}
										page={searchCommunity.page}
										shape="rounded"
										color="primary"
										onChange={paginationHandler}
										sx={{
											'& .MuiPaginationItem-root': {
												borderRadius: 2,
												fontWeight: 500
											}
										}}
									/>
									<Typography variant="body2" color="text.secondary">
										Showing {((searchCommunity.page - 1) * searchCommunity.limit) + 1} to {Math.min(searchCommunity.page * searchCommunity.limit, totalCount)} of {totalCount} articles
									</Typography>
								</Box>
							)}
						</Box>
					</Box>
				</Container>
			</Box>
		);
	}
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			articleCategory: 'FREE',
		},
	},
};

export default withLayoutBasic(Community);
