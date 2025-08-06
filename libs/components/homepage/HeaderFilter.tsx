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

	/** LIFECYCLE **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target)) {
				setOpenLocation(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
			}

			if (!salaryRef?.current?.contains(event.target)) {
				setOpenSalary(false);
			}
		};

		document.addEventListener('mousedown', clickHandler);

		return () => {
			document.removeEventListener('mousedown', clickHandler);
		};
	}, []);

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
				locationStateChangeHandler();
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
				typeStateChangeHandler();
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
				disableAllStateHandler();
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
				const currentList = searchFilter.search.employmentLevels;
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
			<div className="job-search-container">
				<div className="job-search-card">
					<div className="search-filters">
						<div
							className={`filter-item location-filter ${openLocation ? 'active' : ''}`}
							onClick={locationStateChangeHandler}
							ref={locationRef}
						>
							<div className="filter-content">
								<div className="filter-icon">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
										<path
											d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
											stroke="currentColor"
											strokeWidth="2"
											fill="none"
										/>
										<circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" fill="none" />
									</svg>
								</div>
								<div className="filter-text">
									<span className="filter-label">Location</span>
									<span className="filter-value">
										{searchFilter?.search?.locationList?.length
											? searchFilter.search.locationList[0]
											: t('Any location')}
									</span>
								</div>
							</div>
							<ExpandMoreIcon className="expand-icon" />
						</div>

						<div
							className={`filter-item type-filter ${openType ? 'active' : ''}`}
							onClick={typeStateChangeHandler}
							ref={typeRef}
						>
							<div className="filter-content">
								<div className="filter-icon">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
										<rect
											x="3"
											y="4"
											width="18"
											height="18"
											rx="2"
											ry="2"
											stroke="currentColor"
											strokeWidth="2"
											fill="none"
										/>
										<line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
										<line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
										<line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
									</svg>
								</div>
								<div className="filter-text">
									<span className="filter-label">Job Type</span>
									<span className="filter-value">
										{searchFilter?.search?.typeList?.length ? searchFilter.search.typeList[0] : t('Any type')}
									</span>
								</div>
							</div>
							<ExpandMoreIcon className="expand-icon" />
						</div>

						<div
							className={`filter-item salary-filter ${openSalary ? 'active' : ''}`}
							onClick={salaryStateChangeHandler}
							ref={salaryRef}
						>
							<div className="filter-content">
								<div className="filter-icon">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
										<line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
										<path
											d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
											stroke="currentColor"
											strokeWidth="2"
											fill="none"
										/>
									</svg>
								</div>
								<div className="filter-text">
									<span className="filter-label">Salary</span>
									<span className="filter-value">
										{searchFilter?.search?.salaryRange
											? `$${searchFilter.search.salaryRange.start.toLocaleString()}+`
											: t('Any salary')}
									</span>
								</div>
							</div>
							<ExpandMoreIcon className="expand-icon" />
						</div>
					</div>

					<div className="action-buttons">
						<button className="advanced-filter-btn" onClick={() => advancedFilterHandler(true)}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
								<polygon
									points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
							</svg>
							<span>{t('Filters')}</span>
						</button>
						<button className="search-btn" onClick={pushSearchHandler}>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
								<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
								<path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
							</svg>
							<span>Search</span>
						</button>
					</div>

					{/* DROPDOWN MENUS */}
					<div className={`dropdown-menu location-dropdown ${openLocation ? 'show' : ''}`}>
						{jobLocations.map((location) => (
							<div key={location} className="dropdown-item" onClick={() => jobLocationSelectHandler(location)}>
								<span>{location}</span>
							</div>
						))}
					</div>

					<div className={`dropdown-menu type-dropdown ${openType ? 'show' : ''}`}>
						{jobTypes.map((type) => (
							<div key={type} className="dropdown-item" onClick={() => jobTypeSelectHandler(type)}>
								<span>{type}</span>
							</div>
						))}
					</div>

					<div className={`dropdown-menu salary-dropdown ${openSalary ? 'show' : ''}`}>
						{salaryOptions.map((salary) => (
							<div key={salary} className="dropdown-item" onClick={() => salarySelectHandler(salary)}>
								<span>${salary.toLocaleString()}+</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ADVANCED FILTER MODAL */}
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
														checked={searchFilter.search.employmentLevels.includes(level)}
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
