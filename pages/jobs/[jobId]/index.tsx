import React, { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
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
} from '@mui/icons-material';
import { GET_JOB, GET_JOBS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../../libs/config';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { T } from '../../../libs/types/common';

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
	educationLevel?: string | null; // enum-ish string
	skillsRequired?: string[] | null;
	jobDesc?: string | null;
};

const JobDetailPage: NextPage = () => {
	const router = useRouter();
	const { jobId } = router.query as { jobId: string };
	const [similar, setSimilarJobs] = useState<Job[]>([]);

	const [liked, setLiked] = useState(false);

	const { data, loading, error, refetch } = useQuery<{ getJob: Job }>(GET_JOB, {
		variables: { input: jobId },
		skip: !jobId,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});

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

	const logo = job.companyLogo ? `${REACT_APP_API_URL}/${job.companyLogo}` : '/img/profile/defaultCompany.svg';

	return (
		<div className={styles.wrap}>
			{/* Hero / Header */}
			<div className={styles.hero}>
				<div className={styles.heroBrand}>
					<img className={styles.logo} src={logo} alt={`${job.companyName || 'Company'} logo`} />
					<div>
						<h1 className={styles.title}>{job.positionTitle}</h1>
						<div className={styles.brandMeta}>
							<DomainIcon />
							<span className={styles.companyName}>{job.companyName || '—'}</span>
							<span className={`${styles.status} ${styles[statusTone]}`}>
								<CheckCircleIcon />
								<span>{job.jobStatus || '—'}</span>
							</span>
						</div>
					</div>
				</div>
				<div className={styles.heroActions}>
					<button
						className={`${styles.iconBtn} ${liked ? styles.liked : ''}`}
						aria-label={liked ? 'Saved' : 'Save job'}
						onClick={() => setLiked((v) => !v)}
						title={liked ? 'Saved' : 'Save job'}
					>
						{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</button>
					<button className={styles.iconBtn} aria-label="Share" onClick={copyLink} title="Copy link">
						<ShareIcon />
					</button>
					<button className={styles.btnPrimary}>Apply Now</button>
				</div>
			</div>

			{/* Meta grid */}
			<section className={styles.metaGrid}>
				<div className={styles.metaCard}>
					<WorkOutlineIcon />
					<div>
						<div className={styles.metaLabel}>Type</div>
						<div className={styles.metaValue}>{pretty(job.jobType) || '—'}</div>
					</div>
				</div>
				<div className={styles.metaCard}>
					<TimelineIcon />
					<div>
						<div className={styles.metaLabel}>Level</div>
						<div className={styles.metaValue}>{pretty(job.employmentLevel) || '—'}</div>
					</div>
				</div>
				<div className={styles.metaCard}>
					<LocationOnIcon />
					<div>
						<div className={styles.metaLabel}>Location</div>
						<div className={styles.metaValue}>
							{pretty(job.jobLocation)}
							{job.jobAddress ? ` · ${job.jobAddress}` : ''}
						</div>
					</div>
				</div>
				<div className={styles.metaCard}>
					<PaidIcon />
					<div>
						<div className={styles.metaLabel}>Salary</div>
						<div className={styles.metaValue}>{formatCurrency(job.jobSalary)}</div>
					</div>
				</div>
				<div className={styles.metaCard}>
					<TimelineIcon />
					<div>
						<div className={styles.metaLabel}>Experience</div>
						<div className={styles.metaValue}>{job.experienceYears != null ? `${job.experienceYears} yrs` : '—'}</div>
					</div>
				</div>
				<div className={styles.metaCard}>
					<SchoolIcon />
					<div>
						<div className={styles.metaLabel}>Education</div>
						<div className={styles.metaValue}>{pretty(job.educationLevel) || '—'}</div>
					</div>
				</div>
			</section>

			{/* Body: left content + sticky apply */}
			<div className={styles.body}>
				<main className={styles.leftCol}>
					{/* Description */}
					<section className={styles.card}>
						<h2 className={styles.sectionTitle}>About the Role</h2>
						<p className={styles.paragraph}>{job.jobDesc || 'No description provided.'}</p>
					</section>

					{/* Skills */}
					{Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0 && (
						<section className={styles.card}>
							<h2 className={styles.sectionTitle}>Skills</h2>
							<div className={styles.chips}>
								{job.skillsRequired.map((skill, i) => (
									<span key={`${skill}-${i}`} className={styles.chip}>
										{skill}
									</span>
								))}
							</div>
						</section>
					)}

					{/* Similar jobs */}
					<section className={styles.card}>
						<div className={styles.rowBetween}>
							<h2 className={styles.sectionTitle}>Similar Jobs</h2>
							{!simLoading && similar.length > 0 && (
								<Link className={styles.link} href={`/search?type=${job.jobType || ''}`}>
									View all
								</Link>
							)}
						</div>

						{simLoading && (
							<div className={styles.simGrid}>
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={i} className={styles.simCardSkel} />
								))}
							</div>
						)}

						{!simLoading && similar.length === 0 && <p className={styles.muted}>No similar jobs found yet.</p>}

						{!simLoading && similar.length > 0 && (
							<div className={styles.simGrid}>
								{similar.map((s) => {
									const sLogo = s.companyLogo
										? `${REACT_APP_API_URL}/${s.companyLogo}`
										: '/img/profile/defaultCompany.svg';
									return (
										<Link key={s._id} href={`/jobs/${s._id}`} className={styles.simCard}>
											<div className={styles.simHead}>
												<img src={sLogo} alt="logo" />
												<div className={styles.simMeta}>
													<div className={styles.simTitle}>{s.positionTitle}</div>
													<div className={styles.simCompany}>{s.companyName || '—'}</div>
												</div>
											</div>
											<div className={styles.simInfo}>
												<span>{pretty(s.jobLocation) || '—'}</span>
												<span>•</span>
												<span>{pretty(s.jobType) || '—'}</span>
											</div>
											<div className={styles.simSalary}>{formatCurrency(s.jobSalary)}</div>
											{Array.isArray(s.skillsRequired) && s.skillsRequired.length > 0 && (
												<div className={styles.simChips}>
													{s.skillsRequired.slice(0, 3).map((k) => (
														<span key={k}>{k}</span>
													))}
												</div>
											)}
										</Link>
									);
								})}
							</div>
						)}
					</section>
				</main>

				{/* Sticky apply / summary */}
				<aside className={styles.rightCol}>
					<div className={styles.stickyCard}>
						<div className={styles.stickyPrice}>{formatCurrency(job.jobSalary)}</div>
						<button className={styles.btnPrimaryWide}>Apply Now</button>
						<div className={styles.stickyInfo}>
							<div>
								<span>Status</span>
								<strong>{job.jobStatus || '—'}</strong>
							</div>
							<div>
								<span>Type</span>
								<strong>{pretty(job.jobType) || '—'}</strong>
							</div>
							<div>
								<span>Level</span>
								<strong>{pretty(job.employmentLevel) || '—'}</strong>
							</div>
							<div>
								<span>Location</span>
								<strong>{pretty(job.jobLocation) || '—'}</strong>
							</div>
							<div>
								<span>Address</span>
								<strong>{job.jobAddress || '—'}</strong>
							</div>
							<div>
								<span>Experience</span>
								<strong>{job.experienceYears != null ? `${job.experienceYears} yrs` : '—'}</strong>
							</div>
							<div>
								<span>Education</span>
								<strong>{pretty(job.educationLevel) || '—'}</strong>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default withLayoutBasic(JobDetailPage);
