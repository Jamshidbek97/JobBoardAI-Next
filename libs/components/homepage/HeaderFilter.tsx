import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button, Checkbox, FormControlLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { EducationLevel, EmploymentLevel, JobLocation, JobType } from '../../enums/job.enum';
import { JobInquiry } from '../../types/job/job.input';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	maxWidth: '95%',
	maxHeight: '90vh',
	bgcolor: 'background.paper',
	borderRadius: '20px',
	outline: 'none',
	boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
	p: 0,
	overflow: 'hidden',
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
			borderRadius: '12px',
			boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
		},
	},
};

const salaryOptions = [0, 30000, 50000, 70000, 90000, 110000, 130000, 150000];
const experienceOptions = [0, 1, 2, 3, 5, 7, 10];

interface HeaderFilterProps {
	initialInput: JobInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<JobInquiry>(initialInput);
	const locationRef: any = useRef();
	const typeRef: any = useRef();
	const salaryRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openSalary, setOpenSalary] = useState(false);
	const [jobLocations, setJobLocations] = useState<JobLocation[]>(Object.values(JobLocation));
	const [jobTypes, setJobTypes] = useState<JobType[]>(Object.values(JobType));

	// Debug logging
	useEffect(() => {
		console.log('🔍 HeaderFilter Debug:');
		console.log('- Window width:', window.innerWidth);
		console.log('- Should show desktop filter:', window.innerWidth > 768);
		console.log('- Should show mobile filter:', window.innerWidth <= 768);
	}, []);

	// NEW
	const locationMenuRef = useRef<HTMLDivElement | null>(null);
	const typeMenuRef = useRef<HTMLDivElement | null>(null);
	const salaryMenuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const onDocPointerDown = (event: MouseEvent) => {
			const target = event.target as Node;

			// Close location dropdown if clicked outside
			if (openLocation && !locationRef.current?.contains(target) && !locationMenuRef.current?.contains(target)) {
				setOpenLocation(false);
			}

			// Close type dropdown if clicked outside
			if (openType && !typeRef.current?.contains(target) && !typeMenuRef.current?.contains(target)) {
				setOpenType(false);
			}

			// Close salary dropdown if clicked outside
			if (openSalary && !salaryRef.current?.contains(target) && !salaryMenuRef.current?.contains(target)) {
				setOpenSalary(false);
			}
		};

		document.addEventListener('mousedown', onDocPointerDown);
		return () => document.removeEventListener('mousedown', onDocPointerDown);
	}, [openLocation, openType, openSalary]);

	/** HANDLERS **/
	const advancedFilterHandler = (status: boolean) => {
		setOpenLocation(false);
		setOpenSalary(false);
		setOpenType(false);
		setOpenAdvancedFilter(status);
	};

	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenSalary(false);
		setOpenType(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
		setOpenSalary(false);
	};

	const salaryStateChangeHandler = () => {
		setOpenSalary((prev) => !prev);
		setOpenType(false);
		setOpenLocation(false);
	};

	const disableAllStateHandler = () => {
		setOpenSalary(false);
		setOpenType(false);
		setOpenLocation(false);
	};

	const jobLocationSelectHandler = useCallback(
		async (value: JobLocation) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						locationList: [value],
					},
				});
				setOpenLocation(false);
			} catch (err) {
				console.error('jobLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const jobTypeSelectHandler = useCallback(
		async (value: JobType) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						typeList: [value],
					},
				});
				setOpenType(false);
			} catch (err) {
				console.error('jobTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const salarySelectHandler = useCallback(
		async (value: number) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						salaryRange: {
							start: value,
							end: value === 150000 ? 1000000 : value + 20000,
						} as { start: number; end: number },
					},
				});
				setOpenSalary(false);
			} catch (err) {
				console.error('salarySelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const educationLevelHandler = useCallback(
		async (level: EducationLevel) => {
			try {
				const currentList = searchFilter.search.educationLevelList || [];
				const newList = currentList.includes(level) ? currentList.filter((l) => l !== level) : [...currentList, level];

				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						educationLevelList: newList,
					},
				});
			} catch (err) {
				console.error('educationLevelHandler:', err);
			}
		},
		[searchFilter],
	);

	const employmentLevelHandler = useCallback(
		async (level: EmploymentLevel) => {
			try {
				const currentList = searchFilter.search.employmentLevels || [];
				const newList = currentList.includes(level) ? currentList.filter((l) => l !== level) : [...currentList, level];

				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						employmentLevels: newList,
					},
				});
			} catch (err) {
				console.error('employmentLevelHandler:', err);
			}
		},
		[searchFilter],
	);

	const remoteHandler = useCallback(
		async (remote: boolean) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						isRemote: remote,
					},
				});
			} catch (err) {
				console.error('remoteHandler:', err);
			}
		},
		[searchFilter],
	);

	const salaryMinHandler = useCallback(
		(e: SelectChangeEvent<number>) => {
			const value = Number(e.target.value);
			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					salaryRange: {
						start: value,
						end: searchFilter.search.salaryRange?.end ?? 200000,
					},
				},
			});
		},
		[searchFilter],
	);

	const salaryMaxHandler = useCallback(
		(e: SelectChangeEvent<number>) => {
			const value = Number(e.target.value);
			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					salaryRange: {
						start: searchFilter.search.salaryRange?.start ?? 0,
						end: value,
					},
				},
			});
		},
		[searchFilter],
	);

	const experienceHandler = useCallback(
		(e: SelectChangeEvent<number>) => {
			const value = Number(e.target.value);
			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					experienceRange: value,
				},
			});
		},
		[searchFilter],
	);

	const resetFilterHandler = () => {
		setSearchFilter(initialInput);
	};

	const pushSearchHandler = async () => {
		try {
			await router.push({
				pathname: '/jobs',
				query: { input: JSON.stringify(searchFilter) },
			});
		} catch (err) {
			console.error('pushSearchHandler:', err);
		}
	};

	return (
		<>
			{/* Desktop Filter - Hidden on Mobile */}
			<Box sx={{ display: { xs: 'none', md: 'block' } }}>
				<Stack className="header-filter">
					<Stack className="filter-container">
						<Stack className="filter-row">
							<Stack className="filter-item location-filter">
								<div className="filter-label">{t('LOCATION')}</div>
								<div className="filter-input" ref={locationRef} onClick={locationStateChangeHandler}>
									<div className="filter-icon">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<path
												d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
												stroke="currentColor"
												strokeWidth="2"
												fill="none"
											/>
											<circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
										</svg>
									</div>
									<div className="filter-text">
										{searchFilter.search.locationList.length > 0
											? searchFilter.search.locationList.join(', ')
											: t('Any location')}
									</div>
									<div className="filter-arrow">
										<ExpandMoreIcon />
									</div>
								</div>

								{openLocation && (
									<div className="filter-dropdown" ref={locationMenuRef}>
										<div className="dropdown-header">
											<div className="dropdown-title">{t('Select Location')}</div>
											<div className="dropdown-close" onClick={() => setOpenLocation(false)}>
												<CloseIcon />
											</div>
										</div>
										<div className="dropdown-content">
											{jobLocations.map((location) => (
												<div
													key={location}
													className={`dropdown-item ${
														searchFilter.search.locationList.includes(location) ? 'selected' : ''
													}`}
													onClick={() => jobLocationSelectHandler(location)}
												>
													{location}
												</div>
											))}
										</div>
									</div>
								)}
							</Stack>

							<Stack className="filter-item type-filter">
								<div className="filter-label">{t('JOB TYPE')}</div>
								<div className="filter-input" ref={typeRef} onClick={typeStateChangeHandler}>
									<div className="filter-icon">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
											<line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
											<line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
											<line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
										</svg>
									</div>
									<div className="filter-text">
										{searchFilter.search.typeList.length > 0
											? searchFilter.search.typeList.join(', ')
											: t('Any type')}
									</div>
									<div className="filter-arrow">
										<ExpandMoreIcon />
									</div>
								</div>

								{openType && (
									<div className="filter-dropdown" ref={typeMenuRef}>
										<div className="dropdown-header">
											<div className="dropdown-title">{t('Select Job Type')}</div>
											<div className="dropdown-close" onClick={() => setOpenType(false)}>
												<CloseIcon />
											</div>
										</div>
										<div className="dropdown-content">
											{jobTypes.map((type) => (
												<div
													key={type}
													className={`dropdown-item ${
														searchFilter.search.typeList.includes(type) ? 'selected' : ''
													}`}
													onClick={() => jobTypeSelectHandler(type)}
												>
													{type}
												</div>
											))}
										</div>
									</div>
								)}
							</Stack>

							<Stack className="filter-item salary-filter">
								<div className="filter-label">{t('SALARY')}</div>
								<div className="filter-input" ref={salaryRef} onClick={salaryStateChangeHandler}>
									<div className="filter-icon">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<path
												d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
												stroke="currentColor"
												strokeWidth="2"
												fill="none"
											/>
										</svg>
									</div>
									<div className="filter-text">
										{searchFilter.search.salaryRange.start > 0
											? `$${searchFilter.search.salaryRange.start.toLocaleString()}+`
											: '$0+'}
									</div>
									<div className="filter-arrow">
										<ExpandMoreIcon />
									</div>
								</div>

								{openSalary && (
									<div className="filter-dropdown" ref={salaryMenuRef}>
										<div className="dropdown-header">
											<div className="dropdown-title">{t('Select Salary Range')}</div>
											<div className="dropdown-close" onClick={() => setOpenSalary(false)}>
												<CloseIcon />
											</div>
										</div>
										<div className="dropdown-content">
											{salaryOptions.map((salary) => (
												<div
													key={salary}
													className={`dropdown-item ${
														searchFilter.search.salaryRange.start === salary ? 'selected' : ''
													}`}
													onClick={() => salarySelectHandler(salary)}
												>
													{salary > 0 ? `$${salary.toLocaleString()}+` : '$0+'}
												</div>
											))}
										</div>
									</div>
								)}
							</Stack>

							<Stack className="filter-item search-button">
								<Button
									className="search-btn"
									onClick={pushSearchHandler}
									startIcon={
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
											<path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
										</svg>
									}
								>
									{t('Search')}
								</Button>
							</Stack>

							<Stack className="filter-item advanced-filter">
								<Button
									className="advanced-filter-btn"
									onClick={() => advancedFilterHandler(true)}
									startIcon={
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
											<polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" stroke="currentColor" strokeWidth="2" fill="none" />
										</svg>
									}
								>
									{t('Filters')}
								</Button>
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</Box>

			{/* Mobile Filter - Simple Search Button */}
			<Box sx={{ display: { xs: 'block', md: 'none' }, p: 2 }}>
				<Button
					variant="contained"
					fullWidth
					onClick={() => advancedFilterHandler(true)}
					sx={{
						backgroundColor: '#1890ff',
						color: 'white',
						py: 1.5,
						borderRadius: '12px',
						fontWeight: 600,
						textTransform: 'none',
						boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
						'&:hover': {
							backgroundColor: '#096dd9',
							boxShadow: '0 6px 16px rgba(24, 144, 255, 0.4)',
						},
					}}
					startIcon={
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
							<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
							<path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
						</svg>
					}
				>
					{t('Search Jobs')}
				</Button>
			</Box>

			<Modal
				open={openAdvancedFilter}
				onClose={() => advancedFilterHandler(false)}
				aria-labelledby="advanced-job-filter"
			>
				<Box sx={style}>
					<div className="advanced-modal">
						<div className="modal-header">
							<h2>{t('Advanced Job Filters')}</h2>
							<button className="close-btn" onClick={() => advancedFilterHandler(false)}>
								<CloseIcon />
							</button>
						</div>

						<div className="modal-content">
							<div className="search-section">
								<div className="search-input-wrapper">
									<svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
										<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
										<path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
									</svg>
									<input
										className="search-input"
										value={searchFilter?.search?.text ?? ''}
										type="text"
										placeholder={t('Job title, company, or keywords...')}
										onChange={(e) => {
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: e.target.value },
											});
										}}
									/>
								</div>
							</div>

							<div className="filters-grid">
								<div className="filter-group">
									<h4 className="filter-title">{t('Salary Range')}</h4>
									<div className="range-inputs">
										<FormControl className="range-input">
											<Select
												value={searchFilter.search.salaryRange?.start || 0}
												onChange={salaryMinHandler}
												displayEmpty
												MenuProps={MenuProps}
											>
												{salaryOptions.map((option) => (
													<MenuItem key={`min-${option}`} value={option}>
														${option.toLocaleString()}
													</MenuItem>
												))}
											</Select>
										</FormControl>
										<span className="range-separator">to</span>
										<FormControl className="range-input">
											<Select
												value={searchFilter.search.salaryRange?.end || 1000000}
												onChange={salaryMaxHandler}
												displayEmpty
												MenuProps={MenuProps}
											>
												{[...salaryOptions, 200000].map((option) => (
													<MenuItem key={`max-${option}`} value={option}>
														{option === 200000 ? '$200,000+' : `$${option.toLocaleString()}`}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</div>
								</div>

								<div className="filter-group">
									<h4 className="filter-title">{t('Experience Level')}</h4>
									<FormControl fullWidth>
										<Select
											value={searchFilter.search.experienceRange || 0}
											onChange={experienceHandler}
											MenuProps={MenuProps}
										>
											<MenuItem value={0}>{t('Any experience')}</MenuItem>
											{experienceOptions.map((exp) => (
												<MenuItem key={`exp-${exp}`} value={exp}>
													{exp === 0 ? t('Entry level') : `${exp}+ ${t('years')}`}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</div>

								<div className="filter-group">
									<h4 className="filter-title">{t('Education Level')}</h4>
									<div className="checkbox-list">
										{Object.values(EducationLevel).map((level) => (
											<FormControlLabel
												key={level}
												className="checkbox-item"
												control={
													<Checkbox
														checked={searchFilter.search.educationLevelList?.includes(level) || false}
														onChange={() => educationLevelHandler(level)}
														color="primary"
													/>
												}
												label={level}
											/>
										))}
									</div>
								</div>

								<div className="filter-group">
									<h4 className="filter-title">{t('Employment Level')}</h4>
									<div className="checkbox-list">
										{Object.values(EmploymentLevel).map((level) => (
											<FormControlLabel
												key={level}
												className="checkbox-item"
												control={
													<Checkbox
														checked={searchFilter?.search?.employmentLevels?.includes(level)}
														onChange={() => employmentLevelHandler(level)}
														color="primary"
													/>
												}
												label={level}
											/>
										))}
									</div>
								</div>

								<div className="filter-group remote-filter">
									<FormControlLabel
										className="remote-checkbox"
										control={
											<Checkbox
												checked={searchFilter.search.isRemote || false}
												onChange={(e) => remoteHandler(e.target.checked)}
												color="primary"
											/>
										}
										label={
											<span className="remote-label">
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
													<path
														d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
														stroke="currentColor"
														strokeWidth="2"
														fill="none"
													/>
													<path
														d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
														stroke="currentColor"
														strokeWidth="2"
														fill="none"
													/>
												</svg>
												{t('Remote Work Only')}
											</span>
										}
									/>
								</div>
							</div>
						</div>

						<div className="modal-footer">
							<Button
								variant="outlined"
								className="reset-button"
								onClick={resetFilterHandler}
								startIcon={
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<polyline points="1,4 1,10 7,10" stroke="currentColor" strokeWidth="2" />
										<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="2" />
									</svg>
								}
							>
								{t('Reset All')}
							</Button>
							<Button
								variant="contained"
								className="apply-button"
								onClick={pushSearchHandler}
								startIcon={
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
										<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
										<path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
									</svg>
								}
							>
								{t('Apply Filters')}
							</Button>
						</div>
					</div>
				</Box>
			</Modal>
		</>
	);
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		search: {
			locationList: [],
			typeList: [],
			employmentLevels: [],
			isRemote: false,
			salaryRange: {
				start: 0,
				end: 200000,
			},
		},
	},
};

export default HeaderFilter;
