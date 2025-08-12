import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography, Chip, TextField } from '@mui/material';
import axios from 'axios';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CREATE_JOB, UPDATE_JOB } from '../../../apollo/user/mutation';
import { GET_JOB } from '../../../apollo/user/query';
import { EducationLevel, EmploymentLevel, JobLocation, JobType } from '../../enums/job.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import dynamic from 'next/dynamic';

type JobForm = {
	_id?: string;
	positionTitle: string;
	companyName: string;
	jobType: JobType | null;
	jobLocation: JobLocation | null;
	jobSalary: number; // stored as number in payload
	experienceYears: number; // stored as number in payload
	educationLevel: EducationLevel | null;
	employmentLevel: EmploymentLevel | null;
	skillsRequired: string[];
	jobDesc: string;
	companyLogo?: string;
};

const ToastViewerComponent = dynamic(() => import('../community/TViewer'), { ssr: false });

const AddProperty = () => {
	const router = useRouter();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	const logoInputRef = useRef<HTMLInputElement | null>(null);
	const [skillInput, setSkillInput] = useState('');

	const [salaryInput, setSalaryInput] = useState<string>('');
	const [expInput, setExpInput] = useState<string>('');

	const [jobData, setJobData] = useState<JobForm>({
		positionTitle: '',
		companyName: '',
		jobType: null,
		jobLocation: null,
		jobSalary: 0,
		experienceYears: 0,
		educationLevel: null,
		employmentLevel: null,
		skillsRequired: [],
		jobDesc: '',
		companyLogo: '',
	});

	const editingId = useMemo(() => {
		const id = (router.query.jobId || router.query.propertyId) as string | undefined;
		return (Array.isArray(id) ? id[0] : id) || '';
	}, [router.query.jobId, router.query.propertyId]);

	const jobTypes = useMemo(() => Object.values(JobType), []);
	const jobLocations = useMemo(() => Object.values(JobLocation), []);
	const educationLevels = useMemo(() => Object.values(EducationLevel), []);
	const employmentLevels = useMemo(() => Object.values(EmploymentLevel), []);

	/** APOLLO **/
	const [createJob] = useMutation(CREATE_JOB);
	const [updateJob] = useMutation(UPDATE_JOB);

	const { data } = useQuery(GET_JOB, {
		variables: { input: editingId },
		skip: !editingId,
		fetchPolicy: 'network-only',
	});

	useEffect(() => {
		if (data?.getJob) {
			const j = data.getJob;
			setJobData((prev) => ({
				...prev,
				_id: j._id,
				positionTitle: j.positionTitle || '',
				companyName: j.companyName || '',
				jobType: (j.jobType as JobType) ?? null,
				jobLocation: (j.jobLocation as JobLocation) ?? null,
				jobSalary: Number(j.jobSalary) || 0,
				experienceYears: Number(j.experienceYears) || 0,
				educationLevel: (j.educationLevel as EducationLevel) ?? null,
				employmentLevel: (j.employmentLevel as EmploymentLevel) ?? null,
				skillsRequired: Array.isArray(j.skillsRequired) ? j.skillsRequired : [],
				jobDesc: j.jobDesc || '',
				companyLogo: j.companyLogo || '',
			}));
			setSalaryInput(j.jobSalary ? String(j.jobSalary) : '');
			setExpInput(j.experienceYears ? String(j.experienceYears) : '');
		}
	}, [data?.getJob]);

	/** HELPERS **/
	const updateField = <K extends keyof JobForm>(key: K, value: JobForm[K]) => {
		setJobData((prev) => ({ ...prev, [key]: value }));
	};

	const addSkill = () => {
		const t = skillInput.trim();
		if (!t) return;
		if (!jobData.skillsRequired.includes(t)) {
			updateField('skillsRequired', [...jobData.skillsRequired, t]);
		}
		setSkillInput('');
	};

	const removeSkill = (s: string) => {
		updateField(
			'skillsRequired',
			jobData.skillsRequired.filter((x) => x !== s),
		);
	};

	const onSkillKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addSkill();
		}
	};

	const isDisabled = () => {
		const salary = Number(salaryInput || 0);
		const exp = Number(expInput || 0);
		return (
			jobData.positionTitle.trim() === '' ||
			jobData.companyName.trim() === '' ||
			jobData.jobType === null ||
			jobData.jobLocation === null ||
			salary <= 0 ||
			exp < 0 ||
			jobData.educationLevel === null ||
			jobData.employmentLevel === null ||
			jobData.jobDesc.trim() === '' ||
			jobData.skillsRequired.length === 0
		);
	};

	const uploadCompanyLogo = async () => {
		try {
			if (!logoInputRef.current?.files?.length) return;
			const file = logoInputRef.current.files[0];
			if (!file) return;

			const fd = new FormData();
			fd.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
            imageUploader(file: $file, target: $target)
          }`,
					variables: { file: null, target: 'job' },
				}),
			);
			fd.append('map', JSON.stringify({ '0': ['variables.file'] }));
			fd.append('0', file);

			const res = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, fd, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			if (res.data?.errors?.length) {
				throw new Error(res.data.errors[0].message || 'GraphQL error occurred');
			}

			const responseImage = res?.data?.data?.imageUploader;
			if (!responseImage) throw new Error('Upload failed - no response image');

			updateField('companyLogo', responseImage);
			await sweetMixinSuccessAlert('Logo uploaded');
			logoInputRef.current.value = '';
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.response?.data?.message || err?.message || 'Upload failed');
		}
	};

	const removeCompanyLogo = () => updateField('companyLogo', '');

	/** SAVE **/
	const saveHandler = useCallback(async () => {
		try {
			const payload = {
				...jobData,
				jobType: jobData.jobType || undefined,
				jobLocation: jobData.jobLocation || undefined,
				employmentLevel: jobData.employmentLevel || undefined,
				jobSalary: Number(salaryInput || 0),
				experienceYears: Number(expInput || 0),
			};

			// Debug log to see what's being sent
			console.log('Sending payload:', payload);

			if (editingId) {
				await updateJob({ variables: { input: payload } });
				await sweetMixinSuccessAlert('Job updated successfully');
			} else {
				await createJob({ variables: { input: payload } });
				await sweetMixinSuccessAlert('Job created successfully');
			}

			await router.push({ pathname: '/mypage', query: { category: 'myProfile' } });
		} catch (err) {
			sweetErrorHandling(err).then();
		}
	}, [jobData, editingId, salaryInput, expInput]);

	return (
		<div id="add-property-page" style={{ width: '100%', padding: '20px' }}>
			<Stack className="main-title-box" style={{ marginBottom: '20px' }}>
				<Typography className="main-title" style={{ fontSize: '30px', fontWeight: 600, marginBottom: '10px' }}>
					{editingId ? 'Edit Job' : 'Create New Job'}
				</Typography>
				<Typography className="sub-title" style={{ fontSize: '14px', color: '#666' }}>
					Post a role and find the right talent.
				</Typography>
			</Stack>

			<div style={{ width: '100%' }}>
				<Stack className="config config--with-sidebar" style={{ 
					display: 'grid', 
					gridTemplateColumns: '1fr 280px', 
					gap: '24px',
					padding: '38px 33px 35px 33px',
					borderRadius: '12px',
					border: '1px solid rgba(196, 196, 196, 0.79)',
					background: '#fff',
					boxShadow: '0px 1px 4px 0px rgba(24, 26, 32, 0.07)'
				}}>
					<Stack className="description-box" style={{ width: '100%' }}>
						<Stack className="config-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
							<Stack className="config-column" style={{ flex: 1 }}>
								<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
									Position Title
								</Typography>
								<input
									type="text"
									className="description-input"
									placeholder="e.g., Frontend Developer"
									value={jobData.positionTitle}
									onChange={(e) => updateField('positionTitle', e.target.value)}
									style={{
										width: '100%',
										height: '47px',
										outline: 'none',
										borderRadius: '8px',
										padding: '0px 15px',
										border: '1px solid #ddd'
									}}
								/>
							</Stack>
							<Stack className="config-column" style={{ flex: 1 }}>
								<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
									Company Name
								</Typography>
								<input
									type="text"
									className="description-input"
									placeholder="e.g., Google"
									value={jobData.companyName}
									onChange={(e) => updateField('companyName', e.target.value)}
									style={{
										width: '100%',
										height: '47px',
										outline: 'none',
										borderRadius: '8px',
										padding: '0px 15px',
										border: '1px solid #ddd'
									}}
								/>
							</Stack>
						</Stack>

						<Stack className="config-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
							<Stack className="price-year-after-price" style={{ flex: 1, position: 'relative' }}>
								<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
									Job Type
								</Typography>
								<select
									className="select-description"
									value={jobData.jobType ?? ''}
									onChange={(e) => updateField('jobType', (e.target.value || null) as JobType | null)}
									style={{
										width: '100%',
										height: '47px',
										borderRadius: '8px',
										border: '1px solid #ddd',
										background: '#fff',
										outline: 'none',
										paddingLeft: '15px',
										appearance: 'none',
										cursor: 'pointer'
									}}
								>
									<option disabled value="">
										Select
									</option>
									{jobTypes.map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
								<div className="divider" style={{
									position: 'absolute',
									height: '46px',
									borderLeft: '1px solid #ddd',
									right: '52px',
									top: '42px'
								}} />
								<img src="/img/icons/Vector.svg" className="arrow-down" style={{
									position: 'absolute',
									width: '15px',
									height: '7px',
									right: '18px',
									top: '62px',
									pointerEvents: 'none'
								}} />
							</Stack>

							<Stack className="price-year-after-price" style={{ flex: 1, position: 'relative' }}>
								<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
									Location
								</Typography>
								<select
									className="select-description"
									value={jobData.jobLocation ?? ''}
									onChange={(e) => updateField('jobLocation', (e.target.value || null) as JobLocation | null)}
									style={{
										width: '100%',
										height: '47px',
										borderRadius: '8px',
										border: '1px solid #ddd',
										background: '#fff',
										outline: 'none',
										paddingLeft: '15px',
										appearance: 'none',
										cursor: 'pointer'
									}}
								>
									<option disabled value="">
										Select
									</option>
									{jobLocations.map((loc) => (
										<option key={loc} value={loc}>
											{loc}
										</option>
									))}
								</select>
								<div className="divider" style={{
									position: 'absolute',
									height: '46px',
									borderLeft: '1px solid #ddd',
									right: '52px',
									top: '42px'
								}} />
								<img src="/img/icons/Vector.svg" className="arrow-down" style={{
									position: 'absolute',
									width: '15px',
									height: '7px',
									right: '18px',
									top: '62px',
									pointerEvents: 'none'
								}} />
							</Stack>

							<Stack className="price-year-after-price" style={{ flex: 1, position: 'relative' }}>
								<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
									Employment Level
								</Typography>
								<select
									className="select-description"
									value={jobData.employmentLevel ?? ''}
									onChange={(e) => updateField('employmentLevel', (e.target.value || null) as EmploymentLevel | null)}
									style={{
										width: '100%',
										height: '47px',
										borderRadius: '8px',
										border: '1px solid #ddd',
										background: '#fff',
										outline: 'none',
										paddingLeft: '15px',
										appearance: 'none',
										cursor: 'pointer'
									}}
								>
									<option disabled value="">
										Select
									</option>
									{employmentLevels.map((level) => (
										<option key={level} value={level}>
											{level}
										</option>
									))}
								</select>
								<div className="divider" style={{
									position: 'absolute',
									height: '46px',
									borderLeft: '1px solid #ddd',
									right: '52px',
									top: '42px'
								}} />
								<img src="/img/icons/Vector.svg" className="arrow-down" style={{
									position: 'absolute',
									width: '15px',
									height: '7px',
									right: '18px',
									top: '62px',
									pointerEvents: 'none'
								}} />
							</Stack>
						</Stack>

						<Stack className="config-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
							<Stack className="price-year-after-price" style={{ flex: 1 }}>
								<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
									Salary
								</Typography>
								<input
									type="text"
									inputMode="numeric"
									pattern="\d*"
									className="description-input"
									placeholder="e.g., 60000000"
									value={salaryInput}
									onChange={(e) => setSalaryInput(e.target.value.replace(/[^\d]/g, ''))}
									style={{
										width: '100%',
										height: '47px',
										outline: 'none',
										borderRadius: '8px',
										padding: '0px 15px',
										border: '1px solid #ddd'
									}}
								/>
							</Stack>

							<Stack className="price-year-after-price" style={{ flex: 1 }}>
								<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
									Experience (years)
								</Typography>
								<input
									type="text"
									inputMode="numeric"
									pattern="\d*"
									className="description-input"
									placeholder="e.g., 3"
									value={expInput}
									onChange={(e) => setExpInput(e.target.value.replace(/[^\d]/g, ''))}
									style={{
										width: '100%',
										height: '47px',
										outline: 'none',
										borderRadius: '8px',
										padding: '0px 15px',
										border: '1px solid #ddd'
									}}
								/>
							</Stack>

							<Stack className="price-year-after-price" style={{ flex: 1, position: 'relative' }}>
								<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
									Education Level
								</Typography>
								<select
									className="select-description"
									value={jobData.educationLevel ?? ''}
									onChange={(e) => updateField('educationLevel', (e.target.value || null) as EducationLevel | null)}
									style={{
										width: '100%',
										height: '47px',
										borderRadius: '8px',
										border: '1px solid #ddd',
										background: '#fff',
										outline: 'none',
										paddingLeft: '15px',
										appearance: 'none',
										cursor: 'pointer'
									}}
								>
									<option disabled value="">
										Select
									</option>
									{educationLevels.map((educationLevel) => (
										<option key={educationLevel} value={educationLevel}>
											{educationLevel}
										</option>
									))}
								</select>
								<div className="divider" style={{
									position: 'absolute',
									height: '46px',
									borderLeft: '1px solid #ddd',
									right: '52px',
									top: '42px'
								}} />
								<img src="/img/icons/Vector.svg" className="arrow-down" style={{
									position: 'absolute',
									width: '15px',
									height: '7px',
									right: '18px',
									top: '62px',
									pointerEvents: 'none'
								}} />
							</Stack>
						</Stack>

						{/* Skills */}
						<Stack className="config-column" style={{ marginBottom: '20px' }}>
							<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
								Skills (Enter or comma)
							</Typography>
							<TextField
								placeholder="e.g., React, TypeScript, GraphQL"
								value={skillInput}
								onChange={(e) => setSkillInput(e.target.value)}
								onKeyDown={onSkillKeyDown}
								size="small"
								InputProps={{ className: 'description-input' }}
								style={{ width: '100%' }}
							/>
							<Stack direction="row" gap={1} mt={1} flexWrap="wrap">
								{jobData.skillsRequired.map((s) => (
									<Chip key={s} label={s} onDelete={() => removeSkill(s)} sx={{ borderRadius: '999px' }} />
								))}
							</Stack>
						</Stack>

						{/* Description */}
						<Typography className="property-title" style={{ fontSize: '17px', fontWeight: 600, marginBottom: '15px' }}>
							Job Description
						</Typography>
						<Stack className="config-column">
							<Typography className="title" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
								Description
							</Typography>

							{/* simple editor textarea for now */}
							<textarea
								className="description-textarea"
								rows={8}
								placeholder="Markdown supported. Describe responsibilities, requirements, benefits..."
								value={jobData.jobDesc}
								onChange={(e) => updateField('jobDesc', e.target.value)}
								style={{
									width: '100%',
									minHeight: '160px',
									borderRadius: '8px',
									padding: '10px 15px',
									border: '1px solid #ddd',
									outline: 'none',
									resize: 'vertical',
									background: '#fff',
									fontSize: '14px',
									lineHeight: '1.6'
								}}
							/>

							{/* Live preview (ToastViewer) */}
							{jobData.jobDesc ? (
								<div className="viewer-wrapper" style={{
									marginTop: '10px',
									border: '1px solid #e5e7eb',
									borderRadius: '10px',
									padding: '12px',
									background: '#fff'
								}}>
									<ToastViewerComponent markdown={jobData.jobDesc} className={'ytb_play'} />
								</div>
							) : (
								<Typography className="viewer-empty" style={{
									marginTop: '8px',
									fontSize: '13px',
									color: '#717171'
								}}>
									Start typing to see a preview…
								</Typography>
							)}
						</Stack>
					</Stack>

					{/* RIGHT: compact company logo uploader (sticky, small) */}
					<aside className="images-box images-box--compact" style={{
						position: 'sticky',
						top: '88px',
						alignSelf: 'start',
						maxWidth: '280px'
					}}>
						<Typography className="upload-title" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
							Company Logo
						</Typography>

						<Stack className="upload-box upload-box--compact" style={{
							padding: '12px',
							border: '1px dashed #eb6753',
							borderRadius: '12px',
							background: '#fafafa',
							gap: '10px'
						}}>
							<Stack className="text-box" style={{ alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
								<Typography className="drag-title" style={{ fontSize: '14px', fontWeight: 600 }}>
									Choose logo
								</Typography>
								<Typography className="format-title" style={{ fontSize: '12px', color: '#6b7280' }}>
									JPEG/PNG • single file
								</Typography>
							</Stack>
							<Button className="browse-button" onClick={() => logoInputRef.current?.click()} style={{
								width: '100%',
								padding: '10px 14px',
								borderRadius: '12px',
								border: '1px solid #181a20',
								background: 'transparent',
								color: '#181a20'
							}}>
								<Typography className="browse-button-text" style={{ fontSize: '15px', fontWeight: 600 }}>
									{jobData.companyLogo ? 'Change Logo' : 'Upload Logo'}
								</Typography>
								<input
									ref={logoInputRef}
									type="file"
									hidden
									onChange={uploadCompanyLogo}
									accept="image/jpg,image/jpeg,image/png"
								/>
							</Button>
						</Stack>

						{jobData.companyLogo && (
							<Stack className="gallery-box gallery-box--compact" style={{ marginTop: '12px' }}>
								<Stack className="image-box image-box--compact" style={{
									width: '100%',
									height: '140px',
									borderRadius: '12px',
									overflow: 'hidden',
									border: '1px solid #e5e7eb',
									background: '#fff'
								}}>
									<img src={`${REACT_APP_API_URL}/${jobData.companyLogo}`} alt="company logo" style={{
										width: '100%',
										height: '100%',
										objectFit: 'contain',
										display: 'block'
									}} />
								</Stack>
								<Button className="next-button next-button--danger" onClick={removeCompanyLogo} style={{
									marginTop: '8px',
									background: '#eb6753',
									color: '#fff',
									padding: '10px 14px',
									borderRadius: '12px',
									border: 'none'
								}}>
									<Typography className="next-button-text" style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>
										Remove Logo
									</Typography>
								</Button>
							</Stack>
						)}
					</aside>
				</Stack>

				{/* Actions */}
				<Stack className="buttons-row" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
					<Button className="next-button" disabled={isDisabled()} onClick={saveHandler} style={{
						width: '190px',
						height: '44px',
						padding: '16px 30px',
						borderRadius: '12px',
						background: '#181a20',
						color: '#fff',
						border: 'none'
					}}>
						<Typography className="next-button-text" style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>
							Save
						</Typography>
					</Button>
				</Stack>
			</div>
		</div>
	);
};

export default AddProperty;
