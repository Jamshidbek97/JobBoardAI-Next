import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Pagination, Stack, Typography, Chip, IconButton, TextField } from '@mui/material';
import {
	Star as StarIcon,
	ArrowBack as ArrowBackIcon,
	Work as WorkIcon,
	Visibility as VisibilityIcon,
	Favorite as FavoriteIcon,
	FavoriteBorder as FavoriteBorderIcon,
	PersonAdd as FollowIcon,
	PersonRemove as UnfollowIcon,
	LocationOn as LocationIcon,
	Business as BusinessIcon,
	AccessTime as TimeIcon,
	Phone as PhoneIcon,
	Email as EmailIcon,
	LinkedIn as LinkedInIcon,
	Send as SendIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_JOB, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_JOBS, GET_MEMBER } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction } from '../../libs/enums/common.enum';
import { Job } from '../../libs/types/job/job';
import { JobInquiry } from '../../libs/types/job/job.input';
import Image from 'next/image';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const HiringManagerDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [mbId, setMbId] = useState<string | null>(null);
	const [hiringManager, setHiringManager] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<JobInquiry>(initialInput);
	const [hiringManagerJobs, setHiringManagerJobs] = useState<Job[]>([]);
	const [jobsTotal, setJobsTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [hiringManagerComments, setHiringManagerComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetJob] = useMutation(LIKE_TARGET_JOB);
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const {
		loading: getMemberLoading,
		data: getMemberData,
		error: getMemberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: mbId },
		skip: !mbId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setHiringManager(data?.getMember);
			setSearchFilter({
				...searchFilter,
				search: {
					memberId: data?.getMember?._id,
				},
			});
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: data?.getMember?._id,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: data?.getMember?._id,
			});
		},
	});

	console.log('getMember', searchFilter);

	const {
		loading: getJobsLoading,
		data: getJobsData,
		error: getJobsError,
		refetch: getJobsRefetch,
	} = useQuery(GET_JOBS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setHiringManagerJobs(data?.getJobs?.list);
			setJobsTotal(data?.getJobs?.metaCounter[0]?.total ?? 0);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setHiringManagerComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (router.query.agentId) setMbId(router.query.agentId as string);
	}, [router]);

	useEffect(() => {
		if (searchFilter.search.memberId) {
			getJobsRefetch({ variables: { input: searchFilter } }).then();
		}
	}, [searchFilter]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ variables: { input: commentInquiry } }).then();
		}
	}, [commentInquiry]);

	/** HELPERS **/
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

	const isFollowing = hiringManager?.meFollowed && hiringManager.meFollowed.length > 0 && hiringManager.meFollowed[0]?.myFollowing === true;

	/** HANDLERS **/
	const handleBackClick = () => {
		router.back();
	};

	const jobsPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		setSearchFilter({ ...searchFilter });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === hiringManager?._id) throw new Error('Cannot write review for yourself');
			
			await createComment({
				variables: {
					input: insertCommentData,
				},
			});

			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			await getCommentsRefetch({ input: commentInquiry });
			await sweetTopSmallSuccessAlert('Review submitted successfully', 800);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	// Check if job is liked by current user
	const isJobLiked = (job: Job) => {
		return job?.meLiked && job?.meLiked.length > 0;
	};

	const likeJobHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			
			await likeTargetJob({
				variables: {
					input: id,
				},
			});

			await getJobsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Job liked successfully', 800);
		} catch (err: any) {
			console.log('ERROR, likeJobHandler', err);
			sweetErrorHandling(err).then();
		}
	};

	const followHandler = async () => {
		try {
			if (!hiringManager?._id) return;
			if (!user._id) throw new Error(Messages.error2);

			if (isFollowing) {
				await unsubscribe({
					variables: {
						memberId: hiringManager._id,
					},
				});
				await sweetTopSmallSuccessAlert('Unfollowed successfully', 800);
			} else {
				await subscribe({
					variables: {
						memberId: hiringManager._id,
					},
				});
				await sweetTopSmallSuccessAlert('Followed successfully', 800);
			}

			await getMemberRefetch();
		} catch (err: any) {
			console.log('ERROR, followHandler', err.message);
			sweetErrorHandling(err).then();
		}
	};

	const handleJobClick = (jobId: string) => {
		router.push(`/jobs/${jobId}`);
	};

	if (getMemberLoading) {
		return (
			<Stack className="hiring-manager-detail-page">
				<Stack className="container">
					<Box className="loading-state">
						<BusinessIcon className="loading-icon" />
						<Typography className="loading-text">Loading hiring manager profile...</Typography>
					</Box>
				</Stack>
			</Stack>
		);
	}

	if (getMemberError || !hiringManager) {
		return (
			<Stack className="hiring-manager-detail-page">
				<Stack className="container">
					<Box className="error-state">
						<Typography className="error-title">Profile Not Found</Typography>
						<Typography className="error-subtitle">
							The hiring manager profile you're looking for doesn't exist or has been removed.
						</Typography>
						<Button onClick={handleBackClick} variant="contained" className="back-btn">
							Go Back
						</Button>
					</Box>
				</Stack>
			</Stack>
		);
	}

	if (device === 'mobile') {
		return <h1>HIRING MANAGER DETAIL MOBILE</h1>;
	}

	const imagePath = hiringManager?.memberImage
		? `${REACT_APP_API_URL}/${hiringManager.memberImage}`
		: '/img/defaultMember.jpg';

	return (
		<Stack className="hiring-manager-detail-page">
			<Stack className="container">
				{/* Back Navigation */}
				<Box className="back-nav">
					<Button onClick={handleBackClick} className="back-btn">
						<ArrowBackIcon />
						<span>Back to Hiring Managers</span>
					</Button>
				</Box>

				{/* Profile Header */}
				<Box className="profile-header">
					<Box className="profile-info">
						<Box className="profile-image-container">
							<Image
								src={imagePath}
								alt={`${hiringManager.memberFullName || hiringManager.memberNick} profile`}
								width={120}
								height={120}
								className="profile-image"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.src = '/img/defaultMember.jpg';
								}}
							/>
							{hiringManager?.memberStatus === 'ACTIVE' && (
								<Box className="status-indicator active" />
							)}
						</Box>
						
						<Box className="profile-details">
							<Typography className="profile-name">
								{hiringManager.memberFullName || hiringManager.memberNick || 'Anonymous'}
							</Typography>
							
							<Box className="profile-meta">
								<Chip 
									icon={<BusinessIcon />} 
									label={getMemberTypeDisplay(hiringManager.memberType)}
									className="member-type-chip"
									size="small"
								/>
								{hiringManager.memberAddress && (
									<Box className="location-info">
										<LocationIcon className="location-icon" />
										<Typography className="location-text">
											{hiringManager.memberAddress}
										</Typography>
									</Box>
								)}
							</Box>

							{hiringManager.memberDesc && (
								<Typography className="profile-description">
									{hiringManager.memberDesc}
								</Typography>
							)}

							<Box className="profile-stats">
								<Box className="stat-item">
									<WorkIcon className="stat-icon" />
									<Box className="stat-content">
										<Typography className="stat-value">{hiringManager.memberPostedJobs || 0}</Typography>
										<Typography className="stat-label">Jobs Posted</Typography>
									</Box>
								</Box>
								
								<Box className="stat-item">
									<VisibilityIcon className="stat-icon" />
									<Box className="stat-content">
										<Typography className="stat-value">{hiringManager.memberViews || 0}</Typography>
										<Typography className="stat-label">Profile Views</Typography>
									</Box>
								</Box>
								
								<Box className="stat-item">
									<FavoriteIcon className="stat-icon" />
									<Box className="stat-content">
										<Typography className="stat-value">{hiringManager.memberLikes || 0}</Typography>
										<Typography className="stat-label">Likes</Typography>
									</Box>
								</Box>
								
								<Box className="stat-item">
									<FollowIcon className="stat-icon" />
									<Box className="stat-content">
										<Typography className="stat-value">{hiringManager.memberFollowers || 0}</Typography>
										<Typography className="stat-label">Followers</Typography>
									</Box>
								</Box>
							</Box>

							<Box className="join-info">
								<TimeIcon className="time-icon" />
								<Typography className="join-text">
									{getTimeSinceJoined(hiringManager.createdAt.toString())}
								</Typography>
							</Box>
						</Box>
					</Box>

					<Box className="profile-actions">
						<IconButton 
							className={`follow-btn ${isFollowing ? 'following' : ''}`}
							onClick={followHandler}
							title={isFollowing ? 'Unfollow' : 'Follow'}
						>
							{isFollowing ? <UnfollowIcon /> : <FollowIcon />}
							<Typography className="follow-text">
								{isFollowing ? 'Unfollow' : 'Follow'}
							</Typography>
						</IconButton>

						{hiringManager.memberPhone && (
							<Button className="contact-btn phone-btn">
								<PhoneIcon />
								<span>{hiringManager.memberPhone}</span>
							</Button>
						)}
					</Box>
				</Box>

				{/* Main Content */}
				<Box className="main-content">
					{/* Jobs Section */}
					<Box className="jobs-section">
						<Box className="section-header">
							<Typography className="section-title">Posted Jobs</Typography>
							<Typography className="section-subtitle">
								{jobsTotal} job{jobsTotal !== 1 ? 's' : ''} posted by this hiring manager
							</Typography>
						</Box>

						{getJobsLoading ? (
							<Box className="loading-jobs">
								<Typography>Loading jobs...</Typography>
							</Box>
						) : hiringManagerJobs.length === 0 ? (
							<Box className="no-jobs">
								<WorkIcon className="no-jobs-icon" />
								<Typography className="no-jobs-title">No Jobs Posted Yet</Typography>
								<Typography className="no-jobs-subtitle">
									This hiring manager hasn't posted any jobs yet.
								</Typography>
							</Box>
						) : (
							<Box className="jobs-grid">
								{hiringManagerJobs.map((job: Job) => (
									<Box 
										key={job._id} 
										className="job-card"
										onClick={() => handleJobClick(job._id)}
									>
										<Box className="job-header">
											<Box className="job-company">
												{job.companyLogo && (
													<Image
														src={`${REACT_APP_API_URL}/${job.companyLogo}`}
														alt={`${job.companyName} logo`}
														width={40}
														height={40}
														className="company-logo"
														onError={(e) => {
															const target = e.target as HTMLImageElement;
															target.style.display = 'none';
														}}
													/>
												)}
												<Box className="company-info">
													<Typography className="job-title">{job.positionTitle}</Typography>
													<Typography className="company-name">{job.companyName || '—'}</Typography>
												</Box>
											</Box>
											<IconButton 
												className={`like-btn ${isJobLiked(job) ? 'liked' : ''}`}
												onClick={(e: any) => {
													e.stopPropagation();
													likeJobHandler(user, job._id);
												}}
											>
												{isJobLiked(job) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
											</IconButton>
										</Box>
										
										<Box className="job-details">
											<Box className="job-meta">
												<Typography className="job-location">
													{job.jobLocation?.replace(/_/g, ' ') || '—'}
												</Typography>
												<Typography className="job-type">
													{job.jobType?.replace(/_/g, ' ') || '—'}
												</Typography>
											</Box>
											
											<Typography className="job-salary">
												{job.jobSalary ? `${new Intl.NumberFormat('ko-KR', { 
													style: 'currency', 
													currency: 'KRW',
													maximumFractionDigits: 0 
												}).format(Number(job.jobSalary))}` : 'Negotiable'}
											</Typography>
										</Box>
									</Box>
								))}
							</Box>
						)}

						{jobsTotal > 0 && (
							<Box className="jobs-pagination">
								<Pagination
									page={searchFilter.page}
									count={Math.ceil(jobsTotal / searchFilter.limit)}
									onChange={jobsPaginationChangeHandler}
									shape="circular"
									color="primary"
								/>
							</Box>
						)}
					</Box>

					{/* Reviews Section */}
					<Box className="reviews-section">
						<Box className="section-header">
							<Typography className="section-title">Reviews</Typography>
							<Box className="reviews-summary">
								<StarIcon className="star-icon" />
								<Typography className="reviews-count">
									{commentTotal} review{commentTotal !== 1 ? 's' : ''}
								</Typography>
							</Box>
						</Box>

						{getCommentsLoading ? (
							<Box className="loading-reviews">
								<Typography>Loading reviews...</Typography>
							</Box>
						) : hiringManagerComments.length === 0 ? (
							<Box className="no-reviews">
								<StarIcon className="no-reviews-icon" />
								<Typography className="no-reviews-title">No Reviews Yet</Typography>
								<Typography className="no-reviews-subtitle">
									Be the first to review this hiring manager.
								</Typography>
							</Box>
						) : (
							<Box className="reviews-list">
								{hiringManagerComments.map((comment: Comment) => (
									<Box key={comment._id} className="review-card">
										<Box className="review-header">
											<Typography className="reviewer-name">
												{comment.memberData?.memberFullName || comment.memberData?.memberNick || 'Anonymous'}
											</Typography>
											<Typography className="review-date">
												{new Date(comment.createdAt).toLocaleDateString()}
											</Typography>
										</Box>
										<Typography className="review-content">
											{comment.commentContent}
										</Typography>
									</Box>
								))}
							</Box>
						)}

						{commentTotal > 0 && (
							<Box className="reviews-pagination">
								<Pagination
									page={commentInquiry.page}
									count={Math.ceil(commentTotal / commentInquiry.limit)}
									onChange={commentPaginationChangeHandler}
									shape="circular"
									color="primary"
								/>
							</Box>
						)}

						{/* Leave Review */}
						{user._id && user._id !== hiringManager._id && (
							<Box className="leave-review">
								<Typography className="review-form-title">Leave a Review</Typography>
								<TextField
									fullWidth
									multiline
									rows={4}
									placeholder="Share your experience with this hiring manager..."
									value={insertCommentData.commentContent}
									onChange={(e) => setInsertCommentData({ 
										...insertCommentData, 
										commentContent: e.target.value 
									})}
									className="review-input"
									variant="outlined"
									InputProps={{
										style: {
											fontSize: '14px',
											lineHeight: '1.5',
										}
									}}
								/>
								<Button
									variant="contained"
									onClick={createCommentHandler}
									disabled={!insertCommentData.commentContent.trim()}
									className="submit-review-btn"
									endIcon={<SendIcon />}
								>
									Submit Review
								</Button>
							</Box>
						)}
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
};

HiringManagerDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 4,
		search: {
			memberId: '',
		},
		direction: Direction.DESC,
	},
	initialComment: {
		page: 1,
		limit: 3,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(HiringManagerDetail);
