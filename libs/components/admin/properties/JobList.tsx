import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Menu,
	MenuItem,
	Link,
	Box,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Stack } from '@mui/material';
import { Job } from '../../../types/job/job';
import { REACT_APP_API_URL } from '../../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { JobStatus } from '../../../enums/job.enum';

interface Data {
	id: string;
	title: string;
	salary: string;
	company: string;
	location: string;
	type: string;
	status: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'id',
		numeric: true,
		disablePadding: false,
		label: 'Job ID',
	},
	{
		id: 'title',
		numeric: true,
		disablePadding: false,
		label: 'POSITION',
	},
	{
		id: 'salary',
		numeric: false,
		disablePadding: false,
		label: 'SALARY',
	},
	{
		id: 'company',
		numeric: false,
		disablePadding: false,
		label: 'COMPANY',
	},
	{
		id: 'location',
		numeric: false,
		disablePadding: false,
		label: 'LOCATION',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'TYPE',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { onSelectAllClick } = props;

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface JobPanelListType {
	jobs: Job[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateJobHandler: any;
	removeJobHandler: any;
}

export const JobPanelList = (props: JobPanelListType) => {
	const { jobs, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateJobHandler, removeJobHandler } = props;

	return (
		<TableContainer component={Paper} sx={{ boxShadow: 'none', border: 'none' }}>
			<Table sx={{ minWidth: 650 }} aria-label="jobs table">
				<TableHead>
					<TableRow sx={{ backgroundColor: '#f8f9fa' }}>
						<TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', py: 2 }}>Job ID</TableCell>
						<TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', py: 2 }}>Position</TableCell>
						<TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', py: 2 }}>Company</TableCell>
						<TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', py: 2 }}>Location</TableCell>
						<TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', py: 2 }}>Type</TableCell>
						<TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', py: 2 }}>Status</TableCell>
						<TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', py: 2 }}>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{jobs && jobs.length > 0 ? (
						jobs.map((job: Job, index: number) => {
							const jobImage = job?.companyLogo ? `${REACT_APP_API_URL}/${job.companyLogo}` : '/img/defaultJob.jpg';
							return (
								<TableRow 
									hover 
									key={job?._id} 
									sx={{ 
										'&:last-child td, &:last-child th': { border: 0 },
										'&:hover': {
											backgroundColor: '#f8f9fa',
											transform: 'translateY(-1px)',
											transition: 'all 0.2s ease'
										},
										transition: 'all 0.2s ease'
									}}
								>
									<TableCell sx={{ py: 2 }}>
										<Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#666' }}>
											{job._id?.slice(-8)}
										</Typography>
									</TableCell>
									<TableCell sx={{ py: 2 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
											<Avatar 
												alt="Company Logo" 
												src={jobImage} 
												sx={{ 
													width: 40, 
													height: 40,
													border: '2px solid #e0e0e0'
												}} 
											/>
											<Box>
												<Typography 
													variant="body1" 
													sx={{ 
														fontWeight: 600, 
														color: '#333',
														textDecoration: 'none',
														cursor: 'pointer',
														'&:hover': {
															color: '#2196f3'
														}
													}}
													onClick={() => window.open(`/jobs/${job?._id}`, '_blank')}
												>
													{job.positionTitle}
												</Typography>
												<Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
													${job.jobSalary?.toLocaleString()}/year
												</Typography>
											</Box>
										</Box>
									</TableCell>
									<TableCell sx={{ py: 2 }}>
										<Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
											{job.companyName}
										</Typography>
									</TableCell>
									<TableCell sx={{ py: 2 }}>
										<Box sx={{ 
											display: 'inline-flex', 
											alignItems: 'center', 
											gap: 0.5,
											px: 1.5,
											py: 0.5,
											bgcolor: '#e3f2fd',
											borderRadius: 2,
											border: '1px solid #bbdefb'
										}}>
											<Typography variant="body2" sx={{ color: '#1976d2', fontSize: '0.8rem' }}>
												{job.jobLocation}
											</Typography>
										</Box>
									</TableCell>
									<TableCell sx={{ py: 2 }}>
										<Box sx={{ 
											display: 'inline-flex', 
											alignItems: 'center', 
											gap: 0.5,
											px: 1.5,
											py: 0.5,
											bgcolor: '#f3e5f5',
											borderRadius: 2,
											border: '1px solid #e1bee7'
										}}>
											<Typography variant="body2" sx={{ color: '#7b1fa2', fontSize: '0.8rem' }}>
												{job.jobType}
											</Typography>
										</Box>
									</TableCell>
									<TableCell sx={{ py: 2 }}>
										{job.jobStatus === JobStatus.OPEN && (
											<Box sx={{ 
												display: 'inline-flex', 
												alignItems: 'center', 
												gap: 0.5,
												px: 2,
												py: 0.8,
												bgcolor: '#e8f5e8',
												borderRadius: 3,
												border: '1px solid #c8e6c9'
											}}>
												<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
												<Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600, fontSize: '0.8rem' }}>
													Active
												</Typography>
											</Box>
										)}
										{job.jobStatus === JobStatus.CLOSED && (
											<Box sx={{ 
												display: 'inline-flex', 
												alignItems: 'center', 
												gap: 0.5,
												px: 2,
												py: 0.8,
												bgcolor: '#fff3e0',
												borderRadius: 3,
												border: '1px solid #ffcc02'
											}}>
												<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff9800' }} />
												<Typography variant="body2" sx={{ color: '#e65100', fontWeight: 600, fontSize: '0.8rem' }}>
													Closed
												</Typography>
											</Box>
										)}
										{job.jobStatus === JobStatus.DELETE && (
											<Box sx={{ 
												display: 'inline-flex', 
												alignItems: 'center', 
												gap: 0.5,
												px: 2,
												py: 0.8,
												bgcolor: '#ffebee',
												borderRadius: 3,
												border: '1px solid #ffcdd2'
											}}>
												<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336' }} />
												<Typography variant="body2" sx={{ color: '#c62828', fontWeight: 600, fontSize: '0.8rem' }}>
													Deleted
												</Typography>
											</Box>
										)}
									</TableCell>
									<TableCell sx={{ py: 2 }}>
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<Button
												onClick={(e: React.MouseEvent<HTMLButtonElement>) => menuIconClickHandler(e, index)}
												sx={{
													minWidth: 'auto',
													p: 1,
													borderRadius: 2,
													color: '#666',
													'&:hover': {
														backgroundColor: '#f5f5f5',
														color: '#333'
													}
												}}
											>
												⋮
											</Button>
											<Menu
												anchorEl={anchorEl[index]}
												open={Boolean(anchorEl[index])}
												onClose={menuIconCloseHandler}
												sx={{
													'& .MuiPaper-root': {
														borderRadius: 2,
														boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
														border: '1px solid #e0e0e0'
													}
												}}
											>
												{Object.values(JobStatus)
													.filter((status) => status !== job.jobStatus)
													.map((status) => (
														<MenuItem
															key={status}
															onClick={() => updateJobHandler({ _id: job._id, jobStatus: status })}
															sx={{
																py: 1.5,
																px: 2,
																'&:hover': {
																	backgroundColor: '#f5f5f5'
																}
															}}
														>
															<Typography variant="body2">
																Change to {status}
															</Typography>
														</MenuItem>
													))}
												<MenuItem
													onClick={() => removeJobHandler(job._id)}
													sx={{
														py: 1.5,
														px: 2,
														color: '#f44336',
														'&:hover': {
															backgroundColor: '#ffebee'
														}
													}}
												>
													<DeleteIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
													Delete Job
												</MenuItem>
											</Menu>
										</Box>
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={7} sx={{ textAlign: 'center', py: 8 }}>
								<Box sx={{ textAlign: 'center' }}>
									<img 
										src="/img/icons/icoAlert.svg" 
										alt="No jobs" 
										style={{ width: 64, height: 64, opacity: 0.5, marginBottom: 16 }}
									/>
									<Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
										No jobs found
									</Typography>
									<Typography variant="body2" sx={{ color: '#999' }}>
										There are no jobs matching your current filters
									</Typography>
								</Box>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default JobPanelList;
