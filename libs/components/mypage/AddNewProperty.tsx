import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography, Chip, TextField } from '@mui/material';
import axios from 'axios';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CREATE_JOB, UPDATE_JOB } from '../../../apollo/user/mutation';
import { GET_JOB } from '../../../apollo/user/query';
import { JobLocation, JobType } from '../../enums/job.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';

type JobForm = {
	_id?: string;
	positionTitle: string;
	jobType: JobType | null; // <- Option A: null means "not chosen yet"
	jobLocation: JobLocation | null; // <- same idea here
	jobSalary: number;
	experienceYears: number;
	educationLevel: string;
	skillsRequired: string[];
	jobDesc: string;
	companyLogo?: string; // single image path
};

const AddProperty = () => {
	const router = useRouter();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	const logoInputRef = useRef<HTMLInputElement | null>(null);
	const [skillInput, setSkillInput] = useState('');
	const [jobData, setJobData] = useState<JobForm>({
		positionTitle: '',
		jobType: null,
		jobLocation: null,
		jobSalary: 0,
		experienceYears: 0,
		educationLevel: '',
		skillsRequired: [],
		jobDesc: '',
		companyLogo: '',
	});

	// Support legacy ?propertyId or new ?jobId
	const editingId = useMemo(() => {
		const id = (router.query.jobId || router.query.propertyId) as string | undefined;
		return (Array.isArray(id) ? id[0] : id) || '';
	}, [router.query.jobId, router.query.propertyId]);

	const jobTypes = useMemo(() => Object.values(JobType), []);
	const jobLocations = useMemo(() => Object.values(JobLocation), []);

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
				jobType: (j.jobType as JobType) ?? null,
				jobLocation: (j.jobLocation as JobLocation) ?? null,
				jobSalary: Number(j.jobSalary) || 0,
				experienceYears: Number(j.experienceYears) || 0,
				educationLevel: j.educationLevel || '',
				skillsRequired: Array.isArray(j.skillsRequired) ? j.skillsRequired : [],
				jobDesc: j.jobDesc || '',
				companyLogo: j.companyLogo || '',
			}));
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

	const isDisabled = () =>
		jobData.positionTitle.trim() === '' ||
		jobData.jobType === null ||
		jobData.jobLocation === null ||
		jobData.jobSalary <= 0 ||
		jobData.experienceYears < 0 ||
		jobData.educationLevel.trim() === '' ||
		jobData.jobDesc.trim() === '' ||
		jobData.skillsRequired.length === 0;

	/** SINGLE LOGO UPLOAD via GraphQL multipart **/
	const uploadCompanyLogo = async () => {
		try {
			if (!logoInputRef.current?.files?.length) return;

			const file = logoInputRef.current.files[0];
			if (!file) return;

			const fd = new FormData();

			// send exactly one file using the same imagesUploader
			fd.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
            imagesUploader(files: $files, target: $target)
          }`,
					variables: { files: [null], target: 'company-logo' }, // store under uploads/company-logo
				}),
			);
			fd.append('map', JSON.stringify({ '0': ['variables.files.0'] }));
			fd.append('0', file);

			const res = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, fd, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': 'true',
					Authorization: `Bearer ${token}`,
				},
			});

			const arr: string[] = res?.data?.data?.imagesUploader || [];
			const first = arr[0];
			if (!first) throw new Error('Upload failed');

			updateField('companyLogo', first);
			await sweetMixinSuccessAlert('Logo uploaded');
			logoInputRef.current.value = '';
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || 'Upload failed');
		}
	};

	const removeCompanyLogo = () => updateField('companyLogo', '');

	/** SAVE **/
	const saveHandler = useCallback(async () => {
		try {
			const payload = {
				...jobData,
				jobType: jobData.jobType ?? undefined, // if your backend doesn't accept null
				jobLocation: jobData.jobLocation ?? undefined,
			};

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
	}, [jobData, editingId]);

	return (
		<div id="add-property-page">
			<Stack className="main-title-box">
				<Typography className="main-title">{editingId ? 'Edit Job' : 'Create New Job'}</Typography>
				<Typography className="sub-title">Post a role and find the right talent.</Typography>
			</Stack>

			<div>
				<Stack className="config">
					<Stack className="description-box">
						{/* Position Title */}
						<Stack className="config-column">
							<Typography className="title">Position Title</Typography>
							<input
								type="text"
								className="description-input"
								placeholder="e.g., Frontend Developer"
								value={jobData.positionTitle}
								onChange={(e) => updateField('positionTitle', e.target.value)}
							/>
						</Stack>

						{/* Type + Location */}
						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Job Type</Typography>
								<select
									className="select-description"
									value={jobData.jobType ?? ''} // '' for placeholder
									onChange={(e) => updateField('jobType', (e.target.value || null) as JobType | null)}
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
								<div className="divider" />
								<img src="/img/icons/Vector.svg" className="arrow-down" />
							</Stack>

							<Stack className="price-year-after-price">
								<Typography className="title">Location</Typography>
								<select
									className="select-description"
									value={jobData.jobLocation ?? ''} // '' for placeholder
									onChange={(e) => updateField('jobLocation', (e.target.value || null) as JobLocation | null)}
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
								<div className="divider" />
								<img src="/img/icons/Vector.svg" className="arrow-down" />
							</Stack>
						</Stack>

						{/* Salary + Experience + Education */}
						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Salary</Typography>
								<input
									type="number"
									className="description-input"
									placeholder="e.g., 60000000"
									value={jobData.jobSalary}
									onChange={(e) => updateField('jobSalary', parseInt(e.target.value || '0', 10))}
								/>
							</Stack>

							<Stack className="price-year-after-price">
								<Typography className="title">Experience (years)</Typography>
								<input
									type="number"
									className="description-input"
									placeholder="e.g., 3"
									value={jobData.experienceYears}
									onChange={(e) => updateField('experienceYears', parseInt(e.target.value || '0', 10))}
								/>
							</Stack>

							<Stack className="price-year-after-price">
								<Typography className="title">Education Level</Typography>
								<input
									type="text"
									className="description-input"
									placeholder="e.g., Bachelor's or above"
									value={jobData.educationLevel}
									onChange={(e) => updateField('educationLevel', e.target.value)}
								/>
							</Stack>
						</Stack>

						{/* Skills */}
						<Stack className="config-column">
							<Typography className="title">Skills (Enter or comma)</Typography>
							<TextField
								placeholder="e.g., React, TypeScript, GraphQL"
								value={skillInput}
								onChange={(e) => setSkillInput(e.target.value)}
								onKeyDown={onSkillKeyDown}
								size="small"
								InputProps={{ className: 'description-input' }}
							/>
							<Stack direction="row" gap={1} mt={1} flexWrap="wrap">
								{jobData.skillsRequired.map((s) => (
									<Chip key={s} label={s} onDelete={() => removeSkill(s)} sx={{ borderRadius: '999px' }} />
								))}
							</Stack>
						</Stack>

						{/* Description */}
						<Typography className="property-title">Job Description</Typography>
						<Stack className="config-column">
							<Typography className="title">Description</Typography>
							<textarea
								className="description-text"
								placeholder="Responsibilities, requirements, nice-to-haves…"
								value={jobData.jobDesc}
								onChange={(e) => updateField('jobDesc', e.target.value)}
							/>
						</Stack>
					</Stack>

					{/* Company Logo (single) */}
					<Typography className="upload-title">Company Logo (single)</Typography>
					<Stack className="images-box">
						<Stack className="upload-box">
							<Stack className="text-box">
								<Typography className="drag-title">Choose logo</Typography>
								<Typography className="format-title">JPEG/PNG, single file</Typography>
							</Stack>
							<Button className="browse-button" onClick={() => logoInputRef.current?.click()}>
								<Typography className="browse-button-text">
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
							<Stack className="gallery-box">
								<Stack className="image-box">
									<img src={`${REACT_APP_API_URL}/${jobData.companyLogo}`} alt="company logo" />
								</Stack>
								<Button className="next-button" onClick={removeCompanyLogo}>
									<Typography className="next-button-text">Remove Logo</Typography>
								</Button>
							</Stack>
						)}
					</Stack>

					{/* Actions */}
					<Stack className="buttons-row">
						<Button className="next-button" disabled={isDisabled()} onClick={saveHandler}>
							<Typography className="next-button-text">Save</Typography>
						</Button>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default AddProperty;
