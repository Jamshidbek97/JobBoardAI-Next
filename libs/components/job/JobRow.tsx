// ...imports you already have...
import Image from 'next/image';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import { Job } from '../../types/job/job';
import { Button } from '@mui/material';

function getJobTypeText(type?: string) {
	if (!type) return '';
	const map: Record<string, string> = {
		FULL_TIME: 'Full Time',
		PART_TIME: 'Part Time',
		CONTRACT: 'Contract',
		INTERN: 'Internship',
	};
	return map[type] ?? type;
}
function getLocationText(loc?: string) {
	const map: Record<string, string> = {
		SEOUL: 'Seoul',
		BUSAN: 'Busan',
		JEJU: 'Jeju',
		INCHEON: 'Incheon',
		DAEGU: 'Gyeongido',
	};
	if (!loc) return '';
	return map[loc] ?? loc;
}
function timeAgo(iso?: string | Date) {
	if (!iso) return '';
	const d = typeof iso === 'string' ? new Date(iso) : iso;
	const days = Math.floor((Date.now() - d.getTime()) / 86400000);
	if (days <= 0) return 'Today';
	if (days === 1) return '1 day ago';
	return `${days} days ago`;
}

type JobRowProps = {
	job: Job;
	onLike?: (id: string) => void;
};
const JobRow: React.FC<JobRowProps> = ({ job, onLike }) => {
	const salaryYr = job.jobSalary ? `$${job.jobSalary.toLocaleString()}/yr` : '—';
	const salaryMo = job.jobSalary ? `$${Math.round(job.jobSalary / 12).toLocaleString()}/mo` : '';
	const statusClosed = job.jobStatus === 'CLOSED';

	return (
		<div className={`job-row ${statusClosed ? 'is-closed' : ''}`}>
			{/* Logo */}
			<div className="job-row__logo">
				{job.companyLogo && job.companyLogo !== 'logo' ? (
					// if you later have real logo urls, swap src accordingly
					<Image src={job.companyLogo} alt={`${job.companyName} logo`} width={44} height={44} />
				) : (
					<div className="logo-fallback" aria-label={job.companyName}>
						{job.companyName?.charAt(0) || 'C'}
					</div>
				)}
			</div>

			{/* Title/company */}
			<div className="job-row__main">
				<a className="job-row__title" href={`/job/${job._id}`}>
					{job.positionTitle}
				</a>
				<div className="job-row__company">{job.companyName || 'Company'}</div>
			</div>

			{/* Meta */}
			<div className="job-row__meta">
				<span className="badge">{getJobTypeText(job.jobType)}</span>
				<span className="meta">
					<PlaceOutlinedIcon fontSize="small" /> {getLocationText(job.jobLocation)}
				</span>
				<span className="meta">
					<ScheduleOutlinedIcon fontSize="small" /> {timeAgo(job.createdAt as any)}
				</span>
				<span className="meta">
					<PaidOutlinedIcon fontSize="small" /> {salaryYr}
					{salaryMo ? ` · ${salaryMo}` : ''}
				</span>
			</div>

			{/* Save + CTA */}
			<div className="job-row__actions">
				<button className="save" aria-label="Save job" onClick={() => onLike?.(job._id)}>
					<BookmarkBorderOutlinedIcon />
				</button>
				<Button className="apply" variant="contained" disabled={statusClosed} href={`/job/${job._id}#apply`}>
					{statusClosed ? 'Closed' : 'Apply Now'}
				</Button>
			</div>
		</div>
	);
};

export default JobRow;
