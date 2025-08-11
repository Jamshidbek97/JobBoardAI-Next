'use client';

import React, { useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import styles from './DetailPage.module.scss';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PinDropIcon from '@mui/icons-material/PinDrop';
import PaidIcon from '@mui/icons-material/Paid';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// --- GraphQL ---
const GET_JOB = gql`
	query GetJob($input: String!) {
		getJob(jobId: $input) {
			_id
			jobType
			jobStatus
			jobLocation
			positionTitle
			jobSalary
			skillsRequired
			experienceYears
			educationLevel
			# Add more fields here if your API returns them (company, description, postedAt, etc.)
		}
	}
`;

type Job = {
	_id: string;
	jobType: string;
	jobStatus: string;
	jobLocation: string;
	positionTitle: string;
	jobSalary?: number | string | null;
	skillsRequired?: string[] | null;
	experienceYears?: number | null;
	educationLevel?: string | null;
};

export default function JobDetailPage() {
	const params = useParams<{ jobId: string }>();
	const jobId = params?.jobId;

	const { data, loading, error, refetch } = useQuery<{ getJob: Job }>(GET_JOB, {
		variables: { input: jobId },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});

	const job = data?.getJob;

	const statusTone = useMemo(() => {
		if (!job?.jobStatus) return 'default';
		const s = job.jobStatus.toLowerCase();
		if (s.includes('open')) return 'open';
		if (s.includes('paused') || s.includes('hold')) return 'paused';
		if (s.includes('closed')) return 'closed';
		return 'default';
	}, [job?.jobStatus]);

	// Simulated like state; wire to your LIKE_TARGET_JOB mutation as needed
	const [liked, setLiked] = React.useState(false);

	if (loading) {
		return (
			<div className={`job-detail-page ${styles.detail}`}>
				<div className={styles.skeleton}>
					<div className={styles.skeletonHeader} />
					<div className={styles.skeletonMeta} />
					<div className={styles.skeletonBlock} />
					<div className={styles.skeletonBlock} />
				</div>
			</div>
		);
	}

	if (error || !job) {
		return (
			<div className={`job-detail-page ${styles.detail}`}>
				<div className={styles.errorBox}>
					<ErrorOutlineIcon className={styles.errorIcon} />
					<div>
						<h2>문제가 발생했어요</h2>
						<p>채용 공고를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
						<button className={styles.btnSecondary} onClick={() => refetch()}>
							다시 시도
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`job-detail-page ${styles.detail}`}>
			{/* Header */}
			<header className={styles.header}>
				<div className={styles.titleWrap}>
					<h1 className={styles.title}>{job.positionTitle}</h1>
					<div className={`${styles.status} ${styles[statusTone]}`}>
						<CheckCircleIcon />
						<span>{job.jobStatus}</span>
					</div>
				</div>
				<div className={styles.headerActions}>
					<button
						className={`${styles.iconBtn} ${liked ? styles.liked : ''}`}
						aria-label={liked ? 'Saved' : 'Save job'}
						onClick={() => setLiked((v) => !v)}
						title={liked ? 'Saved' : 'Save job'}
					>
						{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</button>
					<button className={styles.btnPrimary}>지원하기</button>
				</div>
			</header>

			{/* Meta Bar */}
			<section className={styles.metaBar}>
				<div className={styles.metaItem}>
					<WorkOutlineIcon />
					<div>
						<span className={styles.metaLabel}>고용 형태</span>
						<span className={styles.metaValue}>{job.jobType}</span>
					</div>
				</div>
				<div className={styles.metaItem}>
					<PinDropIcon />
					<div>
						<span className={styles.metaLabel}>근무지</span>
						<span className={styles.metaValue}>{job.jobLocation}</span>
					</div>
				</div>
				<div className={styles.metaItem}>
					<PaidIcon />
					<div>
						<span className={styles.metaLabel}>연봉</span>
						<span className={styles.metaValue}>{job.jobSalary ? job.jobSalary : '협의'}</span>
					</div>
				</div>
				<div className={styles.metaItem}>
					<TimelineIcon />
					<div>
						<span className={styles.metaLabel}>경력</span>
						<span className={styles.metaValue}>
							{job.experienceYears != null ? `${job.experienceYears}년` : '무관'}
						</span>
					</div>
				</div>
				<div className={styles.metaItem}>
					<SchoolIcon />
					<div>
						<span className={styles.metaLabel}>학력</span>
						<span className={styles.metaValue}>{job.educationLevel || '무관'}</span>
					</div>
				</div>
			</section>

			{/* Body Layout */}
			<main className={styles.body}>
				<article className={styles.left}>
					{/* Description — replace with real job description from API if available */}
					<section className={styles.card}>
						<h2 className={styles.sectionTitle}>업무 소개</h2>
						<p className={styles.paragraph}>
							팀과 함께 제품/서비스를 성장시키고 사용자 가치를 극대화할 수 있는 분을 찾고 있어요. 세부 업무는 협의 후
							조정될 수 있습니다.
						</p>
						<ul className={styles.bullets}>
							<li>핵심 기능 설계 및 구현</li>
							<li>코드 품질, 테스트, 안정성 향상</li>
							<li>협업 도구를 활용한 커뮤니케이션</li>
						</ul>
					</section>

					{/* Skills */}
					{Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0 && (
						<section className={styles.card}>
							<h2 className={styles.sectionTitle}>필수/우대 역량</h2>
							<div className={styles.chips}>
								{job.skillsRequired.map((skill, i) => (
									<span key={`${skill}-${i}`} className={styles.chip}>
										{skill}
									</span>
								))}
							</div>
						</section>
					)}

					{/* Call to Action */}
					<section className={`${styles.card} ${styles.applyBlock}`}>
						<div className={styles.applyText}>
							<h3>이 포지션이 마음에 드시나요?</h3>
							<p>지금 지원하고 커리어를 한 단계 끌어올리세요.</p>
						</div>
						<div className={styles.applyActions}>
							<button className={styles.btnPrimary}>지금 지원</button>
							<button
								className={`${styles.iconBtn} ${liked ? styles.liked : ''}`}
								onClick={() => setLiked((v) => !v)}
								aria-label="Save job"
							>
								{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
							</button>
						</div>
					</section>
				</article>

				{/* Sidebar */}
				<aside className={styles.right}>
					<section className={styles.card}>
						<h3 className={styles.sectionTitle}>채용 정보</h3>
						<div className={styles.infoRow}>
							<span>상태</span>
							<strong>{job.jobStatus}</strong>
						</div>
						<div className={styles.infoRow}>
							<span>형태</span>
							<strong>{job.jobType}</strong>
						</div>
						<div className={styles.infoRow}>
							<span>근무지</span>
							<strong>{job.jobLocation}</strong>
						</div>
						<div className={styles.infoRow}>
							<span>연봉</span>
							<strong>{job.jobSalary ? job.jobSalary : '협의'}</strong>
						</div>
						<div className={styles.infoRow}>
							<span>경력</span>
							<strong>{job.experienceYears != null ? `${job.experienceYears}년` : '무관'}</strong>
						</div>
						<div className={styles.infoRow}>
							<span>학력</span>
							<strong>{job.educationLevel || '무관'}</strong>
						</div>
						<button className={styles.btnSecondary} onClick={() => refetch()}>
							새로고침
						</button>
					</section>

					{/* Placeholder company card — bind real data if you have it */}
					<section className={styles.card}>
						<h3 className={styles.sectionTitle}>회사 정보</h3>
						<p className={styles.paragraph}>회사 소개/문화/복지 등 상세 정보가 여기에 표시됩니다.</p>
						<a className={styles.link} href="#" onClick={(e) => e.preventDefault()}>
							더 알아보기
						</a>
					</section>
				</aside>
			</main>
		</div>
	);
}
