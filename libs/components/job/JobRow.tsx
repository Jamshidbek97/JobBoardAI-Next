import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import { Button } from '@mui/material';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { Job } from '../../types/job/job';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../auth';

export type JobRowProps = {
	likePropertyHandler?: any;
	job: Job;
	onLike?: (id: string) => void;
	onApply?: (id: string) => void;
};

export default React.memo(function JobRow({ job, onApply, likePropertyHandler }: JobRowProps) {
	const statusClosed = job.jobStatus === 'CLOSED';
	const salaryYr = job.jobSalary ? `$${job.jobSalary.toLocaleString()}/yr` : '—';
	const salaryMo = job.jobSalary ? `$${Math.round(job.jobSalary / 12).toLocaleString()}/mo` : '';
	const user = useReactiveVar(userVar);
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt && !user?._id) updateUserInfo(jwt);
	}, [user?._id]);
	console.log('User', user);

	const locationMap: Record<string, string> = {
		SEOUL: 'Seoul',
		BUSAN: 'Busan',
		JEJU: 'Jeju',
		INCHEON: 'Incheon',
		DAEGU: 'Gyeongido',
	};
	const loc = locationMap[job.jobLocation] ?? job.jobLocation ?? '';

	const typeMap: Record<string, string> = {
		FULL_TIME: 'Full Time',
		PART_TIME: 'Part Time',
		CONTRACT: 'Contract',
		INTERN: 'Internship',
	};
	const type = typeMap[job.jobType] ?? job.jobType ?? '';

	const days = job.createdAt ? Math.floor((Date.now() - new Date(job.createdAt as any).getTime()) / 86400000) : 0;
	const ago = days <= 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;

	const isLiked = Array.isArray(job?.meLiked) && job.meLiked.length > 0 && job.meLiked[0]?.myFavorite === true;

	return (
		<div className={`job-row ${statusClosed ? 'is-closed' : ''}`}>
			<div className="job-row__logo">
				{job.companyLogo && job.companyLogo !== 'logo' ? (
					<Image src={job.companyLogo} alt={`${job.companyName} logo`} width={44} height={44} />
				) : (
					<div className="logo-fallback">{job.companyName?.charAt(0) ?? 'C'}</div>
				)}
			</div>

			<div className="job-row__main">
				<a className="job-row__title" href={`/jobs/${job._id}`}>
					{job.positionTitle}
				</a>
				<div className="job-row__company">{job.companyName || 'Company'}</div>
			</div>

			<div className="job-row__meta">
				<span className="badge">{type}</span>
				<span className="meta">
					<PlaceOutlinedIcon fontSize="small" /> {loc}
				</span>
				<span className="meta">
					<ScheduleOutlinedIcon fontSize="small" /> {ago}
				</span>
				<div className="salary-column">
					<span className="meta">
						<PaidOutlinedIcon fontSize="small" /> {salaryYr}
					</span>
					<span className="meta">
						<PaidOutlinedIcon fontSize="small" />
						{salaryMo ? ` · ${salaryMo}` : ''}
					</span>
				</div>
			</div>

			<div className="job-row__actions">
				<button
					className={`like ${job.jobLikes ? 'is-liked' : ''}`}
					aria-label="Like job"
					onClick={() => likePropertyHandler?.(user, job._id)}
				>
					{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}

					<span className="count">{job.jobLikes || 0}</span>
				</button>
				<Button className="apply" variant="contained" disabled={statusClosed} onClick={() => onApply?.(job._id)}>
					{statusClosed ? 'Closed' : 'Apply Now'}
				</Button>
			</div>
		</div>
	);
});
