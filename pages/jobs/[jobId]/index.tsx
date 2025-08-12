import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import styles from './DetailPage.module.scss';
import {
	FavoriteBorder as FavoriteBorderIcon,
	Favorite as FavoriteIcon,
	WorkOutline as WorkOutlineIcon,
	LocationOn as LocationOnIcon,
	Paid as PaidIcon,
	School as SchoolIcon,
	Timeline as TimelineIcon,
	Domain as DomainIcon,
	CheckCircle as CheckCircleIcon,
	ErrorOutline as ErrorOutlineIcon,
	Share as ShareIcon,
	Person as PersonIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	LinkedIn as LinkedInIcon,
	Business as BusinessIcon,
	Star as StarIcon,
	Visibility as VisibilityIcon,
	Favorite as FavoriteOutlinedIcon,
	ArrowBack as ArrowBackIcon,
	CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { GET_JOB, GET_JOBS } from '../../../apollo/user/query';
import { LIKE_TARGET_JOB } from '../../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../../libs/config';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { T } from '../../../libs/types/common';
import Image from 'next/image';

type Job = {
	_id: string;
	positionTitle: string;
	companyName?: string | null;
	companyLogo?: string | null;
	jobStatus?: string | null;
	jobType?: string | null;
	employmentLevel?: string | null;
	jobLocation?: string | null;
	jobAddress?: string | null;
	jobSalary?: number | string | null;
	experienceYears?: number | null;
	educationLevel?: string | null;
	skillsRequired?: string[] | null;
	jobDesc?: string | null;
	createdAt?: string | null;
	jobViews?: number | null;
	jobLikes?: number | null;
	memberData?: {
		memberNick?: string | null;
		memberFullName?: string | null;
		memberEmail?: string | null;
		memberPhone?: string | null;
		memberLinkedIn?: string | null;
		memberCompany?: string | null;
		memberPosition?: string | null;
		memberAvatar?: string | null;
	} | null;
	meLiked?: Array<{
		myFavorite?: boolean | null;
	} | null> | null;
};

const JobDetailPage: NextPage = () => {
	const router = useRouter();
	const { jobId } = router.query as { jobId: string };
	const [similar, setSimilarJobs] = useState<Job[]>([]);

	const [likeTargetJobs] = useMutation(LIKE_TARGET_JOB);

	const { data, loading, error, refetch } = useQuery<{ getJob: Job }>(GET_JOB, {
		variables: { input: jobId },
		skip: !jobId,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});

	// Check if job is liked by current user
	const isJobLiked = (job: Job) => {
		return Array.isArray(job?.meLiked) && job.meLiked.length > 0 && job.meLiked[0]?.myFavorite === true;
	};

	const toggleLikeJob = async (e: React.MouseEvent, jobId: string) => {
		e.preventDefault();
		e.stopPropagation();
		
		try {
			await likeTargetJobs({ variables: { input: jobId } });
			// Refetch the job to get updated like status
			refetch();
		} catch (err) {
			console.error('Error toggling like:', err);
		}
	};

	const job = data?.getJob;

	// Similar jobs: by jobType + a few skills
	const {
		loading: simLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_JOBS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 8,
				sort: 'createdAt',
				direction: 'DESC',
				search: {},
			},
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setSimilarJobs(data?.getJobs?.list);
		},
	});

	const statusTone = useMemo(() => {
		const s = (job?.jobStatus || '').toLowerCase();
		if (s.includes('open')) return 'open';
		if (s.includes('pause') || s.includes('hold')) return 'paused';
		if (s.includes('close')) return 'closed';
		return 'default';
	}, [job?.jobStatus]);

	const pretty = (v?: string | null) =>
		(v || '')
			.toString()
			.replace(/_/g, ' ')
			.toLowerCase()
			.replace(/(^|\s)\S/g, (t) => t.toUpperCase());

	const formatCurrency = (val?: number | string | null) => {
		if (val == null || val === '') return 'Negotiable';
		const num = typeof val === 'string' ? Number(val) : val;
		if (!isFinite(num)) return String(val);
		try {
			return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(
				num,
			);
		} catch {
			return `${num} KRW`;
		}
	};

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
		} catch {}
	};

	const getPostedTime = (createdAt: string) => {
		const createdDate = new Date(createdAt);
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return '1 day ago';
		return `${diffDays} days ago`;
	};

	if (loading) {
		return (
			<div className={styles.wrap}>
				<div className={styles.skeleton}>
					<div className={styles.skelHero} />
					<div className={styles.skelRow} />
					<div className={styles.skelCol} />
					<div className={styles.skelCol} />
				</div>
			</div>
		);
	}

	if (error || !job) {
		return (
			<div className={styles.wrap}>
				<div className={styles.errorBox}>
					<ErrorOutlineIcon className={styles.errorIcon} />
					<div>
						<h2>We hit a snag</h2>
						<p>Couldn't load this job. Please try again.</p>
						<button className={styles.btnSecondary} onClick={() => refetch()}>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	const logo = job.companyLogo ? `${REACT_APP_API_URL}/${job.companyLogo}` : '/img/brands/g.png';

	return (
		<div className={styles.wrap}>
			{/* Back Navigation */}
			<div className={styles.backNav}>
				<button onClick={() => router.back()} className={styles.backBtn}>
					<ArrowBackIcon />
					<span>Back to Jobs</span>
				</button>
			</div>

			{/* Hero Section */}
			<div className={styles.hero}>
				<div className={styles.heroContent}>
					<div className={styles.heroLeft}>
						<div className={styles.companySection}>
							<div className={styles.companyLogo}>
								{job.companyLogo ? (
									<Image
										src={logo}
										alt={`${job.companyName} logo`}
										width={80}
										height={80}
										className={styles.logoImage}
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.style.display = 'none';
											const parent = target.parentElement;
											if (parent) {
												const fallback = document.createElement('div');
												fallback.className = styles.logoFallback;
												fallback.textContent = job.companyName?.charAt(0) ?? 'G';
												parent.appendChild(fallback);
											}
										}}
									/>
								) : (
									<div className={styles.logoFallback}>{job.companyName?.charAt(0) ?? 'G'}</div>
								)}
							</div>
							<div className={styles.companyInfo}>
								<h1 className={styles.jobTitle}>{job.positionTitle}</h1>
								<div className={styles.companyMeta}>
									<BusinessIcon className={styles.metaIcon} />
									<span className={styles.companyName}>{job.companyName || '—'}</span>
									<span className={`${styles.status} ${styles[statusTone]}`}>
										<CheckCircleIcon />
										<span>{job.jobStatus || '—'}</span>
									</span>
								</div>
								<div className={styles.jobStats}>
									<div className={styles.stat}>
										<VisibilityIcon />
										<span>{job.jobViews || 0} views</span>
									</div>
									<div className={styles.stat}>
										<FavoriteOutlinedIcon />
										<span>{job.jobLikes || 0} likes</span>
									</div>
									<div className={styles.stat}>
										<CalendarIcon />
										<span>{job.createdAt ? getPostedTime(job.createdAt) : 'Recently posted'}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className={styles.heroRight}>
						<div className={styles.heroActions}>
							<button
								className={`${styles.likeBtn} ${isJobLiked(job) ? styles.liked : ''}`}
								onClick={(e) => toggleLikeJob(e, job._id)}
								aria-label={isJobLiked(job) ? 'Saved' : 'Save job'}
							>
								{isJobLiked(job) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
							</button>
							<button className={styles.shareBtn} onClick={copyLink} aria-label="Share">
								<ShareIcon />
							</button>
							<button className={styles.applyBtn}>Apply Now</button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className={styles.mainContent}>
				<div className={styles.leftColumn}>
					{/* Job Details Grid */}
					<section className={styles.detailsGrid}>
						<div className={styles.detailCard}>
							<WorkOutlineIcon className={styles.detailIcon} />
							<div className={styles.detailContent}>
								<div className={styles.detailLabel}>Job Type</div>
								<div className={styles.detailValue}>{pretty(job.jobType) || '—'}</div>
							</div>
						</div>
						<div className={styles.detailCard}>
							<TimelineIcon className={styles.detailIcon} />
							<div className={styles.detailContent}>
								<div className={styles.detailLabel}>Level</div>
								<div className={styles.detailValue}>{pretty(job.employmentLevel) || '—'}</div>
							</div>
						</div>
						<div className={styles.detailCard}>
							<LocationOnIcon className={styles.detailIcon} />
							<div className={styles.detailContent}>
								<div className={styles.detailLabel}>Location</div>
								<div className={styles.detailValue}>
									{pretty(job.jobLocation)}
									{job.jobAddress ? ` · ${job.jobAddress}` : ''}
								</div>
							</div>
						</div>
						<div className={styles.detailCard}>
							<PaidIcon className={styles.detailIcon} />
							<div className={styles.detailContent}>
								<div className={styles.detailLabel}>Salary</div>
								<div className={styles.detailValue}>{formatCurrency(job.jobSalary)}</div>
							</div>
						</div>
						<div className={styles.detailCard}>
							<TimelineIcon className={styles.detailIcon} />
							<div className={styles.detailContent}>
								<div className={styles.detailLabel}>Experience</div>
								<div className={styles.detailValue}>{job.experienceYears != null ? `${job.experienceYears} yrs` : '—'}</div>
							</div>
						</div>
						<div className={styles.detailCard}>
							<SchoolIcon className={styles.detailIcon} />
							<div className={styles.detailContent}>
								<div className={styles.detailLabel}>Education</div>
								<div className={styles.detailValue}>{pretty(job.educationLevel) || '—'}</div>
							</div>
						</div>
					</section>

					{/* Job Description */}
					<section className={styles.descriptionSection}>
						<h2 className={styles.sectionTitle}>About the Role</h2>
						<div className={styles.descriptionContent}>
							<p>{job.jobDesc || 'No description provided.'}</p>
						</div>
					</section>

					{/* Skills Section */}
					{Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0 && (
						<section className={styles.skillsSection}>
							<h2 className={styles.sectionTitle}>Required Skills</h2>
							<div className={styles.skillsGrid}>
								{job.skillsRequired.map((skill, i) => (
									<div key={`${skill}-${i}`} className={styles.skillCard}>
										<span className={styles.skillText}>{skill}</span>
									</div>
								))}
							</div>
						</section>
					)}

					{/* Similar Jobs */}
					<section className={styles.similarSection}>
						<div className={styles.sectionHeader}>
							<h2 className={styles.sectionTitle}>Similar Jobs</h2>
							{!simLoading && similar.length > 0 && (
								<Link className={styles.viewAllLink} href={`/search?type=${job.jobType || ''}`}>
									View all
								</Link>
							)}
						</div>

						{simLoading && (
							<div className={styles.similarGrid}>
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={i} className={styles.similarCardSkeleton} />
								))}
							</div>
						)}

						{!simLoading && similar.length === 0 && (
							<div className={styles.noSimilar}>
								<p>No similar jobs found yet.</p>
							</div>
						)}

						{!simLoading && similar.length > 0 && (
							<div className={styles.similarGrid}>
								{similar.map((s) => {
									const sLogo = s.companyLogo
										? `${REACT_APP_API_URL}/${s.companyLogo}`
										: '/img/brands/g.png';
									return (
										<Link key={s._id} href={`/jobs/${s._id}`} className={styles.similarCard}>
											<div className={styles.similarHeader}>
												<div className={styles.similarLogo}>
													<Image
														src={sLogo}
														alt="logo"
														width={40}
														height={40}
														className={styles.similarLogoImg}
													/>
												</div>
												<div className={styles.similarMeta}>
													<div className={styles.similarTitle}>{s.positionTitle}</div>
													<div className={styles.similarCompany}>{s.companyName || '—'}</div>
												</div>
											</div>
											<div className={styles.similarInfo}>
												<span>{pretty(s.jobLocation) || '—'}</span>
												<span>•</span>
												<span>{pretty(s.jobType) || '—'}</span>
											</div>
											<div className={styles.similarSalary}>{formatCurrency(s.jobSalary)}</div>
											{Array.isArray(s.skillsRequired) && s.skillsRequired.length > 0 && (
												<div className={styles.similarSkills}>
													{s.skillsRequired.slice(0, 3).map((k) => (
														<span key={k} className={styles.similarSkill}>{k}</span>
													))}
												</div>
											)}
										</Link>
									);
								})}
							</div>
						)}
					</section>
				</div>

				{/* Right Sidebar */}
				<div className={styles.rightColumn}>
					{/* Member Data Card */}
					{job.memberData && (
						<section className={styles.memberCard}>
							<div className={styles.memberHeader}>
								<div className={styles.memberAvatar}>
									{job.memberData.memberAvatar ? (
										<Image
											src={`${REACT_APP_API_URL}/${job.memberData.memberAvatar}`}
											alt="Member avatar"
											width={60}
											height={60}
											className={styles.avatarImage}
										/>
									) : (
										<div className={styles.avatarFallback}>
											<PersonIcon />
										</div>
									)}
								</div>
								<div className={styles.memberInfo}>
									<div className={styles.memberName}>{job.memberData.memberFullName || job.memberData.memberNick || 'Recruiter'}</div>
									<div className={styles.memberPosition}>{job.memberData.memberPosition || 'Hiring Manager'}</div>
									<div className={styles.memberCompany}>{job.memberData.memberCompany || job.companyName || 'Company'}</div>
								</div>
							</div>
							<div className={styles.memberContact}>
								{job.memberData.memberEmail && (
									<div className={styles.contactItem}>
										<EmailIcon className={styles.contactIcon} />
										<span>{job.memberData.memberEmail}</span>
									</div>
								)}
								{job.memberData.memberPhone && (
									<div className={styles.contactItem}>
										<PhoneIcon className={styles.contactIcon} />
										<span>{job.memberData.memberPhone}</span>
									</div>
								)}
								{job.memberData.memberLinkedIn && (
									<div className={styles.contactItem}>
										<LinkedInIcon className={styles.contactIcon} />
										<span>LinkedIn Profile</span>
									</div>
								)}
							</div>
						</section>
					)}

					{/* Quick Apply Card */}
					<section className={styles.quickApplyCard}>
						<div className={styles.salaryDisplay}>
							<div className={styles.salaryLabel}>Salary</div>
							<div className={styles.salaryAmount}>{formatCurrency(job.jobSalary)}</div>
						</div>
						<button className={styles.primaryApplyBtn}>Apply Now</button>
						<div className={styles.jobSummary}>
							<div className={styles.summaryItem}>
								<span className={styles.summaryLabel}>Status</span>
								<strong className={styles.summaryValue}>{job.jobStatus || '—'}</strong>
							</div>
							<div className={styles.summaryItem}>
								<span className={styles.summaryLabel}>Type</span>
								<strong className={styles.summaryValue}>{pretty(job.jobType) || '—'}</strong>
							</div>
							<div className={styles.summaryItem}>
								<span className={styles.summaryLabel}>Level</span>
								<strong className={styles.summaryValue}>{pretty(job.employmentLevel) || '—'}</strong>
							</div>
							<div className={styles.summaryItem}>
								<span className={styles.summaryLabel}>Location</span>
								<strong className={styles.summaryValue}>{pretty(job.jobLocation) || '—'}</strong>
							</div>
							<div className={styles.summaryItem}>
								<span className={styles.summaryLabel}>Experience</span>
								<strong className={styles.summaryValue}>{job.experienceYears != null ? `${job.experienceYears} yrs` : '—'}</strong>
							</div>
							<div className={styles.summaryItem}>
								<span className={styles.summaryLabel}>Education</span>
								<strong className={styles.summaryValue}>{pretty(job.educationLevel) || '—'}</strong>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(JobDetailPage);
