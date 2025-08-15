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
} from '@mui/material';
import {
	Search as SearchIcon,
	FilterList as FilterIcon,
	MoreVert as MoreIcon,
	Visibility as ViewIcon,
	Delete as DeleteIcon,
	Undo as WithdrawIcon,
	Work as WorkIcon,
	LocationOn as LocationIcon,
	Business as BusinessIcon,
	Paid as PaidIcon,
	CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';

import Image from 'next/image';
import { GET_MY_APPLICATIONS } from '../../apollo/user/query';
import { DELETE_APPLICATION, WITHDRAW_APPLICATION } from '../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../libs/config';
import ApplicationStatusBadge from '../../libs/components/job/ApplicationStatusBadge';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

const MyApplicationsPage: NextPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [currentPage, setCurrentPage] = useState(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

	const { data, loading, error, refetch } = useQuery(GET_MY_APPLICATIONS, {
		variables: {
			input: {
				page: currentPage,
				limit: 10,
				search: searchTerm,
				status: statusFilter === 'ALL' ? undefined : statusFilter,
			},
		},
		fetchPolicy: 'network-only',
	});

	const [withdrawApplication] = useMutation(WITHDRAW_APPLICATION);
	const [deleteApplication] = useMutation(DELETE_APPLICATION);

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, applicationId: string) => {
		setAnchorEl(event.currentTarget);
		setSelectedApplication(applicationId);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedApplication(null);
	};

	const handleWithdraw = async () => {
		if (!selectedApplication) return;

		try {
			await withdrawApplication({
				variables: { applicationId: selectedApplication },
			});
			refetch();
			handleMenuClose();
		} catch (error) {
			console.error('Error withdrawing application:', error);
		}
	};

	const handleDelete = async () => {
		if (!selectedApplication) return;

		try {
			await deleteApplication({
				variables: { applicationId: selectedApplication },
			});
			refetch();
			handleMenuClose();
		} catch (error) {
			console.error('Error deleting application:', error);
		}
	};

	const handleSearch = () => {
		setCurrentPage(1);
		refetch();
	};

	const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
		setCurrentPage(page);
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

	const applications = data?.getMyApplications?.list || [];
	const totalApplications = data?.getMyApplications?.metaCounter?.total || 0;
	const totalPages = Math.ceil(totalApplications / 10);

	return (
		<Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
					My Applications
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Track your job applications and their status
				</Typography>
			</Box>

			{/* Filters */}
			<Paper sx={{ p: 3, mb: 3 }}>
				<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
					<TextField
						placeholder="Search applications..."
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
						<InputLabel>Status</InputLabel>
						<Select
							value={statusFilter}
							label="Status"
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<MenuItem value="ALL">All Status</MenuItem>
							<MenuItem value="PENDING">Pending</MenuItem>
							<MenuItem value="REVIEWING">Under Review</MenuItem>
							<MenuItem value="ACCEPTED">Accepted</MenuItem>
							<MenuItem value="REJECTED">Rejected</MenuItem>
							<MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
						</Select>
					</FormControl>
					<Button
						variant="contained"
						onClick={handleSearch}
						startIcon={<FilterIcon />}
					>
						Search
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
					Failed to load applications. Please try again.
				</Alert>
			) : applications.length === 0 ? (
				<Paper sx={{ p: 4, textAlign: 'center' }}>
					<Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
						No applications found
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{searchTerm || statusFilter !== 'ALL' 
							? 'Try adjusting your search criteria' 
							: 'Start applying to jobs to see your applications here'
						}
					</Typography>
				</Paper>
			) : (
				<Stack spacing={2}>
					{applications.map((application: any) => (
						<Card key={application._id} sx={{ '&:hover': { boxShadow: 3 } }}>
							<CardContent>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
									{/* Company Logo */}
									<Box sx={{ flexShrink: 0 }}>
										{application.jobData?.companyLogo ? (
											<Image
												src={`${REACT_APP_API_URL}/${application.jobData.companyLogo}`}
												alt={`${application.jobData.companyName} logo`}
												width={60}
												height={60}
												style={{ borderRadius: '8px' }}
											/>
										) : (
											<Box
												sx={{
													width: 60,
													height: 60,
													bgcolor: 'grey.300',
													borderRadius: 2,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<BusinessIcon sx={{ fontSize: 30, color: 'grey.600' }} />
											</Box>
										)}
									</Box>

									{/* Application Details */}
									<Box sx={{ flex: 1 }}>
										<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
											<Box sx={{ flex: 1 }}>
												<Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
													{application.jobData?.positionTitle || 'Position Title Not Available'}
												</Typography>
												<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
													{application.jobData?.companyName || 'Company Name Not Available'}
												</Typography>
												
												<Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 2 }}>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														<LocationIcon sx={{ fontSize: 16, color: 'grey.600' }} />
														<Typography variant="body2">{application.jobData?.jobLocation || 'Location Not Available'}</Typography>
													</Box>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														<PaidIcon sx={{ fontSize: 16, color: 'grey.600' }} />
														<Typography variant="body2">{formatCurrency(application.jobData?.jobSalary)}</Typography>
													</Box>
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														<CalendarIcon sx={{ fontSize: 16, color: 'grey.600' }} />
														<Typography variant="body2">Applied {formatDate(application.appliedAt)}</Typography>
													</Box>
												</Stack>

												{application.expectedSalary && (
													<Typography variant="body2" color="text.secondary">
														Expected Salary: {formatCurrency(application.expectedSalary)}
													</Typography>
												)}
											</Box>

											<Stack direction="row" spacing={1} alignItems="center">
												<ApplicationStatusBadge status={application.status} />
												<IconButton
													onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMenuOpen(e, application._id)}
													size="small"
												>
													<MoreIcon />
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

			{/* Action Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleMenuClose}>
					<ViewIcon sx={{ mr: 1 }} />
					View Details
				</MenuItem>
				<MenuItem onClick={handleWithdraw}>
					<WithdrawIcon sx={{ mr: 1 }} />
					Withdraw Application
				</MenuItem>
				<MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
					<DeleteIcon sx={{ mr: 1 }} />
					Delete Application
				</MenuItem>
			</Menu>
		</Box>
	);
};

export default withLayoutBasic(MyApplicationsPage);
