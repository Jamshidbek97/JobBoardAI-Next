import React, { useState, useRef } from 'react';
import {
	Modal,
	Box,
	Typography,
	TextField,
	Button,
	Stack,
	Paper,
	IconButton,
	Alert,
	CircularProgress,
	Divider,
	InputAdornment,
	FormControlLabel,
	Checkbox,
	Chip,
} from '@mui/material';
import {
	Close as CloseIcon,
	Upload as UploadIcon,
	AttachFile as AttachFileIcon,
	Delete as DeleteIcon,
	Work as WorkIcon,
	LocationOn as LocationIcon,
	Business as BusinessIcon,
	Paid as PaidIcon,
} from '@mui/icons-material';
import { useMutation } from '@apollo/client';
import { CREATE_APPLICATION, UPLOAD_RESUME } from '../../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../../libs/config';
import Image from 'next/image';

interface ApplicationModalProps {
	open: boolean;
	onClose: () => void;
	job: {
		_id: string;
		positionTitle: string;
		companyName: string;
		jobLocation: string;
		jobSalary: number | string;
		companyLogo?: string;
		jobDesc?: string;
	};
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ open, onClose, job }) => {
	const [coverLetter, setCoverLetter] = useState('');
	const [expectedSalary, setExpectedSalary] = useState('');
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [resumeUrl, setResumeUrl] = useState('');
	const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
	const [additionalUrls, setAdditionalUrls] = useState<string[]>([]);
	const [isRemotePreferred, setIsRemotePreferred] = useState(false);
	const [skills, setSkills] = useState<string[]>([]);
	const [currentSkill, setCurrentSkill] = useState('');
	const [isRelocationWilling, setIsRelocationWilling] = useState(false);
	const [references, setReferences] = useState<string[]>([]);
	const [currentReference, setCurrentReference] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	
	const fileInputRef = useRef<HTMLInputElement>(null);
	const additionalFilesRef = useRef<HTMLInputElement>(null);

		const [createApplication] = useMutation(CREATE_APPLICATION);
	const [uploadResume] = useMutation(UPLOAD_RESUME);

	const handleFileUpload = async (file: File): Promise<string> => {
		try {
			const response = await uploadResume({
				variables: { file },
				context: {
					headers: {
						'apollo-require-preflight': true,
					},
				},
			});

			if (!response.data?.uploadResume) {
				throw new Error('Upload response missing URL');
			}

			return response.data.uploadResume;
		} catch (error: any) {
			console.error('File upload error:', error);
			const errorMessage = error.message || 'Failed to upload file';
			throw new Error(errorMessage);
		}
	};

	const handleResumeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.includes('pdf') && !file.type.includes('doc')) {
			setError('Please upload a PDF or Word document');
			return;
		}

		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			setError('File size must be less than 5MB');
			return;
		}

		setResumeFile(file);
		setError('');

		try {
			setLoading(true);
			const url = await handleFileUpload(file);
			setResumeUrl(url);
			setError(''); // Clear any previous errors on successful upload
		} catch (error) {
			setError('Failed to upload resume');
			setResumeFile(null); // Clear the file if upload failed
			setResumeUrl(''); // Clear the URL if upload failed
		} finally {
			setLoading(false);
		}
	};

	const handleAdditionalFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		if (files.length === 0) return;

		// Validate files
		for (const file of files) {
			if (file.size > 5 * 1024 * 1024) {
				setError('Each file must be less than 5MB');
				return;
			}
		}

		setAdditionalFiles(prev => [...prev, ...files]);
		setError('');

		try {
			setLoading(true);
			const uploadPromises = files.map(file => handleFileUpload(file));
			const urls = await Promise.all(uploadPromises);
			setAdditionalUrls(prev => [...prev, ...urls]);
		} catch (error) {
			setError('Failed to upload additional files');
		} finally {
			setLoading(false);
		}
	};

	const removeAdditionalFile = (index: number) => {
		setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
		setAdditionalUrls(prev => prev.filter((_, i) => i !== index));
	};

	const clearResume = () => {
		setResumeFile(null);
		setResumeUrl('');
		setError('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const addSkill = () => {
		if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
			setSkills([...skills, currentSkill.trim()]);
			setCurrentSkill('');
		}
	};

	const removeSkill = (skillToRemove: string) => {
		setSkills(skills.filter(skill => skill !== skillToRemove));
	};

	const addReference = () => {
		if (currentReference.trim() && !references.includes(currentReference.trim())) {
			setReferences([...references, currentReference.trim()]);
			setCurrentReference('');
		}
	};

	const removeReference = (referenceToRemove: string) => {
		setReferences(references.filter(ref => ref !== referenceToRemove));
	};

	const handleSubmit = async () => {
		if (!coverLetter.trim()) {
			setError('Please write a cover letter');
			return;
		}

		if (!resumeUrl) {
			setError('Please upload your resume');
			return;
		}

		try {
			setLoading(true);
			setError('');

			await createApplication({
				variables: {
					input: {
						jobId: job._id,
						coverLetter: coverLetter.trim(),
						resumeUrl,
						expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
						additionalDocuments: additionalUrls,
						isRemotePreferred,
						skills,
						isRelocationWilling,
						references,
					},
				},
			});

			setSuccess(true);
			setTimeout(() => {
				onClose();
				// Reset form
				setCoverLetter('');
				setExpectedSalary('');
				setResumeFile(null);
				setResumeUrl('');
				setAdditionalFiles([]);
				setAdditionalUrls([]);
				setIsRemotePreferred(false);
				setSkills([]);
				setCurrentSkill('');
				setIsRelocationWilling(false);
				setReferences([]);
				setCurrentReference('');
				setSuccess(false);
			}, 2000);
		} catch (error: any) {
			setError(error.message || 'Failed to submit application');
		} finally {
			setLoading(false);
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

	return (
		<Modal
			open={open}
			onClose={onClose}
			aria-labelledby="application-modal-title"
			aria-describedby="application-modal-description"
		>
			<Box
				sx={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: '90%',
					maxWidth: 800,
					maxHeight: '90vh',
					overflow: 'auto',
					bgcolor: 'background.paper',
					borderRadius: 3,
					boxShadow: 24,
					p: 0,
				}}
			>
				{/* Header */}
				<Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
					<IconButton
						onClick={onClose}
						sx={{ position: 'absolute', right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
					<Typography variant="h4" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
						Apply for Position
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Submit your application for this position
					</Typography>
				</Box>

				{/* Job Summary */}
				<Paper sx={{ m: 3, p: 3, bgcolor: 'grey.50' }}>
					<Stack direction="row" spacing={2} alignItems="center" mb={2}>
						{job.companyLogo ? (
							<Image
								src={`${REACT_APP_API_URL}/${job.companyLogo}`}
								alt={`${job.companyName} logo`}
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
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 600 }}>
								{job.positionTitle}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{job.companyName}
							</Typography>
						</Box>
					</Stack>
					
					<Stack direction="row" spacing={3} flexWrap="wrap">
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<LocationIcon sx={{ fontSize: 20, color: 'grey.600' }} />
							<Typography variant="body2">{job.jobLocation}</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<PaidIcon sx={{ fontSize: 20, color: 'grey.600' }} />
							<Typography variant="body2">{formatCurrency(job.jobSalary)}</Typography>
						</Box>
					</Stack>
				</Paper>

				{/* Form */}
				<Box sx={{ p: 3 }}>
					{error && (
						<Alert severity="error" sx={{ mb: 3 }}>
							{error}
						</Alert>
					)}

					{success && (
						<Alert severity="success" sx={{ mb: 3 }}>
							Application submitted successfully! You will receive a confirmation email shortly.
						</Alert>
					)}

					<Stack spacing={3}>
						{/* Cover Letter */}
						<TextField
							label="Cover Letter"
							multiline
							rows={6}
							value={coverLetter}
							onChange={(e) => setCoverLetter(e.target.value)}
							placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
							required
							fullWidth
						/>

						{/* Expected Salary */}
						<TextField
							label="Expected Salary (Optional)"
							type="number"
							value={expectedSalary}
							onChange={(e) => setExpectedSalary(e.target.value)}
							placeholder="Enter your expected salary"
							InputProps={{
								startAdornment: <InputAdornment position="start">₩</InputAdornment>,
							}}
							fullWidth
						/>

						{/* Work Preferences */}
						<Box>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								Work Preferences
							</Typography>
							<Stack spacing={2}>
								<FormControlLabel
									control={
										<Checkbox
											checked={isRemotePreferred}
											onChange={(e) => setIsRemotePreferred(e.target.checked)}
										/>
									}
									label="I prefer remote work"
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={isRelocationWilling}
											onChange={(e) => setIsRelocationWilling(e.target.checked)}
										/>
									}
									label="I am willing to relocate"
								/>
							</Stack>
						</Box>

						{/* Skills */}
						<Box>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								Skills (Optional)
							</Typography>
							<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
								<TextField
									label="Add a skill"
									value={currentSkill}
									onChange={(e) => setCurrentSkill(e.target.value)}
									placeholder="e.g., JavaScript, React, Python"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											addSkill();
										}
									}}
									sx={{ flex: 1 }}
								/>
								<Button
									variant="outlined"
									onClick={addSkill}
									disabled={!currentSkill.trim()}
									sx={{ minWidth: 'auto', px: 2 }}
								>
									Add
								</Button>
							</Stack>
							{skills.length > 0 && (
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
									{skills.map((skill, index) => (
										<Chip
											key={index}
											label={skill}
											onDelete={() => removeSkill(skill)}
											color="primary"
											variant="outlined"
										/>
									))}
								</Box>
							)}
						</Box>

						{/* References */}
						<Box>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								References (Optional)
							</Typography>
							<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
								<TextField
									label="Add a reference"
									value={currentReference}
									onChange={(e) => setCurrentReference(e.target.value)}
									placeholder="e.g., John Doe - Senior Developer at Tech Corp"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											addReference();
										}
									}}
									sx={{ flex: 1 }}
								/>
								<Button
									variant="outlined"
									onClick={addReference}
									disabled={!currentReference.trim()}
									sx={{ minWidth: 'auto', px: 2 }}
								>
									Add
								</Button>
							</Stack>
							{references.length > 0 && (
								<Stack spacing={1}>
									{references.map((reference, index) => (
										<Box
											key={index}
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												p: 1,
												bgcolor: 'grey.100',
												borderRadius: 1,
											}}
										>
											<Typography variant="body2">{reference}</Typography>
											<IconButton
												size="small"
												onClick={() => removeReference(reference)}
											>
												<DeleteIcon />
											</IconButton>
										</Box>
									))}
								</Stack>
							)}
						</Box>

						<Divider />

						{/* Resume Upload */}
						<Box>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								Resume *
							</Typography>
							<Button
								variant="outlined"
								component="label"
								startIcon={<UploadIcon />}
								onClick={() => fileInputRef.current?.click()}
								disabled={loading}
								sx={{ 
									mb: 2,
									borderColor: resumeUrl ? 'success.main' : 'primary.main',
									color: resumeUrl ? 'success.main' : 'primary.main'
								}}
							>
								{resumeFile ? resumeFile.name : 'Upload Resume (PDF/DOC)'}
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								hidden
								accept=".pdf,.doc,.docx"
								onChange={handleResumeChange}
							/>
							{resumeUrl && resumeFile && (
								<Typography variant="body2" color="success.main">
									✓ Resume uploaded successfully
								</Typography>
							)}
							{loading && resumeFile && (
								<Typography variant="body2" color="info.main">
									⏳ Uploading resume...
								</Typography>
							)}
							{resumeFile && !resumeUrl && !loading && (
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Typography variant="body2" color="error.main">
										⚠ Resume upload failed
									</Typography>
									<Button 
										size="small" 
										variant="text" 
										onClick={clearResume}
										sx={{ minWidth: 'auto', p: 0.5 }}
									>
										Try again
									</Button>
								</Box>
							)}
						</Box>

						{/* Additional Documents */}
						<Box>
							<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
								Additional Documents (Optional)
							</Typography>
							<Button
								variant="outlined"
								component="label"
								startIcon={<AttachFileIcon />}
								onClick={() => additionalFilesRef.current?.click()}
								disabled={loading}
								sx={{ mb: 2 }}
							>
								Upload Additional Files
							</Button>
							<input
								ref={additionalFilesRef}
								type="file"
								hidden
								multiple
								accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
								onChange={handleAdditionalFilesChange}
							/>
							
							{additionalFiles.length > 0 && (
								<Stack spacing={1}>
									{additionalFiles.map((file, index) => (
										<Box
											key={index}
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												p: 1,
												bgcolor: 'grey.100',
												borderRadius: 1,
											}}
										>
											<Typography variant="body2">{file.name}</Typography>
											<IconButton
												size="small"
												onClick={() => removeAdditionalFile(index)}
											>
												<DeleteIcon />
											</IconButton>
										</Box>
									))}
								</Stack>
							)}
						</Box>
					</Stack>
				</Box>

				{/* Footer */}
				<Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
					<Stack direction="row" spacing={2} justifyContent="flex-end">
						<Button variant="outlined" onClick={onClose} disabled={loading}>
							Cancel
						</Button>
						<Button
							variant="contained"
							onClick={handleSubmit}
							disabled={loading || !coverLetter.trim() || !resumeUrl}
							startIcon={loading ? <CircularProgress size={20} /> : null}
						>
							{loading ? 'Submitting...' : 'Submit Application'}
						</Button>
					</Stack>
				</Box>
			</Box>
		</Modal>
	);
};

export default ApplicationModal;
