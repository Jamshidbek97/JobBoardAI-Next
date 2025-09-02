import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { JobPanelList } from '../../../libs/components/admin/properties/JobList';
import { AllJobsInquiry } from '../../../libs/types/job/job.input';
import { Job } from '../../../libs/types/job/job';
import { JobLocation, JobStatus } from '../../../libs/enums/job.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { JobUpdate } from '../../../libs/types/job/job.update';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_JOB_BY_ADMIN, UPDATE_JOB_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_JOBS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';
import { OutlinedInput, InputAdornment } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

const AdminJobs: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [jobsInquiry, setJobsInquiry] = useState<AllJobsInquiry>(initialInquiry);
	const [jobs, setJobs] = useState<Job[]>([]);
	const [jobsTotal, setJobsTotal] = useState<number>(0);
	const [value, setValue] = useState(
		jobsInquiry?.search?.jobStatus ? jobsInquiry?.search?.jobStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');
	const [searchText, setSearchText] = useState('');

	/** APOLLO REQUESTS **/
	const [updateJobByAdmin] = useMutation(UPDATE_JOB_BY_ADMIN);
	const [removeJobByAdmin] = useMutation(REMOVE_JOB_BY_ADMIN);
	const {
		loading: getAllJobsLoading,
		data: getAllJobsData,
		error: getAllJobsError,
		refetch: getAllJobsRefetch,
	} = useQuery(GET_ALL_JOBS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: jobsInquiry,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setJobs(data?.getAllJobsByAdmin?.list);
			setJobsTotal(data?.getAllJobsByAdmin?.metaCounter[0]?.total);
		},
	});
	/** LIFECYCLE **/
	useEffect(() => {
		getAllJobsRefetch({ input: jobsInquiry }).then();
	}, [jobsInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		jobsInquiry.page = newPage + 1;
		// await getAllJobsRefetch({ input: jobsInquiry });
		setJobsInquiry({ ...jobsInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		jobsInquiry.limit = parseInt(event.target.value, 10);
		jobsInquiry.page = 1;
		// await getAllJobsRefetch({ input: jobsInquiry });
		setJobsInquiry({ ...jobsInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		setJobsInquiry({ ...jobsInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'OPEN':
				setJobsInquiry({ ...jobsInquiry, search: { jobStatus: JobStatus.OPEN } });
				break;
			case 'CLOSED':
				setJobsInquiry({ ...jobsInquiry, search: { jobStatus: JobStatus.CLOSED } });
				break;
			case 'DELETE':
				setJobsInquiry({ ...jobsInquiry, search: { jobStatus: JobStatus.DELETE } });
				break;
			default:
				delete jobsInquiry?.search?.jobStatus;
				setJobsInquiry({ ...jobsInquiry });
				break;
		}
	};

	const removeJobHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removeJobByAdmin({
					variables: {
						input: id,
					},
				});
			}
			await getAllJobsRefetch({ input: jobsInquiry });
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setJobsInquiry({
					...jobsInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...jobsInquiry.search,
						jobLocation: [newValue as JobLocation],
					},
				});
			} else {
				delete jobsInquiry?.search?.jobLocation;
				setJobsInquiry({ ...jobsInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const textHandler = (text: string) => {
		setSearchText(text);
	};

	const searchTextHandler = async () => {
		try {
			setJobsInquiry({
				...jobsInquiry,
				page: 1,
				sort: 'createdAt',
				search: {
					...jobsInquiry.search,
					text: searchText,
				},
			});
		} catch (err: any) {
			console.log('searchTextHandler: ', err.message);
		}
	};

	const updateJobHandler = async (updateData: JobUpdate) => {
		try {
			await updateJobByAdmin({
				variables: {
					input: updateData,
				},
			});
			await getAllJobsRefetch({ input: jobsInquiry });
			menuIconCloseHandler();
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'} sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			{/* Header Section */}
			<Box sx={{ mb: 4 }}>
				<Typography 
					variant={'h3'} 
					sx={{ 
						fontWeight: 700, 
						color: '#1a237e',
						mb: 1,
						display: 'flex',
						alignItems: 'center',
						gap: 2
					}}
				>
					🎯 Job Management Dashboard
				</Typography>
				<Typography variant={'body1'} sx={{ color: '#666', fontSize: '1.1rem' }}>
					Monitor and manage all job postings across the platform
				</Typography>
			</Box>

			{/* Stats Cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#4caf50', fontWeight: 700, mb: 1 }}>
						{jobs?.filter(job => job.jobStatus === 'OPEN').length || 0}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Active Jobs</Typography>
				</Box>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#ff9800', fontWeight: 700, mb: 1 }}>
						{jobs?.filter(job => job.jobStatus === 'CLOSED').length || 0}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Closed Jobs</Typography>
				</Box>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#f44336', fontWeight: 700, mb: 1 }}>
						{jobs?.filter(job => job.jobStatus === 'DELETE').length || 0}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Deleted Jobs</Typography>
				</Box>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#2196f3', fontWeight: 700, mb: 1 }}>
						{jobsTotal || 0}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Total Jobs</Typography>
				</Box>
			</Box>

			{/* Main Content Card */}
			<Box sx={{ 
				bg: 'white', 
				borderRadius: 4, 
				boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
				overflow: 'hidden',
				border: '1px solid #e0e0e0'
			}}>
				{/* Tab Navigation */}
				<Box sx={{ 
					borderBottom: '2px solid #f0f0f0',
					backgroundColor: '#fafafa'
				}}>
					<Box sx={{ display: 'flex', gap: 0 }}>
						{[
							{ value: 'ALL', label: 'All Jobs', color: '#666' },
							{ value: 'OPEN', label: 'Active', color: '#4caf50' },
							{ value: 'CLOSED', label: 'Closed', color: '#ff9800' },
							{ value: 'DELETE', label: 'Deleted', color: '#f44336' }
						].map((tab) => (
							<Box
								key={tab.value}
								onClick={(e: any) => tabChangeHandler(e, tab.value)}
								sx={{
									flex: 1,
									p: 3,
									cursor: 'pointer',
									borderBottom: value === tab.value ? `3px solid ${tab.color}` : '3px solid transparent',
									backgroundColor: value === tab.value ? 'white' : 'transparent',
									transition: 'all 0.3s ease',
									'&:hover': {
										backgroundColor: value === tab.value ? 'white' : '#f5f5f5'
									}
								}}
							>
								<Typography 
									sx={{ 
										color: value === tab.value ? tab.color : '#666',
										fontWeight: value === tab.value ? 600 : 400,
										textAlign: 'center',
										fontSize: '1rem'
									}}
								>
									{tab.label}
								</Typography>
							</Box>
						))}
					</Box>
				</Box>

				{/* Search and Filter Section */}
				<Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
						<OutlinedInput
							value={searchText}
							onChange={(e: any) => textHandler(e.target.value)}
							sx={{ 
								flex: 1, 
								minWidth: '300px',
								'& .MuiOutlinedInput-root': {
									borderRadius: 2,
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: '#2196f3'
									}
								}
							}}
							placeholder="Search job title, company, or description..."
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') searchTextHandler();
							}}
							endAdornment={
								<>
									{searchText && (
										<CancelRoundedIcon
											style={{ cursor: 'pointer', color: '#999' }}
											onClick={async () => {
												setSearchText('');
												setJobsInquiry({
													...jobsInquiry,
													search: {
														...jobsInquiry.search,
														text: '',
													},
												});
												await getAllJobsRefetch({ input: jobsInquiry });
											}}
										/>
									)}
									<InputAdornment position="end" onClick={() => searchTextHandler()}>
										<img src="/img/icons/search_icon.png" alt={'searchIcon'} style={{ cursor: 'pointer' }} />
									</InputAdornment>
								</>
							}
						/>
						<Select 
							value={searchType}
							sx={{ 
								minWidth: '160px',
								'& .MuiOutlinedInput-root': {
									borderRadius: 2
								}
							}}
						>
							<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
								All Locations
							</MenuItem>
							{Object.values(JobLocation).map((location: string) => (
								<MenuItem value={location} onClick={() => searchTypeHandler(location)} key={location}>
									{location}
								</MenuItem>
							))}
						</Select>
					</Box>
				</Box>

				{/* Jobs Table */}
				<Box sx={{ p: 0 }}>
					<JobPanelList
						jobs={jobs}
						anchorEl={anchorEl}
						menuIconClickHandler={menuIconClickHandler}
						menuIconCloseHandler={menuIconCloseHandler}
						updateJobHandler={updateJobHandler}
						removeJobHandler={removeJobHandler}
					/>
				</Box>

				{/* Pagination */}
				<Box sx={{ 
					p: 3, 
					borderTop: '1px solid #f0f0f0',
					backgroundColor: '#fafafa',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}>
					<Typography variant={'body2'} sx={{ color: '#666' }}>
						Showing {jobs?.length || 0} of {jobsTotal || 0} jobs
					</Typography>
					<TablePagination
						rowsPerPageOptions={[10, 20, 50, 100]}
						component="div"
						count={jobsTotal}
						rowsPerPage={jobsInquiry?.limit}
						page={jobsInquiry?.page - 1}
						onPageChange={changePageHandler}
						onRowsPerPageChange={changeRowsPerPageHandler}
						sx={{
							'& .MuiTablePagination-select': {
								borderRadius: 1
							}
						}}
					/>
				</Box>
			</Box>
		</Box>
	);
};

AdminJobs.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminJobs);
