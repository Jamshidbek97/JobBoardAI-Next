import React, { useState } from 'react';
import { NextPage } from 'next';
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
	Menu,
	MenuItem,
	Alert,
	CircularProgress,
	Pagination,
	FormControl,
	InputLabel,
	Select,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Divider,
} from '@mui/material';
import {
	Search as SearchIcon,
	FilterList as FilterIcon,
	MoreVert as MoreIcon,
	Visibility as ViewIcon,
	Edit as EditIcon,
	Schedule as ScheduleIcon,
	Email as EmailIcon,
	Download as DownloadIcon,
	Work as WorkIcon,
	LocationOn as LocationIcon,
	Paid as PaidIcon,
	CalendarToday as CalendarIcon,
	Person as PersonIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Image from 'next/image';
import { GET_JOB_APPLICATIONS } from '../../../apollo/user/query';
import { UPDATE_APPLICATION, MARK_AS_VIEWED } from '../../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../../libs/config';
import ApplicationStatusBadge from './ApplicationStatusBadge';

interface JobApplicationsManagerProps {
	jobId: string;
}

const JobApplicationsManager = ({ jobId }: JobApplicationsManagerProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedApplication, setSelectedApplication] = useState<any>(null);
	const [applicationDetailOpen, setApplicationDetailOpen] = useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [updateForm, setUpdateForm] = useState({
		status: '',
		notes: '',
		feedback: '',
		interviewDate: '',
	});

	const { data, loading, error, refetch } = useQuery(GET_JOB_APPLICATIONS, {
		variables: {
			input: {
				page: currentPage,
				limit: 10,
				search: {
					jobId: jobId,
					...((searchTerm && { search: searchTerm }) || {}),
					...((statusFilter !== 'ALL' && { status: statusFilter }) || {}),
				},
			},
		},
		fetchPolicy: 'network-only',
	});

	const [updateApplication] = useMutation(UPDATE_APPLICATION);
	const [markAsViewed] = useMutation(MARK_AS_VIEWED);

	const handleSearch = () => {
		setCurrentPage(1);
		refetch();
	};

	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		setCurrentPage(page);
	};

	const handleViewApplication = (application: any) => {
		setSelectedApplication(application);
		setApplicationDetailOpen(true);
		// Mark as viewed
		markAsViewed({
			variables: { applicationId: application._id },
		});
	};

	const handleUpdateApplication = (application: any) => {
		setSelectedApplication(application);
		setUpdateForm({
			status: application.status,
			notes: application.notes || '',
			feedback: application.feedback || '',
			interviewDate: application.interviewDate || '',
		});
		setUpdateDialogOpen(true);
	};

	const handleUpdateSubmit = async () => {
		try {
			await updateApplication({
				variables: {
					input: {
						_id: selectedApplication._id,
						status: updateForm.status,
						notes: updateForm.notes,
						feedback: updateForm.feedback,
						interviewDate: updateForm.interviewDate || undefined,
					},
				},
			});
			setUpdateDialogOpen(false);
			refetch();
		} catch (error) {
			console.error('Error updating application:', error);
		}
	};

	const formatCurrency = (val?: number | string | null) => {
		if (val == null || val === '') return 'Negotiable';
		const num = typeof val === 'string' ? Number(val) : val;
		if (!isFinite(num)) return String(val);
		try {
			return new Intl.NumberFormat('ko-KR', { 
				style: 'currency', 
				currency: 'KRW', 
				maximumFractionDigits: 0 
			}).format(num);
		} catch {
			return `${num} KRW`;
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const applications = data?.getJobApplications?.list || [];
	const totalApplications = data?.getJobApplications?.metaCounter?.total || 0;
	const totalPages = Math.ceil(totalApplications / 10);

	return (
		<Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
					{t('Job Applications')}
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{t('Manage applications for your job posting')}
				</Typography>
			</Box>

			{/* Filters */}
			<Paper sx={{ p: 3, mb: 3 }}>
				<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
					<TextField
						placeholder={t('Search applications...')}
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
							<MenuItem value="ALL">{t('All Status')}</MenuItem>
							<MenuItem value="PENDING">{t('Pending')}</MenuItem>
							<MenuItem value="REVIEWING">{t('Under Review')}</MenuItem>
							<MenuItem value="ACCEPTED">{t('Accepted')}</MenuItem>
							<MenuItem value="REJECTED">{t('Rejected')}</MenuItem>
							<MenuItem value="WITHDRAWN">{t('Withdrawn')}</MenuItem>
						</Select>
					</FormControl>
					<Button
						variant="contained"
						onClick={handleSearch}
						startIcon={<FilterIcon />}
					>
						{t('Search')}
					</Button>
				</Stack>
			</Paper>

			{/* Applications List */}
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
					<CircularProgress />
				</Box>
			) : error ? (
				<Alert severity="error" sx={{ mb: 3 }}>
					{t('Failed to load applications')}
				</Alert>
			) : applications.length === 0 ? (
				<Paper sx={{ p: 4, textAlign: 'center' }}>
					<Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
						{t('No applications found')}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{searchTerm || statusFilter !== 'ALL' 
							? t('Try adjusting your search criteria') 
							: t('No applications have been submitted yet')
						}
					</Typography>
				</Paper>
			) : (
				<Stack spacing={2}>
					{applications.map((application: any) => (
						<Card key={application._id} sx={{ '&:hover': { boxShadow: 3 } }}>
							<CardContent>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
									{/* Applicant Avatar */}
									<Box sx={{ flexShrink: 0 }}>
										{application.applicantData?.memberImage ? (
											<Image
												src={`${REACT_APP_API_URL}/${application.applicantData.memberImage}`}
												alt={`${application.applicantData.memberFullName} avatar`}
												width={60}
												height={60}
												style={{ borderRadius: '50%' }}
											/>
										) : (
											<Box
												sx={{
													width: 60,
													height: 60,
													bgcolor: 'grey.300',
													borderRadius: '50%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<PersonIcon sx={{ fontSize: 30, color: 'grey.600' }} />
											</Box>
										)}
									</Box>

									{/* Application Details */}
									<Box sx={{ flex: 1 }}>
										<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
											<Box sx={{ flex: 1 }}>
												<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
													{application.applicantData?.memberFullName || t('Anonymous')}
												</Typography>
												<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
													{application.applicantData?.memberEmail}
												</Typography>
												
												<Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 2 }}>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														<CalendarIcon sx={{ fontSize: 16, color: 'grey.600' }} />
														<Typography variant="body2">{t('Date Applied')} {formatDate(application.appliedAt)}</Typography>
													</Box>
													{application.expectedSalary && (
														<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
															<PaidIcon sx={{ fontSize: 16, color: 'grey.600' }} />
															<Typography variant="body2">{t('Expected Salary')}: {formatCurrency(application.expectedSalary)}</Typography>
														</Box>
													)}
													{!application.isViewedByCompany && (
														<Chip 
															label={t('New')} 
															size="small" 
															color="primary" 
															sx={{ fontSize: '10px' }}
														/>
													)}
												</Stack>

												{application.coverLetter && (
													<Typography variant="body2" color="text.secondary" sx={{ 
														mb: 1,
														display: '-webkit-box',
														WebkitLineClamp: 2,
														WebkitBoxOrient: 'vertical',
														overflow: 'hidden'
													}}>
														{application.coverLetter}
													</Typography>
												)}
											</Box>

											<Stack direction="row" spacing={1} alignItems="center">
												<ApplicationStatusBadge status={application.status} />
												<IconButton
													onClick={() => handleViewApplication(application)}
													size="small"
													title={t('View Details')}
												>
													<ViewIcon />
												</IconButton>
												<IconButton
													onClick={() => handleUpdateApplication(application)}
													size="small"
													title={t('Update Status')}
												>
													<EditIcon />
												</IconButton>
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
						onChange={handlePageChange}
						color="primary"
					/>
				</Box>
			)}

			{/* Application Detail Dialog */}
			<Dialog 
				open={applicationDetailOpen} 
				onClose={() => setApplicationDetailOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					{t('Application Details')}
				</DialogTitle>
				<DialogContent>
					{selectedApplication && (
						<Stack spacing={3}>
							{/* Applicant Info */}
							<Box>
								<Typography variant="h6" sx={{ mb: 2 }}>{t('Applicant Information')}</Typography>
								<Stack spacing={1}>
									<Typography><strong>{t('Name')}:</strong> {selectedApplication.applicantData?.memberFullName}</Typography>
									<Typography><strong>{t('Email')}:</strong> {selectedApplication.applicantData?.memberEmail}</Typography>
									<Typography><strong>{t('Phone')}:</strong> {selectedApplication.applicantData?.memberPhone}</Typography>
									<Typography><strong>{t('Date Applied')}:</strong> {formatDate(selectedApplication.appliedAt)}</Typography>
									<Typography><strong>{t('Expected Salary')}:</strong> {formatCurrency(selectedApplication.expectedSalary)}</Typography>
								</Stack>
							</Box>

							<Divider />

							{/* Cover Letter */}
							{selectedApplication.coverLetter && (
								<Box>
									<Typography variant="h6" sx={{ mb: 2 }}>{t('Cover Letter')}</Typography>
									<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
										{selectedApplication.coverLetter}
									</Typography>
								</Box>
							)}

							{/* Resume */}
							{selectedApplication.resumeUrl && (
								<Box>
									<Typography variant="h6" sx={{ mb: 2 }}>{t('Resume')}</Typography>
									<Button
										variant="outlined"
										startIcon={<DownloadIcon />}
										onClick={() => window.open(selectedApplication.resumeUrl, '_blank')}
									>
										{t('Download Resume')}
									</Button>
								</Box>
							)}

							{/* Additional Info */}
							{(selectedApplication.skills || selectedApplication.relevantExperience) && (
								<Box>
									<Typography variant="h6" sx={{ mb: 2 }}>{t('Additional Information')}</Typography>
									{selectedApplication.skills && (
										<Box sx={{ mb: 2 }}>
											<Typography variant="subtitle2" sx={{ mb: 1 }}>{t('Skills')}:</Typography>
											<Stack direction="row" spacing={1} flexWrap="wrap">
												{selectedApplication.skills.map((skill: string, index: number) => (
													<Chip key={index} label={skill} size="small" />
												))}
											</Stack>
										</Box>
									)}
									{selectedApplication.relevantExperience && (
										<Box>
											<Typography variant="subtitle2" sx={{ mb: 1 }}>{t('Relevant Experience')}:</Typography>
											<Typography variant="body2">{selectedApplication.relevantExperience}</Typography>
										</Box>
									)}
								</Box>
							)}
						</Stack>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setApplicationDetailOpen(false)}>{t('Close')}</Button>
					<Button 
						variant="contained" 
						onClick={() => {
							setApplicationDetailOpen(false);
							handleUpdateApplication(selectedApplication);
						}}
					>
						{t('Update Status')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Update Application Dialog */}
			<Dialog 
				open={updateDialogOpen} 
				onClose={() => setUpdateDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					{t('Update Application Status')}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ mt: 1 }}>
						<FormControl fullWidth>
							<InputLabel>{t('Status')}</InputLabel>
							<Select
								value={updateForm.status}
								label={t('Status')}
								onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
							>
								<MenuItem value="PENDING">{t('Pending')}</MenuItem>
								<MenuItem value="REVIEWING">{t('Under Review')}</MenuItem>
								<MenuItem value="ACCEPTED">{t('Accepted')}</MenuItem>
								<MenuItem value="REJECTED">{t('Rejected')}</MenuItem>
							</Select>
						</FormControl>

						<TextField
							label={t('Notes (Internal)')}
							multiline
							rows={3}
							value={updateForm.notes}
							onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
							placeholder={t('Internal notes about this application...')}
						/>

						<TextField
							label={t('Feedback (For Applicant)')}
							multiline
							rows={3}
							value={updateForm.feedback}
							onChange={(e) => setUpdateForm({ ...updateForm, feedback: e.target.value })}
							placeholder={t('Feedback to share with the applicant...')}
						/>

						<TextField
							label={t('Interview Date')}
							type="datetime-local"
							value={updateForm.interviewDate}
							onChange={(e) => setUpdateForm({ ...updateForm, interviewDate: e.target.value })}
							InputLabelProps={{ shrink: true }}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setUpdateDialogOpen(false)}>{t('Cancel')}</Button>
					<Button variant="contained" onClick={handleUpdateSubmit}>
						{t('Update Application')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default JobApplicationsManager;
