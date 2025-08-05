import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button, Chip, Slider } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';

// Job-related enums and types
export enum JobLocation {
	REMOTE = 'Remote',
	NEW_YORK = 'New York',
	SAN_FRANCISCO = 'San Francisco',
	LONDON = 'London',
	BERLIN = 'Berlin',
	TOKYO = 'Tokyo',
	SYDNEY = 'Sydney',
	TORONTO = 'Toronto',
}

export enum JobType {
	FULL_TIME = 'Full-time',
	PART_TIME = 'Part-time',
	CONTRACT = 'Contract',
	FREELANCE = 'Freelance',
	INTERNSHIP = 'Internship',
}

export enum ExperienceLevel {
	ENTRY_LEVEL = 'Entry Level',
	MID_LEVEL = 'Mid Level',
	SENIOR_LEVEL = 'Senior Level',
	EXECUTIVE = 'Executive',
}

export enum JobCategory {
	ENGINEERING = 'Engineering',
	DESIGN = 'Design',
	MARKETING = 'Marketing',
	SALES = 'Sales',
	PRODUCT = 'Product',
	DATA_SCIENCE = 'Data Science',
	FINANCE = 'Finance',
	HR = 'Human Resources',
	OPERATIONS = 'Operations',
}

export interface JobSearchInquiry {
	page: number;
	limit: number;
	search: {
		text?: string;
		locationList?: JobLocation[];
		typeList?: JobType[];
		categoryList?: JobCategory[];
		experienceList?: ExperienceLevel[];
		salaryRange?: {
			start: number;
			end: number;
		};
		companySize?: string[];
		remote?: boolean;
		benefits?: string[];
	};
}

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	maxWidth: '90vw',
	maxHeight: '90vh',
	bgcolor: 'background.paper',
	borderRadius: '16px',
	outline: 'none',
	boxShadow: '0 20px 80px rgba(0, 0, 0, 0.15)',
	overflow: 'auto',
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
			borderRadius: '12px',
			marginTop: '8px',
		},
	},
};

interface JobHeaderFilterProps {
	initialInput: JobSearchInquiry;
}

const JobHeaderFilter = (props: JobHeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<JobSearchInquiry>(initialInput);
	const locationRef = useRef<HTMLDivElement>(null);
	const typeRef = useRef<HTMLDivElement>(null);
	const categoryRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	// Modal and dropdown states
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openCategory, setOpenCategory] = useState(false);

	// Data arrays
	const [jobLocations] = useState<JobLocation[]>(Object.values(JobLocation));
	const [jobTypes] = useState<JobType[]>(Object.values(JobType));
	const [jobCategories] = useState<JobCategory[]>(Object.values(JobCategory));
	const [experienceLevels] = useState<ExperienceLevel[]>(Object.values(ExperienceLevel));

	// Advanced filter states
	const [salaryRange, setSalaryRange] = useState<number[]>([0, 200000]);
	const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
	const [companySize, setCompanySize] = useState<string>('all');

	const benefits = [
		'Health Insurance',
		'Dental Insurance',
		'Vision Insurance',
		'401k',
		'Remote Work',
		'Flexible Hours',
		'Unlimited PTO',
		'Stock Options',
		'Learning Budget',
		'Gym Membership',
		'Free Meals',
		'Childcare',
	];

	const companySizes = [
		{ value: 'all', label: 'All Company Sizes' },
		{ value: 'startup', label: 'Startup (1-50)' },
		{ value: 'small', label: 'Small (51-200)' },
		{ value: 'medium', label: 'Medium (201-1000)' },
		{ value: 'large', label: 'Large (1001+)' },
	];

	/** LIFECYCLE **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target as Node)) {
				setOpenLocation(false);
			}
			if (!typeRef?.current?.contains(event.target as Node)) {
				setOpenType(false);
			}
			if (!categoryRef?.current?.contains(event.target as Node)) {
				setOpenCategory(false);
			}
		};

		document.addEventListener('mousedown', clickHandler);
		return () => document.removeEventListener('mousedown', clickHandler);
	}, []);

	/** HANDLERS **/
	const advancedFilterHandler = (status: boolean) => {
		setOpenLocation(false);
		setOpenType(false);
		setOpenCategory(false);
		setOpenAdvancedFilter(status);
	};

	const toggleDropdown = (dropdown: string) => {
		setOpenLocation(dropdown === 'location' ? !openLocation : false);
		setOpenType(dropdown === 'type' ? !openType : false);
		setOpenCategory(dropdown === 'category' ? !openCategory : false);
	};

	const locationSelectHandler = useCallback(
		(value: JobLocation) => {
			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					locationList: [value],
				},
			});
			setOpenLocation(false);
		},
		[searchFilter],
	);

	const typeSelectHandler = useCallback(
		(value: JobType) => {
			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					typeList: [value],
				},
			});
			setOpenType(false);
		},
		[searchFilter],
	);

	const categorySelectHandler = useCallback(
		(value: JobCategory) => {
			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					categoryList: [value],
				},
			});
			setOpenCategory(false);
		},
		[searchFilter],
	);

	const experienceSelectHandler = useCallback(
		(level: ExperienceLevel) => {
			const currentExperience = searchFilter?.search?.experienceList || [];
			const newExperience = currentExperience.includes(level)
				? currentExperience.filter((item) => item !== level)
				: [...currentExperience, level];

			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					experienceList: newExperience.length > 0 ? newExperience : undefined,
				},
			});
		},
		[searchFilter],
	);

	const benefitToggleHandler = (benefit: string) => {
		const newBenefits = selectedBenefits.includes(benefit)
			? selectedBenefits.filter((b) => b !== benefit)
			: [...selectedBenefits, benefit];

		setSelectedBenefits(newBenefits);
		setSearchFilter({
			...searchFilter,
			search: {
				...searchFilter.search,
				benefits: newBenefits.length > 0 ? newBenefits : undefined,
			},
		});
	};

	const salaryRangeHandler = (event: Event, newValue: number | number[]) => {
		const range = newValue as number[];
		setSalaryRange(range);
		setSearchFilter({
			...searchFilter,
			search: {
				...searchFilter.search,
				salaryRange: { start: range[0], end: range[1] },
			},
		});
	};

	const companySizeHandler = (value: string) => {
		setCompanySize(value);
		setSearchFilter({
			...searchFilter,
			search: {
				...searchFilter.search,
				companySize: value !== 'all' ? [value] : undefined,
			},
		});
	};

	const resetFilterHandler = () => {
		setSearchFilter(initialInput);
		setSalaryRange([0, 200000]);
		setSelectedBenefits([]);
		setCompanySize('all');
	};

	const pushSearchHandler = async () => {
		try {
			// Clean up empty arrays
			const cleanFilter = { ...searchFilter };
			Object.keys(cleanFilter.search).forEach((key) => {
				const value = cleanFilter.search[key as keyof typeof cleanFilter.search];
				if (Array.isArray(value) && value.length === 0) {
					delete cleanFilter.search[key as keyof typeof cleanFilter.search];
				}
			});

			await router.push(
				`/jobs?search=${encodeURIComponent(JSON.stringify(cleanFilter))}`,
				`/jobs?search=${encodeURIComponent(JSON.stringify(cleanFilter))}`,
			);
			setOpenAdvancedFilter(false);
		} catch (err) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	if (device === 'mobile') {
		return (
			<div className="mobile-job-filter">
				<div className="mobile-search-input">
					<SearchIcon />
					<input
						type="text"
						placeholder="Search jobs, companies, or skills..."
						value={searchFilter?.search?.text || ''}
						onChange={(e) =>
							setSearchFilter({
								...searchFilter,
								search: { ...searchFilter.search, text: e.target.value },
							})
						}
					/>
				</div>
				<Button variant="contained" className="mobile-filter-btn" onClick={() => setOpenAdvancedFilter(true)}>
					<TuneIcon /> Filters
				</Button>
			</div>
		);
	} else {
		return (
			<>
				<Stack className="job-search-box">
					<div className="main-search-input">
						<SearchIcon className="search-icon" />
						<input
							type="text"
							placeholder="Search for jobs, companies, or skills..."
							value={searchFilter?.search?.text || ''}
							onChange={(e) =>
								setSearchFilter({
									...searchFilter,
									search: { ...searchFilter.search, text: e.target.value },
								})
							}
						/>
					</div>

					<Stack className="job-select-box">
						<Box
							component="div"
							className={`filter-box ${openLocation ? 'active' : ''}`}
							onClick={() => toggleDropdown('location')}
						>
							<LocationOnIcon className="box-icon" />
							<span>{searchFilter?.search?.locationList?.[0] || 'Location'}</span>
							<ExpandMoreIcon className="expand-icon" />
						</Box>

						<Box className={`filter-box ${openType ? 'active' : ''}`} onClick={() => toggleDropdown('type')}>
							<WorkIcon className="box-icon" />
							<span>{searchFilter?.search?.typeList?.[0] || 'Job Type'}</span>
							<ExpandMoreIcon className="expand-icon" />
						</Box>

						<Box className={`filter-box ${openCategory ? 'active' : ''}`} onClick={() => toggleDropdown('category')}>
							<BusinessIcon className="box-icon" />
							<span>{searchFilter?.search?.categoryList?.[0] || 'Category'}</span>
							<ExpandMoreIcon className="expand-icon" />
						</Box>
					</Stack>

					<Stack className="job-action-box">
						<Box className="advanced-filter-btn" onClick={() => advancedFilterHandler(true)}>
							<TuneIcon />
							<span>Advanced</span>
						</Box>
						<Box className="search-btn" onClick={pushSearchHandler}>
							<SearchIcon />
						</Box>
					</Stack>

					{/* Dropdown Menus */}
					<div className={`filter-dropdown location-dropdown ${openLocation ? 'active' : ''}`} ref={locationRef}>
						{jobLocations.map((location) => (
							<div key={location} onClick={() => locationSelectHandler(location)} className="dropdown-item">
								<LocationOnIcon />
								<span>{location}</span>
							</div>
						))}
					</div>

					<div className={`filter-dropdown type-dropdown ${openType ? 'active' : ''}`} ref={typeRef}>
						{jobTypes.map((type) => (
							<div key={type} onClick={() => typeSelectHandler(type)} className="dropdown-item">
								<WorkIcon />
								<span>{type}</span>
							</div>
						))}
					</div>

					<div className={`filter-dropdown category-dropdown ${openCategory ? 'active' : ''}`} ref={categoryRef}>
						{jobCategories.map((category) => (
							<div key={category} onClick={() => categorySelectHandler(category)} className="dropdown-item">
								<BusinessIcon />
								<span>{category}</span>
							</div>
						))}
					</div>
				</Stack>

				{/* Advanced Filter Modal */}
				<Modal
					open={openAdvancedFilter}
					onClose={() => advancedFilterHandler(false)}
					aria-labelledby="advanced-job-filter-modal"
				>
					<Box sx={style}>
						<Box className="advanced-job-filter-modal">
							<div className="modal-header">
								<h2>Find Your Dream Job</h2>
								<CloseIcon className="close-btn" onClick={() => advancedFilterHandler(false)} />
							</div>

							<Divider sx={{ my: 3 }} />

							<div className="modal-content">
								<div className="filter-section">
									<h3>Experience Level</h3>
									<div className="experience-chips">
										{experienceLevels.map((level) => (
											<Chip
												key={level}
												label={level}
												onClick={() => experienceSelectHandler(level)}
												variant={searchFilter?.search?.experienceList?.includes(level) ? 'filled' : 'outlined'}
												className={searchFilter?.search?.experienceList?.includes(level) ? 'selected' : ''}
											/>
										))}
									</div>
								</div>

								<div className="filter-section">
									<h3>Salary Range</h3>
									<div className="salary-range">
										<div className="salary-labels">
											<span>${salaryRange[0].toLocaleString()}</span>
											<span>${salaryRange[1].toLocaleString()}</span>
										</div>
										<Slider
											value={salaryRange}
											onChange={salaryRangeHandler}
											valueLabelDisplay="auto"
											min={0}
											max={300000}
											step={5000}
											valueLabelFormat={(value: any) => `$${value.toLocaleString()}`}
										/>
									</div>
								</div>

								<div className="filter-section">
									<h3>Company Size</h3>
									<FormControl fullWidth>
										<Select value={companySize} onChange={(e) => companySizeHandler(e.target.value)}>
											{companySizes.map((size) => (
												<MenuItem key={size.value} value={size.value}>
													{size.label}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</div>

								<div className="filter-section">
									<h3>Benefits</h3>
									<div className="benefits-grid">
										{benefits.map((benefit) => (
											<Chip
												key={benefit}
												label={benefit}
												onClick={() => benefitToggleHandler(benefit)}
												variant={selectedBenefits.includes(benefit) ? 'filled' : 'outlined'}
												className={selectedBenefits.includes(benefit) ? 'selected' : ''}
											/>
										))}
									</div>
								</div>
							</div>

							<Divider sx={{ my: 3 }} />

							<div className="modal-footer">
								<Button variant="outlined" onClick={resetFilterHandler} startIcon={<CloseIcon />}>
									Reset Filters
								</Button>
								<Button variant="contained" onClick={pushSearchHandler} startIcon={<SearchIcon />}>
									Search Jobs
								</Button>
							</div>
						</Box>
					</Box>
				</Modal>
			</>
		);
	}
};

JobHeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		search: {
			salaryRange: {
				start: 0,
				end: 200000,
			},
		},
	},
};

export default JobHeaderFilter;
