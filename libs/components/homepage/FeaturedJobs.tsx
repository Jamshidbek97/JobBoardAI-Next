import React, { useState } from 'react';
import { Stack, Box, Button, Skeleton, Typography } from '@mui/material';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { JobType, JobLocation, EducationLevel } from '../../enums/job.enum';
import { useTranslation } from 'next-i18next';
import { Job } from '../../types/job/job';
import { AllJobsInquiry } from '../../types/job/job.input';
import { LIKE_TARGET_JOB } from '../../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_JOBS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface FeaturedJobsProps {
	initialInput: AllJobsInquiry;
}

const FeaturedJobs = (props: FeaturedJobsProps) => {
	const { initialInput } = props;
	const { t } = useTranslation('common');
	const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});
	const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);

	// Apollo requests
	const [likeTargetJobs] = useMutation(LIKE_TARGET_JOB);

	const {
		loading: getJobsLoading,
		data: getJobsData,
		error: getJobsError,
		refetch: getJobsRefetch,
	} = useQuery(GET_JOBS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFeaturedJobs(data?.getJobs?.list);
		},
	});
	const toggleSaveJob = (jobId: string) => {
		setSavedJobs((prev) => ({
			...prev,
			[jobId]: !prev[jobId],
		}));
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
				return t('education.highschool');
			case EducationLevel.BACHELOR:
				return t('education.bachelor');
			case EducationLevel.MASTER:
				return t('education.master');
			case EducationLevel.DOCTORATE:
				return t('education.doctorate');
			default:
				return level;
		}
	};

	const renderJobCard = (job: Job, index: number) => (
		<div className="featured-job-card" key={job._id || index}>
			<div className="card-header">
				<div className="company-logo">
					{job.companyLogo ? (
						<img src={job.companyLogo} alt={job.memberData?.memberNick} />
					) : (
						<div className="logo-placeholder">{job.memberData?.memberNick?.charAt(0) || 'C'}</div>
					)}
				</div>
				<button
					className={`save-button ${savedJobs[job._id] ? 'saved' : ''}`}
					onClick={() => toggleSaveJob(job._id)}
					aria-label={savedJobs[job._id] ? t('job.unsave') : t('job.save')}
				>
					{savedJobs[job._id] ? <BookmarkIcon /> : <BookmarkBorderIcon />}
				</button>
			</div>

			<div className="job-title">{job.positionTitle}</div>

			<div className="company-name">{job.memberData?.memberNick || t('job.company')}</div>

			<div className="job-details">
				<div className="detail-item">
					<LocationOnOutlinedIcon />
					<span>{getJobLocationText(job.jobLocation)}</span>
				</div>
				<div className="detail-item">
					<WorkOutlineOutlinedIcon />
					<span>{job.jobType}</span>
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

			<div className="skills-container">
				{job.skillsRequired?.map((skill, i) => (
					<span key={i} className="skill-tag">
						{skill}
					</span>
				))}
			</div>

			<div className="job-footer">
				<span className="time-ago">{t('job.posted')}: 2d ago</span>
				<Button variant="contained" className="apply-button">
					{t('job.apply')}
				</Button>
			</div>
		</div>
	);

	const renderSkeleton = () => (
		<div className="featured-job-card skeleton">
			<Skeleton variant="circular" width={60} height={60} />
			<Skeleton variant="text" width="80%" height={30} />
			<Skeleton variant="text" width="60%" />
			<div className="job-details">
				<Skeleton variant="text" width="40%" />
				<Skeleton variant="text" width="40%" />
			</div>
			<div className="skills-container">
				<Skeleton variant="text" width="60px" />
				<Skeleton variant="text" width="70px" />
				<Skeleton variant="text" width="50px" />
			</div>
			<div className="job-footer">
				<Skeleton variant="text" width="80px" />
				<Skeleton variant="rectangular" width="100px" height={36} />
			</div>
		</div>
	);

	return (
		<Stack className="featured-jobs-section">
			<Box className="section-header">
				<Typography variant="h3" className="section-title">
					{t('home.featured_jobs')}
				</Typography>
				<Typography className="section-subtitle">{t('home.featured_jobs_desc')}</Typography>
			</Box>

			<Box className="jobs-carousel-container">
				<div className="navigation-buttons">
					<button className="swiper-button-prev">
						<WestIcon />
					</button>
					<button className="swiper-button-next">
						<EastIcon />
					</button>
				</div>

				<Swiper
					modules={[Navigation, Pagination, Autoplay]}
					spaceBetween={25}
					slidesPerView={'auto'}
					navigation={{
						prevEl: '.swiper-button-prev',
						nextEl: '.swiper-button-next',
					}}
					pagination={{ clickable: true }}
					autoplay={{ delay: 5000, disableOnInteraction: false }}
					breakpoints={{
						320: { slidesPerView: 1 },
						640: { slidesPerView: 2 },
						960: { slidesPerView: 3 },
						1280: { slidesPerView: 4 },
					}}
				>
					{getJobsLoading
						? Array.from({ length: 4 }).map((_, index) => <SwiperSlide key={index}>{renderSkeleton()}</SwiperSlide>)
						: featuredJobs.map((job: any, index: any) => (
								<SwiperSlide key={job._id || index}>{renderJobCard(job, index)}</SwiperSlide>
						  ))}
				</Swiper>
			</Box>

			<Box className="view-all-container">
				<Button variant="outlined" className="view-all-button">
					{t('home.view_all_jobs')} <EastIcon className="arrow-icon" />
				</Button>
			</Box>
		</Stack>
	);
};

FeaturedJobs.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'jobRank',
		direction: 'DESC',
		search: {},
	},
};

export default FeaturedJobs;
