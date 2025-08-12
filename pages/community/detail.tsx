import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { 
	Button, 
	Stack, 
	Typography, 
	Tab, 
	Tabs, 
	IconButton, 
	Backdrop, 
	Pagination,
	Box,
	Container,
	Avatar,
	Chip,
	Card,
	CardContent,
	Divider,
	TextField,
	Tooltip,
	Fade,
	CircularProgress
} from '@mui/material';
import { 
	DeleteForever as DeleteIcon,
	ThumbUpOffAlt as ThumbUpOffIcon,
	ThumbUpAlt as ThumbUpIcon,
	Visibility as VisibilityIcon,
	Chat as ChatIcon,
	ChatBubbleOutline as ChatBubbleIcon,
	Edit as EditIcon,
	ArrowBack as ArrowBackIcon,
	Add as AddIcon,
	TrendingUp as TrendingUpIcon,
	Newspaper as NewsIcon,
	SentimentSatisfiedAlt as HumorIcon,
	Forum as ForumIcon,
	AccessTime as TimeIcon,
	Person as PersonIcon
} from '@mui/icons-material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import dynamic from 'next/dynamic';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import {
	GET_AGENT_JOBS,
	GET_BOARD_ARTICLE,
	GET_COMMENTS,
	GET_MEMBER,
	GET_JOB,
} from '../../apollo/user/query';
import {
	CREATE_COMMENT,
	LIKE_TARGET_BOARD_ARTICLE,
	LIKE_TARGET_JOB,
	UPDATE_COMMENT,
} from '../../apollo/user/mutation';
import { Message } from '../../libs/enums/common.enum';
import {
	sweetConfirmAlert,
	sweetErrorHandling,
	sweetMixinErrorAlert,
	sweetMixinSuccessAlert,
	sweetTopSmallSuccessAlert,
} from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import { CommentUpdate } from '../../libs/types/comment/comment.update';

const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;

	const articleId = query?.id as string;
	const articleCategory = query?.articleCategory as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		...initialInput,
	});
	const [memberImage, setMemberImage] = useState<string>('/img/community/articleImg.png');
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle>();

	/** APOLLO REQUESTS **/
	const [likeTargetArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const {
		loading: getArticleLoading,
		data: getArticleData,
		error: getArticleError,
		refetch: getArticleRefetch,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: articleId,
		},
		skip: !searchFilter.search?.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticle(data?.getBoardArticle);
			if (data?.getBoardArticle?.memberData?.memberImage) {
				setMemberImage(`${process.env.REACT_APP_API_URL}/${data.getBoardArticle.memberData.memberImage}`);
			}
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchFilter,
		},
		skip: !searchFilter.search?.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list);
			setTotal(data?.getComments?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (articleId) setSearchFilter({ ...searchFilter, search: { commentRefId: articleId } });
	}, [articleId]);

	/** HANDLERS **/
	const tabChangeHandler = (event: React.SyntheticEvent, value: string) => {
		router.replace(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			'/community',
			{ shallow: true },
		);
	};

	const createCommentHandler = async () => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment,
			};
			if (comment === '') throw new Error('Please write something!');

			await createComment({
				variables: {
					input: commentInput,
				},
			});

			await getCommentsRefetch({ input: searchFilter });
			await getArticleRefetch({ input: articleId });
			setComment('');
			await sweetMixinSuccessAlert('Successfully commented!');
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			if (!commentId) throw new Error('Select a comment to update!');
			if (updatedComment === comments.find((comment) => comment._id === commentId)?.commentContent) return;

			const updateData: any = {
				_id: commentId,
				...(commentStatus && { commentStatus: commentStatus }),
				...(updatedComment && { commentContent: updatedComment }),
			};

			if (!updateData?.commentContent && !updateData?.commentStatus) {
				throw new Error('Provide data to update your comment!');
			}

			if (commentStatus) {
				if (await sweetConfirmAlert('Do you want to delete the comment?')) {
					await updateComment({
						variables: {
							input: updateData,
						},
					});
					await sweetMixinSuccessAlert('Successfully deleted!');
				} else return;
			} else {
				await updateComment({
					variables: {
						input: updateData,
					},
				});
				await sweetMixinSuccessAlert('Successfully updated!');
			}

			await getCommentsRefetch({ input: searchFilter });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		} finally {
			setOpenBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentWordsCnt(0);
			setUpdatedCommentId('');
		}
	};

	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${process.env.REACT_APP_API_URL}/${imageUrl}`;
		else return '/img/community/articleImg.png';
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const cancelButtonHandler = () => {
		setOpenBackdrop(false);
		setUpdatedComment('');
		setUpdatedCommentWordsCnt(0);
	};

	const updateCommentInputHandler = (value: string) => {
		if (value.length > 100) return;
		setUpdatedCommentWordsCnt(value.length);
		setUpdatedComment(value);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const likeArticleHandler = async (user: T, id: string) => {
		try {
			if (likeLoading) return;
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			setLikeLoading(true);
			await likeTargetArticle({ variables: { input: id } });
			await getArticleRefetch({ input: articleId });
			await sweetTopSmallSuccessAlert('Success', 700);
		} catch (err: any) {
			console.log('ERROR, likeArticleHandler:', err.message);
			await sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeLoading(false);
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

	const categoryInfo = getCategoryInfo(articleCategory);

	if (device === 'mobile') {
		return <div>COMMUNITY DETAIL PAGE MOBILE</div>;
	} else {
		return (
			<Box className="community-detail-page" sx={{ 
				minHeight: '100vh',
				background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
				pt: 8,
				pb: 6
			}}>
				<Container maxWidth="xl">
					{/* Header Section */}
					<Box sx={{ mb: 4 }}>
						<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
							<IconButton 
								onClick={() => router.back()}
								sx={{ 
									bgcolor: 'white',
									boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
									'&:hover': { bgcolor: 'white' }
								}}
							>
								<ArrowBackIcon />
							</IconButton>
							<Avatar 
								sx={{ 
									width: 60, 
									height: 60,
									bgcolor: categoryInfo.color,
									boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
								}}
							>
								{categoryInfo.icon}
							</Avatar>
							<Box>
								<Typography variant="h4" sx={{ 
									fontWeight: 700, 
									color: '#1a1a1a',
									mb: 0.5
								}}>
									{categoryInfo.title}
								</Typography>
								<Typography variant="body1" sx={{ color: '#666' }}>
									{categoryInfo.subtitle}
								</Typography>
							</Box>
						</Stack>
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

								<Tabs
									orientation="vertical"
									aria-label="community categories"
									TabIndicatorProps={{ style: { display: 'none' } }}
									onChange={tabChangeHandler}
									value={articleCategory}
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
								</Tabs>
							</Box>
						</Box>

						{/* Main Content Area */}
						<Box sx={{ flex: 1 }}>
							{/* Loading State */}
							{getArticleLoading && (
								<Box sx={{ 
									display: 'flex', 
									justifyContent: 'center', 
									alignItems: 'center',
									minHeight: 400
								}}>
									<CircularProgress size={60} sx={{ color: categoryInfo.color }} />
								</Box>
							)}

							{/* Article Content */}
							{!getArticleLoading && boardArticle && (
								<Fade in={true} timeout={500}>
									<Stack spacing={4}>
										{/* Article Header */}
										<Card sx={{ 
											borderRadius: 3,
											boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
											overflow: 'hidden'
										}}>
											{/* Article Image */}
											{boardArticle.articleImage && (
												<Box sx={{ 
													height: 300,
													backgroundImage: `url(${process.env.REACT_APP_API_URL}/${boardArticle.articleImage})`,
													backgroundSize: 'cover',
													backgroundPosition: 'center',
													position: 'relative'
												}}>
													<Chip
														label={getCategoryInfo(boardArticle.articleCategory).title}
														size="small"
														sx={{
															position: 'absolute',
															top: 16,
															left: 16,
															bgcolor: categoryInfo.color,
															color: 'white',
															fontWeight: 600
														}}
													/>
												</Box>
											)}

											<CardContent sx={{ p: 4 }}>
												{/* Article Title */}
												<Typography variant="h3" sx={{ 
													fontWeight: 700,
													mb: 3,
													color: '#1a1a1a',
													lineHeight: 1.2
												}}>
													{boardArticle.articleTitle}
												</Typography>

												{/* Author Info */}
												<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
													<Avatar 
														src={memberImage}
														sx={{ 
															width: 50, 
															height: 50,
															cursor: 'pointer'
														}}
														onClick={() => goMemberPage(boardArticle.memberData?._id)}
													/>
													<Box sx={{ flex: 1 }}>
														<Typography 
															variant="subtitle1" 
															sx={{ 
																fontWeight: 600,
																cursor: 'pointer',
																'&:hover': { textDecoration: 'underline' }
															}}
															onClick={() => goMemberPage(boardArticle.memberData?._id)}
														>
															{boardArticle.memberData?.memberNick || 'Anonymous'}
														</Typography>
														<Typography variant="body2" color="text.secondary">
															<TimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
															<Moment format="MMMM DD, YYYY at HH:mm">
																{boardArticle.createdAt}
															</Moment>
														</Typography>
													</Box>
												</Stack>

												{/* Article Stats */}
												<Stack direction="row" spacing={3} sx={{ mb: 3 }}>
													<Tooltip title="Likes">
														<Stack direction="row" alignItems="center" spacing={1}>
															<IconButton 
																size="small"
																onClick={() => likeArticleHandler(user, boardArticle._id)}
																disabled={likeLoading}
																sx={{
																	color: boardArticle.meLiked ? categoryInfo.color : 'text.secondary',
																	'&:hover': {
																		bgcolor: `${categoryInfo.color}15`
																	}
																}}
															>
																{boardArticle.meLiked ? <ThumbUpIcon /> : <ThumbUpOffIcon />}
															</IconButton>
															<Typography variant="body2" color="text.secondary">
																{boardArticle.articleLikes || 0}
															</Typography>
														</Stack>
													</Tooltip>

													<Tooltip title="Views">
														<Stack direction="row" alignItems="center" spacing={1}>
															<VisibilityIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
															<Typography variant="body2" color="text.secondary">
																{boardArticle.articleViews || 0}
															</Typography>
														</Stack>
													</Tooltip>

													<Tooltip title="Comments">
														<Stack direction="row" alignItems="center" spacing={1}>
															{boardArticle.articleComments && boardArticle.articleComments > 0 ? (
																<ChatIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
															) : (
																<ChatBubbleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
															)}
															<Typography variant="body2" color="text.secondary">
																{boardArticle.articleComments || 0}
															</Typography>
														</Stack>
													</Tooltip>
												</Stack>

												<Divider sx={{ my: 3 }} />

												{/* Article Content */}
												<Box sx={{ 
													'& .ytb_play': {
														fontSize: '16px',
														lineHeight: 1.6,
														color: '#333',
														'& h1, & h2, & h3, & h4, & h5, & h6': {
															color: '#1a1a1a',
															fontWeight: 600,
															mb: 2
														},
														'& p': {
															mb: 2
														},
														'& img': {
															maxWidth: '100%',
															height: 'auto',
															borderRadius: 2
														}
													}
												}}>
													<ToastViewerComponent markdown={boardArticle.articleContent} className={'ytb_play'} />
												</Box>
											</CardContent>
										</Card>

										{/* Comments Section */}
										<Card sx={{ 
											borderRadius: 3,
											boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
										}}>
											<CardContent sx={{ p: 4 }}>
												{/* Comments Header */}
												<Typography variant="h5" sx={{ 
													fontWeight: 700,
													mb: 3,
													color: '#1a1a1a'
												}}>
													Comments ({total})
												</Typography>

												{/* Add Comment */}
												<Box sx={{ mb: 4 }}>
													<TextField
														fullWidth
														multiline
														rows={3}
														placeholder="Share your thoughts..."
														value={comment}
														onChange={(e) => {
															if (e.target.value.length > 100) return;
															setWordsCnt(e.target.value.length);
															setComment(e.target.value);
														}}
														sx={{ mb: 2 }}
													/>
													<Stack direction="row" justifyContent="space-between" alignItems="center">
														<Typography variant="body2" color="text.secondary">
															{wordsCnt}/100 characters
														</Typography>
														<Button
															variant="contained"
															onClick={createCommentHandler}
															disabled={!comment.trim()}
															sx={{
																bgcolor: categoryInfo.color,
																'&:hover': { bgcolor: categoryInfo.color, opacity: 0.9 },
																textTransform: 'none',
																fontWeight: 600
															}}
														>
															Post Comment
														</Button>
													</Stack>
												</Box>

												<Divider sx={{ my: 3 }} />

												{/* Comments List */}
												{getCommentsLoading ? (
													<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
														<CircularProgress size={40} sx={{ color: categoryInfo.color }} />
													</Box>
												) : total > 0 ? (
													<Stack spacing={3}>
														{comments?.map((commentData) => (
															<Box key={commentData._id} sx={{ 
																p: 3,
																borderRadius: 2,
																bgcolor: '#f8f9fa',
																border: '1px solid #e9ecef'
															}}>
																<Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
																	<Stack direction="row" spacing={2} alignItems="center">
																		<Avatar 
																			src={getCommentMemberImage(commentData.memberData?.memberImage)}
																			sx={{ 
																				width: 40, 
																				height: 40,
																				cursor: 'pointer'
																			}}
																			onClick={() => goMemberPage(commentData.memberData?._id)}
																		/>
																		<Box>
																			<Typography 
																				variant="subtitle2" 
																				sx={{ 
																					fontWeight: 600,
																					cursor: 'pointer',
																					'&:hover': { textDecoration: 'underline' }
																				}}
																				onClick={() => goMemberPage(commentData.memberData?._id)}
																			>
																				{commentData.memberData?.memberNick || 'Anonymous'}
																			</Typography>
																			<Typography variant="caption" color="text.secondary">
																				<Moment fromNow>{commentData.createdAt}</Moment>
																			</Typography>
																		</Box>
																	</Stack>

																	{commentData.memberId === user?._id && (
																		<Stack direction="row" spacing={1}>
																			<Tooltip title="Edit">
																				<IconButton
																					size="small"
																					onClick={() => {
																						setUpdatedComment(commentData.commentContent);
																						setUpdatedCommentWordsCnt(commentData.commentContent?.length);
																						setUpdatedCommentId(commentData._id);
																						setOpenBackdrop(true);
																					}}
																				>
																					<EditIcon sx={{ fontSize: 18 }} />
																				</IconButton>
																			</Tooltip>
																			<Tooltip title="Delete">
																				<IconButton
																					size="small"
																					onClick={() => updateButtonHandler(commentData._id, CommentStatus.DELETE)}
																					sx={{ color: 'error.main' }}
																				>
																					<DeleteIcon sx={{ fontSize: 18 }} />
																				</IconButton>
																			</Tooltip>
																		</Stack>
																	)}
																</Stack>
																<Typography variant="body1" sx={{ color: '#333' }}>
																	{commentData.commentContent}
																</Typography>
															</Box>
														))}

														{/* Pagination */}
														{total > searchFilter.limit && (
															<Box sx={{ 
																display: 'flex', 
																justifyContent: 'center',
																pt: 3
															}}>
																<Pagination
																	count={Math.ceil(total / searchFilter.limit)}
																	page={searchFilter.page}
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
															</Box>
														)}
													</Stack>
												) : (
													<Box sx={{ 
														textAlign: 'center',
														py: 6
													}}>
														<ChatBubbleIcon sx={{ 
															fontSize: 64, 
															color: 'text.secondary',
															mb: 2
														}} />
														<Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
															No comments yet
														</Typography>
														<Typography variant="body2" color="text.secondary">
															Be the first to share your thoughts!
														</Typography>
													</Box>
												)}
											</CardContent>
										</Card>
									</Stack>
								</Fade>
							)}
						</Box>
					</Box>
				</Container>

				{/* Edit Comment Backdrop */}
				<Backdrop
					sx={{
						color: '#fff',
						zIndex: (theme: any) => theme.zIndex.drawer + 1,
					}}
					open={openBackdrop}
				>
					<Card sx={{ 
						maxWidth: 500, 
						width: '90%',
						p: 4,
						borderRadius: 3
					}}>
						<Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
							Edit Comment
						</Typography>
						<TextField
							fullWidth
							multiline
							rows={3}
							value={updatedComment}
							onChange={(e) => updateCommentInputHandler(e.target.value)}
							sx={{ mb: 3 }}
							autoFocus
						/>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Typography variant="body2" color="text.secondary">
								{updatedCommentWordsCnt}/100 characters
							</Typography>
							<Stack direction="row" spacing={2}>
								<Button
									variant="outlined"
									onClick={cancelButtonHandler}
								>
									Cancel
								</Button>
								<Button
									variant="contained"
									onClick={() => updateButtonHandler(updatedCommentId, undefined)}
									disabled={!updatedComment.trim()}
									sx={{
										bgcolor: categoryInfo.color,
										'&:hover': { bgcolor: categoryInfo.color, opacity: 0.9 }
									}}
								>
									Update
								</Button>
							</Stack>
						</Stack>
					</Card>
				</Backdrop>
			</Box>
		);
	}
};

CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);
