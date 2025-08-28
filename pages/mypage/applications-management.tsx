import React, { useState } from 'react';
import type { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import {
	Box,
	Typography,
	Paper,
	Stack,
	Button,
	TextField,
	InputAdornment,
	Card,
	CardContent,
	IconButton,
	Alert,
	CircularProgress,
	Pagination,
	FormControl,
	InputLabel,
	Select,
	Chip,
	Tabs,
	Tab,
	Divider,
	MenuItem,
} from '@mui/material';
import {
	Search as SearchIcon,
	FilterList as FilterIcon,
	Visibility as ViewIcon,
	Work as WorkIcon,
	People as PeopleIcon,
	Business as BusinessIcon,
	CalendarToday as CalendarIcon,
	Paid as PaidIcon,
	LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { GET_AGENT_JOBS } from '../../apollo/user/query';
import { REACT_APP_API_URL } from '../../libs/config';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Image from 'next/image';
import JobApplicationsManager from '../../libs/components/job/JobApplicationsManager';
import { useTranslationUtils, formatDate } from '../../libs/utils/translationUtils';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`applications-tabpanel-${index}`}
			aria-labelledby={`applications-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ pt: 3 }}>{children}</Box>	}
		</div>
	);
}

const ApplicationsManagementPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const { t, formatCurrency } = useTranslationUtils();
	const [tabValue, setTabValue] = useState(0);
	const [selectedJob, setSelectedJob] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [currentPage, setCurrentPage] = useState(1);

	const { data, loading, error, refetch } = useQuery(GET_AGENT_JOBS, {
		variables: {
			input: {
				page: currentPage,
				limit: 10,
				search: {
					...((searchTerm && { search: searchTerm }) || {}),
					...((statusFilter !== 'ALL' && { jobStatus: statusFilter }) || {}),
				},
			},
		},
		fetchPolicy: 'network-only',
	});

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
		setSelectedJob(null);
	};

	const handleJobSelect = (job: any) => {
		setSelectedJob(job);
		setTabValue(1); // Switch to applications tab
	};



	const jobs = data?.getAgentJobs?.list || [];
	const totalJobs = data?.getAgentJobs?.metaCounter?.total || 0;
	const totalPages = Math.ceil(totalJobs / 10);

	if (!user) {
		return (
			<Box sx={{ p: 3, textAlign: 'center' }}>
				<Alert severity="warning">
					{t('Please log in to access application management.')}
				</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
					{t('Application Management')}
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{t('Manage applications for all your posted jobs')}
				</Typography>
			</Box>

			{/* Tabs */}
			<Paper sx={{ mb: 3 }}>
				<Tabs value={tabValue} onChange={handleTabChange} aria-label="application management tabs">
					<Tab 
						label={
							<Stack direction="row" spacing={1} alignItems="center">
								<WorkIcon />
								<Typography>{t('My Jobs')}</Typography>
								{totalJobs > 0 && (
									<Chip label={totalJobs} size="small" color="primary" />
								)}
							</Stack>
						} 
					/>
					<Tab 
						label={
							<Stack direction="row" spacing={1} alignItems="center">
								<PeopleIcon />
								<Typography>{t('Applications')}</Typography>
								{selectedJob && (
									<Chip label={selectedJob.positionTitle} size="small" color="secondary" />
								)}
							</Stack>
						}
						disabled={!selectedJob}
					/>
				</Tabs>
			</Paper>

			{/* Tab Panels */}
			<TabPanel value={tabValue} index={0}>
				{/* Jobs List */}
				<Paper sx={{ p: 3, mb: 3 }}>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
											<TextField
						placeholder={t('Search jobs...')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
						sx={{ flex: 1 }}
					/>
					<FormControl sx={{ minWidth: 150 }}>
						<InputLabel>{t('Status')}</InputLabel>
						<Select
							value={statusFilter}
							label={t('Status')}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<MenuItem value="ALL">{t('All Jobs')}</MenuItem>
							<MenuItem value="OPEN">{t('Open')}</MenuItem>
							<MenuItem value="CLOSED">{t('Closed')}</MenuItem>
							<MenuItem value="PAUSED">{t('Paused')}</MenuItem>
						</Select>
					</FormControl>
					<Button
						variant="contained"
						onClick={() => refetch()}
						startIcon={<FilterIcon />}
					>
						{t('Search')}
					</Button>
					</Stack>

					{loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
							<CircularProgress />
						</Box>
					) : error ? (
						<Alert severity="error" sx={{ mb: 3 }}>
							{t('Failed to load jobs. Please try again.')}
						</Alert>
					) : jobs.length === 0 ? (
						<Box sx={{ textAlign: 'center', py: 4 }}>
							<Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
								{t('No jobs found')}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{searchTerm || statusFilter !== 'ALL' 
									? t('Try adjusting your search criteria') 
									: t('You haven\'t posted any jobs yet')
								}
							</Typography>
						</Box>
					) : (
						<Stack spacing={2}>
							{jobs.map((job: any) => (
								<Card key={job._id} sx={{ '&:hover': { boxShadow: 3 } }}>
									<CardContent>
										<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
											{/* Job Logo */}
											<Box sx={{ flexShrink: 0 }}>
												{job.companyLogo ? (
													<Image
														src={`${REACT_APP_API_URL}/${job.companyLogo}`}
														alt={`${job.companyName} logo`}
														width={80}
														height={80}
														style={{ borderRadius: '8px' }}
													/>
												) : (
													<Box
														sx={{
															width: 80,
															height: 80,
															bgcolor: 'grey.300',
															borderRadius: '8px',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
														}}
													>
														<BusinessIcon sx={{ fontSize: 40, color: 'grey.600' }} />
													</Box>
												)}
											</Box>

											{/* Job Details */}
											<Box sx={{ flex: 1 }}>
												<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
													<Box sx={{ flex: 1 }}>
														<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
															{job.positionTitle}
														</Typography>
														<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
															{job.companyName}
														</Typography>
														
														<Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 2 }}>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
																<LocationIcon sx={{ fontSize: 16, color: 'grey.600' }} />
																<Typography variant="body2">{job.jobLocation}</Typography>
															</Box>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
																<PaidIcon sx={{ fontSize: 16, color: 'grey.600' }} />
																															<Typography variant="body2">{formatCurrency(job.jobSalary)}</Typography>
														</Box>
														<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
															<CalendarIcon sx={{ fontSize: 16, color: 'grey.600' }} />
															<Typography variant="body2">{t('Posted')} {formatDate(job.createdAt)}</Typography>
															</Box>
														</Stack>

														<Stack direction="row" spacing={2} alignItems="center">
															<Chip 
																label={job.jobStatus} 
																size="small" 
																color={job.jobStatus === 'OPEN' ? 'success' : 'default'}
															/>
															{job.jobApplications > 0 && (
																<Chip 
																	label={`${job.jobApplications} ${t('applications')}`} 
																	size="small" 
																	color="primary"
																/>
															)}
														</Stack>
													</Box>

													<Stack direction="row" spacing={1} alignItems="center">
														<Button
															variant="outlined"
															startIcon={<PeopleIcon />}
															onClick={() => handleJobSelect(job)}
															disabled={job.jobApplications === 0}
														>
															{t('View Applications')}
														</Button>
													</Stack>
												</Stack>
											</Box>
										</Stack>
									</CardContent>
								</Card>
							))}
						</Stack>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
							<Pagination
								count={totalPages}
								page={currentPage}
								onChange={(event, page) => setCurrentPage(page)}
								color="primary"
							/>
						</Box>
					)}
				</Paper>
			</TabPanel>

			<TabPanel value={tabValue} index={1}>
				{/* Applications for Selected Job */}
				{selectedJob ? (
					<Box>
						<Paper sx={{ p: 3, mb: 3 }}>
							<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
								<Button
									variant="outlined"
									onClick={() => setTabValue(0)}
									sx={{ minWidth: 'auto' }}
								>
									← {t('Back to Jobs')}
								</Button>
								<Divider orientation="vertical" flexItem />
								<Box>
									<Typography variant="h6" sx={{ fontWeight: 600 }}>
										{selectedJob.positionTitle}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{selectedJob.companyName} • {selectedJob.jobLocation}
									</Typography>
								</Box>
							</Stack>
						</Paper>
						
						<JobApplicationsManager jobId={selectedJob._id} />
					</Box>
				) : (
					<Box sx={{ textAlign: 'center', py: 4 }}>
						<Typography variant="h6" color="text.secondary">
							{t('Select a job to view its applications')}
						</Typography>
					</Box>
				)}
			</TabPanel>
		</Box>
	);
};

export default withLayoutBasic(ApplicationsManagementPage);
