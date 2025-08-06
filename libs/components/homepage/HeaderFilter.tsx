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
	maxWidth: '90%',
	bgcolor: 'background.paper',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: 24,
	p: 3,
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
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
			<Stack className={'job-search-box'}>
				<Stack className={'select-box'}>
					<Box className={`box ${openLocation ? 'on' : ''}`} onClick={locationStateChangeHandler} ref={locationRef}>
						<span>
							{searchFilter?.search?.locationList?.length ? searchFilter.search.locationList[0] : t('Location')}
						</span>
						<ExpandMoreIcon />
					</Box>

					<Box className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler} ref={typeRef}>
						<span>{searchFilter?.search?.typeList?.length ? searchFilter.search.typeList[0] : t('Job Type')}</span>
						<ExpandMoreIcon />
					</Box>

					<Box className={`box ${openSalary ? 'on' : ''}`} onClick={salaryStateChangeHandler} ref={salaryRef}>
						<span>
							{searchFilter?.search?.salaryRange
								? `$${searchFilter.search.salaryRange.start.toLocaleString()}+`
								: t('Salary')}
						</span>
						<ExpandMoreIcon />
					</Box>
				</Stack>

				<Stack className={'search-box-other'}>
					<Box className={'advanced-filter'} onClick={() => advancedFilterHandler(true)}>
						<img src="/img/icons/tune.svg" alt="Filter" />
						<span>{t('Advanced')}</span>
					</Box>
					<Box className={'search-btn'} onClick={pushSearchHandler}>
						<img src="/img/icons/search_white.svg" alt="Search" />
					</Box>
				</Stack>

				{/* LOCATION MENU */}
				<div className={`filter-location ${openLocation ? 'on' : ''}`}>
					{jobLocations.map((location) => (
						<div key={location} onClick={() => jobLocationSelectHandler(location)}>
							<span>{location}</span>
						</div>
					))}
				</div>

				{/* JOB TYPE MENU */}
				<div className={`filter-type ${openType ? 'on' : ''}`}>
					{jobTypes.map((type) => (
						<div key={type} onClick={() => jobTypeSelectHandler(type)}>
							<span>{type}</span>
						</div>
					))}
				</div>

				{/* SALARY MENU */}
				<div className={`filter-salary ${openSalary ? 'on' : ''}`}>
					{salaryOptions.map((salary) => (
						<span key={salary} onClick={() => salarySelectHandler(salary)}>
							${salary.toLocaleString()}+
						</span>
					))}
				</div>
			</Stack>

			{/* ADVANCED FILTER MODAL */}
			<Modal
				open={openAdvancedFilter}
				onClose={() => advancedFilterHandler(false)}
				aria-labelledby="advanced-job-filter"
			>
				<Box sx={style}>
					<Box className={'advanced-filter-modal'}>
						<div className={'close'} onClick={() => advancedFilterHandler(false)}>
							<CloseIcon />
						</div>

						<div className={'top'}>
							<span>{t('Find your dream job')}</span>
							<div className={'search-input-box'}>
								<img src="/img/icons/search.svg" alt="Search" />
								<input
									value={searchFilter?.search?.text ?? ''}
									type="text"
									placeholder={t('Job title, company, or keywords')}
									onChange={(e) => {
										setSearchFilter({
											...searchFilter,
											search: { ...searchFilter.search, text: e.target.value },
										});
									}}
								/>
							</div>
						</div>

						<Divider sx={{ my: 3 }} />

						<div className={'middle'}>
							<div className="filter-section">
								<h4>{t('Salary Range')}</h4>
								<div className="range-selectors">
									<FormControl fullWidth>
										<Select
											value={searchFilter.search.salaryRange?.start || 0}
											onChange={salaryMinHandler}
											displayEmpty
										>
											{salaryOptions.map((option) => (
												<MenuItem key={`min-${option}`} value={option}>
													${option.toLocaleString()}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									<span className="range-divider">-</span>
									<FormControl fullWidth>
										<Select
											value={searchFilter.search.salaryRange?.end || 1000000}
											onChange={salaryMaxHandler}
											displayEmpty
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

							<div className="filter-section">
								<h4>{t('Experience')}</h4>
								<FormControl fullWidth>
									<Select value={searchFilter.search.experienceRange || 0} onChange={experienceHandler}>
										<MenuItem value={0}>{t('Any experience')}</MenuItem>
										{experienceOptions.map((exp) => (
											<MenuItem key={`exp-${exp}`} value={exp}>
												{exp === 0 ? t('Entry level') : `${exp}+ ${t('years')}`}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</div>

							<div className="filter-section">
								<h4>{t('Education Level')}</h4>
								<div className="checkbox-group">
									{Object.values(EducationLevel).map((level) => (
										<FormControlLabel
											key={level}
											control={
												<Checkbox
													checked={searchFilter.search.educationLevelList?.includes(level) || false}
													onChange={() => educationLevelHandler(level)}
												/>
											}
											label={level}
										/>
									))}
								</div>
							</div>

							<div className="filter-section">
								<h4>{t('Employment Level')}</h4>
								<div className="checkbox-group">
									{Object.values(EmploymentLevel).map((level) => (
										<FormControlLabel
											key={level}
											control={
												<Checkbox
													checked={searchFilter.search.employmentLevels.includes(level)}
													onChange={() => employmentLevelHandler(level)}
												/>
											}
											label={level}
										/>
									))}
								</div>
							</div>

							<div className="filter-section">
								<FormControlLabel
									control={
										<Checkbox
											checked={searchFilter.search.isRemote || false}
											onChange={(e) => remoteHandler(e.target.checked)}
										/>
									}
									label={t('Remote only')}
								/>
							</div>
						</div>

						<Divider sx={{ my: 3 }} />

						<div className={'bottom'}>
							<Button
								variant="outlined"
								className={'reset-btn'}
								onClick={resetFilterHandler}
								startIcon={<img src="/img/icons/reset.svg" alt="Reset" />}
							>
								{t('Reset filters')}
							</Button>
							<Button
								variant="contained"
								className={'search-btn'}
								onClick={pushSearchHandler}
								startIcon={<img src="/img/icons/search_white.svg" alt="Search" />}
							>
								{t('Search jobs')}
							</Button>
						</div>
					</Box>
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
