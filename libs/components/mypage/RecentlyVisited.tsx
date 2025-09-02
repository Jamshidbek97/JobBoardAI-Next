import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { 
	Pagination, 
	Stack, 
	Typography, 
	Box, 
	Card, 
	CardContent, 
	Avatar, 
	Chip, 
	Button, 
	IconButton,
	Divider
} from '@mui/material';
import { 
	Favorite, 
	LocationOn, 
	AccessTime, 
	AttachMoney, 
	NavigateNext, 
	NavigateBefore 
} from '@mui/icons-material';
import PropertyCard from '../job/JobRow';
import { T } from '../../types/common';
import { GET_VISITED } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { Job } from '../../types/job/job';

const RecentlyVisited: NextPage = () => {
	const device = useDeviceDetect();
	const [recentlyVisited, setRecentlyVisited] = useState<Job[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const {
		loading: getVisitedLoading,
		data: getVisitedData,
		error: getVisitedError,
		refetch: getVisitedRefetch,
	} = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setRecentlyVisited(data?.getVisited?.list);
			setTotal(data?.getVisited?.metaCounter[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	const handlePrevPage = () => {
		if (searchVisited.page > 1) {
			setSearchVisited({ ...searchVisited, page: searchVisited.page - 1 });
		}
	};

	const handleNextPage = () => {
		const maxPage = Math.ceil(total / searchVisited.limit);
		if (searchVisited.page < maxPage) {
			setSearchVisited({ ...searchVisited, page: searchVisited.page + 1 });
		}
	};

	if (device === 'mobile') {
		return <div>JobBoardAI RECENTLY VISITED MOBILE</div>;
	} else {
		return (
			<Box id="recently-visited-page" sx={{ 
				width: '100%',
				minHeight: '100vh',
				background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
				p: 4
			}}>
				{/* Header Section */}
				<Box sx={{ 
					mb: 4,
					textAlign: 'center'
				}}>
					<Typography variant="h3" sx={{ 
						fontWeight: 700, 
						color: '#1a1a1a',
						mb: 2,
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent'
					}}>
						Recently Visited
					</Typography>
					<Typography variant="h6" sx={{ 
						color: '#666',
						fontWeight: 400,
						maxWidth: '600px',
						mx: 'auto'
					}}>
						We are glad to see you again! Here are the jobs you've recently viewed.
					</Typography>
				</Box>

				{/* Jobs List */}
				<Box sx={{ 
					mb: 4,
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
					gap: 3,
					maxWidth: '1200px',
					mx: 'auto'
				}}>
					{recentlyVisited?.length ? (
						recentlyVisited?.map((job: Job, index: number) => (
							<Card key={job._id || index} sx={{ 
								borderRadius: 3,
								boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
								transition: 'all 0.3s ease',
								'&:hover': {
									transform: 'translateY(-4px)',
									boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
								}
							}}>
								<CardContent sx={{ p: 3 }}>
									{/* Job Header */}
									<Box sx={{ 
										display: 'flex', 
										alignItems: 'center', 
										mb: 2,
										gap: 2
									}}>
										<Avatar 
											src={job.companyLogo ? `${process.env.REACT_APP_API_URL}/${job.companyLogo}` : '/img/defaultCompany.jpg'}
											sx={{ 
												width: 60, 
												height: 60,
												border: '3px solid #f0f0f0'
											}}
										/>
										<Box sx={{ flex: 1 }}>
											<Typography variant="h6" sx={{ 
												fontWeight: 600,
												color: '#1a1a1a',
												mb: 0.5
											}}>
												{job.positionTitle || 'Position Title'}
											</Typography>
											<Typography variant="body2" sx={{ 
												color: '#666',
												fontWeight: 500
											}}>
												{job.companyName || 'Company Name'}
											</Typography>
										</Box>
									</Box>

									{/* Job Details */}
									<Box sx={{ 
										display: 'flex', 
										flexWrap: 'wrap', 
										gap: 1, 
										mb: 3
									}}>
										<Chip 
											label={job.jobType || 'Full Time'} 
											color="primary" 
											size="small"
											sx={{ 
												background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
												color: 'white',
												fontWeight: 600
											}}
										/>
										<Chip 
											icon={<LocationOn />}
											label={job.jobLocation || 'Location'} 
											variant="outlined"
											size="small"
											sx={{ borderColor: '#ddd' }}
										/>
										<Chip 
											icon={<AccessTime />}
											label="19 days ago" 
											variant="outlined"
											size="small"
											sx={{ borderColor: '#ddd' }}
										/>
									</Box>

									{/* Salary Information */}
									<Box sx={{ 
										display: 'flex', 
										alignItems: 'center', 
										gap: 2, 
										mb: 3
									}}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<AttachMoney sx={{ color: '#4caf50', fontSize: 20 }} />
											<Typography variant="h6" sx={{ 
												fontWeight: 700,
												color: '#1a1a1a'
											}}>
												{job.jobSalary ? `${job.jobSalary.toLocaleString()}/yr` : '45,000/yr'}
											</Typography>
										</Box>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<AttachMoney sx={{ color: '#666', fontSize: 16 }} />
											<Typography variant="body2" sx={{ color: '#666' }}>
												{job.jobSalary ? `${Math.round(job.jobSalary / 12).toLocaleString()}/mo` : '3,750/mo'}
											</Typography>
										</Box>
									</Box>

									<Divider sx={{ mb: 3 }} />

									{/* Action Buttons */}
									<Box sx={{ 
										display: 'flex', 
										justifyContent: 'space-between', 
										alignItems: 'center'
									}}>
										<Button
											startIcon={<Favorite />}
											variant="outlined"
											size="small"
											sx={{ 
												borderColor: '#ddd',
												color: '#666',
												'&:hover': {
													borderColor: '#ff4081',
													color: '#ff4081'
												}
											}}
										>
											2
										</Button>
										<Button
											variant="contained"
											size="medium"
											sx={{ 
												background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
												color: 'white',
												fontWeight: 600,
												px: 3,
												py: 1,
												'&:hover': {
													background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
												}
											}}
										>
											Apply Now
										</Button>
									</Box>
								</CardContent>
							</Card>
						))
					) : (
						<Box sx={{ 
							textAlign: 'center',
							py: 8,
							gridColumn: '1 / -1'
						}}>
							<img 
								src="/img/icons/icoAlert.svg" 
								alt="" 
								style={{ width: '64px', height: '64px', marginBottom: '16px' }}
							/>
							<Typography variant="h6" sx={{ 
								color: '#666',
								mb: 1
							}}>
								No Recently Visited Jobs Found!
							</Typography>
							<Typography variant="body2" sx={{ color: '#999' }}>
								Start browsing jobs to see them appear here
							</Typography>
						</Box>
					)}
				</Box>

				{/* Pagination */}
				{recentlyVisited?.length ? (
					<Box sx={{ 
						display: 'flex', 
						flexDirection: 'column',
						alignItems: 'center',
						gap: 2
					}}>
						{/* Custom Pagination */}
						<Box sx={{ 
							display: 'flex', 
							alignItems: 'center', 
							gap: 2,
							mb: 2
						}}>
							<IconButton 
								onClick={handlePrevPage}
								disabled={searchVisited.page <= 1}
								sx={{ 
									color: searchVisited.page <= 1 ? '#ccc' : '#667eea',
									'&:hover': {
										backgroundColor: 'rgba(102, 126, 234, 0.1)'
									}
								}}
							>
								<NavigateBefore />
							</IconButton>
							
							<Box sx={{ 
								display: 'flex', 
								alignItems: 'center', 
								gap: 1
							}}>
								<Box sx={{ 
									width: 40, 
									height: 40, 
									borderRadius: '50%',
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: 'white',
									fontWeight: 600,
									fontSize: '14px'
								}}>
									{searchVisited.page}
								</Box>
							</Box>
							
							<IconButton 
								onClick={handleNextPage}
								disabled={searchVisited.page >= Math.ceil(total / searchVisited.limit)}
								sx={{ 
									color: searchVisited.page >= Math.ceil(total / searchVisited.limit) ? '#ccc' : '#667eea',
									'&:hover': {
										backgroundColor: 'rgba(102, 126, 234, 0.1)'
									}
								}}
							>
								<NavigateNext />
							</IconButton>
						</Box>

						{/* Total Results */}
						<Typography variant="body2" sx={{ 
							color: '#666',
							fontWeight: 500
						}}>
							Total {total} recently visited job{total !== 1 ? 's' : ''}
						</Typography>
					</Box>
				) : null}
			</Box>
		);
	}
};

export default RecentlyVisited;
