import React, { useState } from 'react';
import { Box, Button, Skeleton, Typography, Chip, Avatar } from '@mui/material';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import { JobType, JobLocation, EducationLevel } from '../../enums/job.enum';
import { Job } from '../../types/job/job';
import { AllJobsInquiry } from '../../types/job/job.input';
import { LIKE_TARGET_JOB } from '../../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_JOBS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface FeaturedJobsProps {
	initialInput: AllJobsInquiry;
}

const FeaturedJobs = ({ initialInput }: FeaturedJobsProps) => {
	const [likedJobs, setLikedJobs] = useState<Record<string, boolean>>({});
	const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);

	const [likeTargetJobs] = useMutation(LIKE_TARGET_JOB);

	const { loading: getJobsLoading } = useQuery(GET_JOBS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setFeaturedJobs(data?.getJobs?.list),
	});

	const toggleLikeJob = (jobId: string) => {
		setLikedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
		likeTargetJobs({ variables: { input: jobId } });
	};

	// === Helpers ===
	const getJobTypeText = (type: JobType) => {
		switch (type) {
			case JobType.FULL_TIME:
				return 'Full-time';
			case JobType.PART_TIME:
				return 'Part-time';
			case JobType.CONTRACT:
				return 'Contract';
			case JobType.INTERN:
				return 'Internship';
			default:
				return type;
		}
	};

	const getJobLocationText = (location: JobLocation) => {
		switch (location) {
			case JobLocation.SEOUL:
				return 'Seoul';
			case JobLocation.DAEGU:
				return 'Gyeongido';
			case JobLocation.BUSAN:
				return 'Busan';
			case JobLocation.JEJU:
				return 'Jejudo';
			case JobLocation.INCHEON:
				return 'Incheon';
			default:
				return location;
		}
	};

	const getEducationLevelText = (level: EducationLevel) => {
		switch (level) {
			case EducationLevel.HIGH_SCHOOL:
				return 'High School';
			case EducationLevel.BACHELOR:
				return "Bachelor's";
			case EducationLevel.MASTER:
				return "Master's";
			case EducationLevel.DOCTORATE:
				return 'PhD';
			default:
				return level;
		}
	};

	const getPostedTime = (createdAt: string) => {
		const createdDate = new Date(createdAt);
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return '1 day ago';
		return `${diffDays} days ago`;
	};

	const renderJobCard = (job: Job, index: number) => (
		<div className="featured-job-card" key={job._id || index}>
			<div className="featured-badge">Featured</div>

			<div className="card-header">
				<div className="company-logo">
					{job.companyLogo ? (
						<img src={job.companyLogo} alt={job.memberData?.memberNick || 'Company logo'} className="logo-image" />
					) : (
						<div className="logo-placeholder">{job.memberData?.memberNick?.charAt(0) || 'C'}</div>
					)}
				</div>
				<button
					className={`like-button ${likedJobs[job._id] ? 'liked' : ''}`}
					onClick={() => toggleLikeJob(job._id)}
					aria-label={likedJobs[job._id] ? 'Unlike job' : 'Like job'}
				>
					{likedJobs[job._id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
				</button>
			</div>

			<div className="job-title">{job.positionTitle}</div>

			<div className="company-info">
				<div className="company-name">{job.memberData?.memberNick || 'Company'}</div>
				{job.memberData?.memberFullName && (
					<div className="poster-name">
						<PersonOutlineIcon fontSize="small" />
						<span>{job.memberData.memberFullName}</span>
					</div>
				)}
			</div>

			<div className="job-details">
				<div className="detail-item">
					<LocationOnOutlinedIcon />
					<span>{getJobLocationText(job.jobLocation)}</span>
				</div>
				<div className="detail-item">
					<WorkOutlineOutlinedIcon />
					<span>{getJobTypeText(job.jobType)}</span>
				</div>
			</div>

			<div className="job-details">
				<div className="detail-item">
					<AttachMoneyOutlinedIcon />
					<span>${job.jobSalary?.toLocaleString()}/yr</span>
				</div>
				<div className="detail-item">
					<SchoolOutlinedIcon />
					<span>{getEducationLevelText(job.educationLevel)}</span>
				</div>
			</div>

			<div className="engagement-stats">
				<div className="stat-item">
					<VisibilityOutlinedIcon fontSize="small" />
					<span>{job.jobViews || 0} views</span>
				</div>
				<div className="stat-item">
					<FavoriteOutlinedIcon fontSize="small" />
					<span>{job.jobLikes || 0} likes</span>
				</div>
			</div>

			{Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0 && (
				<div className="skills-container">
					{job.skillsRequired.slice(0, 6).map((skill, i) => (
						<Chip key={i} label={skill} size="small" className="skill-tag" />
					))}
					{job.skillsRequired.length > 6 && (
						<Chip size="small" className="skill-tag more" label={`+${job.skillsRequired.length - 6}`} />
					)}
				</div>
			)}

			<div className="job-footer">
				<span className="time-ago">
					{job.createdAt
						? getPostedTime(typeof job.createdAt === 'string' ? job.createdAt : job.createdAt.toISOString())
						: 'Recently posted'}
				</span>
				<Button variant="contained" className="apply-button">
					Apply Now
				</Button>
			</div>
		</div>
	);

	const renderSkeleton = () => (
		<div className="featured-job-card skeleton">
			<div className="s-row">
				<Skeleton variant="circular" width={96} height={96} />
			</div>
			<Skeleton variant="text" width="90%" height={28} />
			<Skeleton variant="text" width="55%" />
			<div className="job-details">
				<Skeleton variant="text" width="40%" />
				<Skeleton variant="text" width="40%" />
			</div>
			<div className="skills-container">
				<Skeleton variant="rounded" width={60} height={24} />
				<Skeleton variant="rounded" width={70} height={24} />
				<Skeleton variant="rounded" width={50} height={24} />
			</div>
			<div className="job-footer">
				<Skeleton variant="text" width={80} />
				<Skeleton variant="rounded" width={110} height={36} />
			</div>
		</div>
	);

	return (
		<section className="featured-job">
			<div className="featured-jobs-container">
				<Box className="section-header">
					<Typography variant="h3" className="section-title">
						Featured Job Opportunities
					</Typography>
					<Typography className="section-subtitle">Discover top positions from leading companies</Typography>
				</Box>

				<Box className="jobs-carousel-container">
					<div className="navigation-buttons">
						<button className="fj-prev">
							<WestIcon />
						</button>
						<button className="fj-next">
							<EastIcon />
						</button>
					</div>

					<Swiper
						modules={[Navigation, Pagination, Autoplay]}
						spaceBetween={40}
						slidesPerView={'auto'}
						navigation={{ prevEl: '.fj-prev', nextEl: '.fj-next' }}
						pagination={{ clickable: true }}
						autoplay={{ delay: 5000, disableOnInteraction: false }}
						breakpoints={{
							320: { slidesPerView: 1 },
							640: { slidesPerView: 2 },
							960: { slidesPerView: 3 },
							1280: { slidesPerView: 3 },
						}}
					>
						{getJobsLoading
							? Array.from({ length: 3 }).map((_, i) => <SwiperSlide key={i}>{renderSkeleton()}</SwiperSlide>)
							: featuredJobs.map((job: any, index: any) => (
									<SwiperSlide key={job._id || index}>{renderJobCard(job, index)}</SwiperSlide>
							  ))}
					</Swiper>
				</Box>

				<Box className="view-all-container">
					<Button variant="outlined" className="view-all-button">
						View All Jobs <EastIcon className="arrow-icon" />
					</Button>
				</Box>
			</div>
		</section>
	);
};

FeaturedJobs.defaultProps = {
	initialInput: { page: 1, limit: 8, sort: 'jobRank', direction: 'DESC', search: {} },
};

export default FeaturedJobs;
