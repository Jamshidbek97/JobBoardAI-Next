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
import { REACT_APP_API_URL } from '../../config';

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

	// Create proper image path with fallback
	const imagePath: string = job?.companyLogo ? `${REACT_APP_API_URL}/${job.companyLogo}` : '/img/brands/g.png';

	return (
		<div className={`job-row ${statusClosed ? 'is-closed' : ''}`} style={{
			display: 'grid',
			gridTemplateColumns: '56px 1fr auto auto',
			alignItems: 'center',
			gap: '16px',
			padding: '20px',
			border: '1px solid #e9edf4',
			borderRadius: '14px',
			background: '#fff',
			boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
			transition: 'all 0.2s ease',
			opacity: statusClosed ? 0.65 : 1,
			width: '100%'
		}}
		onMouseEnter={e => {
			if (!statusClosed) {
				e.currentTarget.style.transform = 'translateY(-2px)';
				e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
				e.currentTarget.style.borderColor = '#e3e8f4';
			}
		}}
		onMouseLeave={e => {
			e.currentTarget.style.transform = 'translateY(0)';
			e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
			e.currentTarget.style.borderColor = '#e9edf4';
		}}>
			<div className="job-row__logo" style={{
				width: '56px',
				height: '56px',
				borderRadius: '12px',
				background: '#f6f8fc',
				display: 'grid',
				placeItems: 'center',
				overflow: 'hidden',
				border: '1px solid #eef2f7'
			}}>
				{job.companyLogo ? (
					<Image
						src={imagePath}
						alt={`${job.companyName} logo`}
						width={44}
						height={44}
						style={{ objectFit: 'contain' }}
						onError={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.display = 'none';
							const parent = target.parentElement;
							if (parent) {
								const fallback = document.createElement('div');
								fallback.className = 'logo-fallback';
								fallback.textContent = job.companyName?.charAt(0) ?? 'G';
								fallback.style.cssText = `
									width: 44px;
									height: 44px;
									border-radius: 10px;
									display: grid;
									place-items: center;
									font-weight: 800;
									color: #fff;
									background: linear-gradient(135deg, #4f46e5, #22c1c3);
									font-size: 18px;
								`;
								parent.appendChild(fallback);
							}
						}}
					/>
				) : (
					<div className="logo-fallback" style={{
						width: '44px',
						height: '44px',
						borderRadius: '10px',
						display: 'grid',
						placeItems: 'center',
						fontWeight: 800,
						color: '#fff',
						background: 'linear-gradient(135deg, #4f46e5, #22c1c3)',
						fontSize: '18px'
					}}>
						{job.companyName?.charAt(0) ?? 'G'}
					</div>
				)}
			</div>

			<div className="job-row__main" style={{ minWidth: 0 }}>
				<a className="job-row__title" href={`/jobs/${job._id}`} style={{
					display: 'inline-block',
					fontWeight: 700,
					fontSize: '18px',
					color: '#0f172a',
					textDecoration: 'none',
					cursor: 'pointer',
					marginBottom: '4px',
					lineHeight: '1.3'
				}}
				onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
				onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
					{job.positionTitle}
				</a>
				<div className="job-row__company" style={{
					marginTop: '2px',
					color: '#64748b',
					fontWeight: 600,
					fontSize: '14px'
				}}>
					{job.companyName || 'Company'}
				</div>
			</div>

			<div className="job-row__meta" style={{
				display: 'flex',
				alignItems: 'center',
				gap: '14px',
				color: '#475569',
				fontSize: '14px',
				flexWrap: 'wrap'
			}}>
				<span className="badge" style={{
					padding: '4px 10px',
					borderRadius: '999px',
					background: '#eef2ff',
					color: '#4f46e5',
					fontWeight: 700,
					fontSize: '12px',
					whiteSpace: 'nowrap'
				}}>
					{type}
				</span>
				<span className="meta" style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: '6px',
					whiteSpace: 'nowrap'
				}}>
					<PlaceOutlinedIcon fontSize="small" style={{ opacity: 0.75 }} /> {loc}
				</span>
				<span className="meta" style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: '6px',
					whiteSpace: 'nowrap'
				}}>
					<ScheduleOutlinedIcon fontSize="small" style={{ opacity: 0.75 }} /> {ago}
				</span>
				<div className="salary-column" style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '2px',
					minWidth: '90px'
				}}>
					<span className="meta" style={{
						display: 'flex',
						alignItems: 'center',
						gap: '4px',
						fontSize: '14px',
						color: '#555',
						fontWeight: 600
					}}>
						<PaidOutlinedIcon fontSize="small" style={{ opacity: 0.75 }} /> {salaryYr}
					</span>
					{salaryMo && (
						<span className="meta" style={{
							display: 'flex',
							alignItems: 'center',
							gap: '4px',
							fontSize: '14px',
							color: '#666'
						}}>
							<PaidOutlinedIcon fontSize="small" style={{ opacity: 0.75 }} />
							{salaryMo}
						</span>
					)}
				</div>
			</div>

			<div className="job-row__actions" style={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px'
			}}>
				<button
					className={`like ${isLiked ? 'is-liked' : ''}`}
					aria-label="Like job"
					onClick={() => likePropertyHandler?.(user, job._id)}
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: '6px',
						width: 'auto',
						height: '40px',
						padding: '0 12px',
						borderRadius: '999px',
						border: '1px solid #e9edf4',
						background: isLiked ? '#ffe4e6' : '#fff',
						color: isLiked ? '#e11d48' : '#7c8aa6',
						cursor: 'pointer',
						transition: 'all 0.2s ease',
						fontSize: '14px'
					}}
					onMouseEnter={e => {
						if (!isLiked) {
							e.currentTarget.style.color = '#e11d48';
							e.currentTarget.style.borderColor = '#f3d1d8';
							e.currentTarget.style.transform = 'translateY(-1px)';
							e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
						}
					}}
					onMouseLeave={e => {
						if (!isLiked) {
							e.currentTarget.style.color = '#7c8aa6';
							e.currentTarget.style.borderColor = '#e9edf4';
							e.currentTarget.style.transform = 'translateY(0)';
							e.currentTarget.style.boxShadow = 'none';
						}
					}}>
					{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					<span className="count" style={{
						fontWeight: 700,
						fontSize: '13px'
					}}>
						{job.jobLikes || 0}
					</span>
				</button>
				<Button 
					className="apply" 
					variant="contained" 
					disabled={statusClosed} 
					onClick={() => onApply?.(job._id)}
					style={{
						textTransform: 'none',
						fontWeight: 700,
						borderRadius: '999px',
						padding: '10px 20px',
						minWidth: 'auto',
						background: statusClosed ? '#6b7280' : 'linear-gradient(90deg, #4f46e5, #3b82f6)',
						boxShadow: statusClosed ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
						transition: 'all 0.2s ease',
						fontSize: '14px',
						color: '#fff',
						border: 'none'
					}}
					onMouseEnter={e => {
						if (!statusClosed) {
							e.currentTarget.style.transform = 'translateY(-1px)';
							e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
						}
					}}
					onMouseLeave={e => {
						if (!statusClosed) {
							e.currentTarget.style.transform = 'translateY(0)';
							e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
						}
					}}>
					{statusClosed ? 'Closed' : 'Apply Now'}
				</Button>
			</div>
		</div>
	);
});
