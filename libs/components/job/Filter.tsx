import React, { useState, useCallback } from 'react';
import { SelectChangeEvent } from '@mui/material';
import {
	Stack,
	Typography,
	Checkbox,
	Button,
	OutlinedInput,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Tooltip,
	IconButton,
	Divider,
	Box,
	Slider,
	Chip,
} from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import { JobLocation, JobType, EducationLevel, EmploymentLevel } from '../../enums/job.enum';
import { useRouter } from 'next/router';
import { JobInquiry } from '../../types/job/job.input';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface FilterType {
	searchFilter: JobInquiry;
	setSearchFilter: (filter: JobInquiry) => void;
	initialInput: JobInquiry;
}

const JobFilter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const router = useRouter();
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
		location: true,
		jobType: true,
		salary: true,
		experience: true,
		education: true,
	});

	/** LIFECYCLE **/
	// useEffect(() => {
	// 	if (searchFilter?.search?.locationList?.length == 0) {
	// 		delete searchFilter.search.locationList;
	// 		setShowMore(false);
	// 		router
	// 			.push(
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				{ scroll: false },
	// 			)
	// 			.then();
	// 	}

	// 	if (searchFilter?.search?.typeList?.length == 0) {
	// 		delete searchFilter.search.typeList;
	// 		router
	// 			.push(
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				{ scroll: false },
	// 			)
	// 			.then();
	// 	}

	// 	if (searchFilter?.search?.roomsList?.length == 0) {
	// 		delete searchFilter.search.roomsList;
	// 		router
	// 			.push(
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				{ scroll: false },
	// 			)
	// 			.then();
	// 	}

	// 	if (searchFilter?.search?.options?.length == 0) {
	// 		delete searchFilter.search.options;
	// 		router
	// 			.push(
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				{ scroll: false },
	// 			)
	// 			.then();
	// 	}

	// 	if (searchFilter?.search?.bedsList?.length == 0) {
	// 		delete searchFilter.search.bedsList;
	// 		router
	// 			.push(
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				`/property?input=${JSON.stringify({
	// 					...searchFilter,
	// 					search: {
	// 						...searchFilter.search,
	// 					},
	// 				})}`,
	// 				{ scroll: false },
	// 			)
	// 			.then();
	// 	}

	// 	if (searchFilter?.search?.locationList) setShowMore(true);
	// }, [searchFilter]);

	/** HANDLERS **/
	const handleSearch = useCallback(() => {
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, text: searchText },
		});
	}, [searchFilter, searchText, setSearchFilter]);

	const handleLocationChange = useCallback(
		(location: JobLocation) => {
			const currentList = searchFilter.search.locationList || [];
			const newList = currentList.includes(location)
				? currentList.filter((l) => l !== location)
				: [...currentList, location];

			setSearchFilter({
				...searchFilter,
				search: { ...searchFilter.search, locationList: newList },
			});
		},
		[searchFilter, setSearchFilter],
	);

	const handleJobTypeChange = useCallback(
		(type: JobType) => {
			const currentList = searchFilter.search.typeList || [];
			const newList = currentList.includes(type) ? currentList.filter((t) => t !== type) : [...currentList, type];

			setSearchFilter({
				...searchFilter,
				search: { ...searchFilter.search, typeList: newList },
			});
		},
		[searchFilter, setSearchFilter],
	);

	const handleEmploymentLevelChange = useCallback(
		(level: EmploymentLevel) => {
			const currentList = searchFilter.search.employmentLevels || [];
			const newList = currentList.includes(level) ? currentList.filter((l) => l !== level) : [...currentList, level];

			setSearchFilter({
				...searchFilter,
				search: { ...searchFilter.search, employmentLevels: newList },
			});
		},
		[searchFilter, setSearchFilter],
	);

	const handleEducationChange = useCallback(
		(level: EducationLevel) => {
			const currentList = searchFilter.search.educationLevelList || [];
			const newList = currentList.includes(level) ? currentList.filter((l) => l !== level) : [...currentList, level];

			setSearchFilter({
				...searchFilter,
				search: { ...searchFilter.search, educationLevelList: newList },
			});
		},
		[searchFilter, setSearchFilter],
	);

	const handleRemoteChange = useCallback(
		(remote: boolean) => {
			setSearchFilter({
				...searchFilter,
				search: { ...searchFilter.search, isRemote: remote },
			});
		},
		[searchFilter, setSearchFilter],
	);

	const handleSalaryChange = useCallback(
		(event: Event, newValue: number | number[]) => {
			const [min, max] = newValue as number[];
			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					salaryRange: { start: min, end: max },
				},
			});
		},
		[searchFilter, setSearchFilter],
	);

	const handleExperienceChange = useCallback(
		(event: SelectChangeEvent<number>) => {
			const value = Number(event.target.value) || 0;
			setSearchFilter({
				...searchFilter,
				search: { ...searchFilter.search, experienceRange: value },
			});
		},
		[searchFilter, setSearchFilter],
	);

	const refreshHandler = useCallback(() => {
		setSearchText('');
		setSearchFilter(initialInput);
	}, [initialInput, setSearchFilter]);

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	const salaryMarks = [
		{ value: 0, label: '0' },
		{ value: 50000, label: '50K' },
		{ value: 100000, label: '100K' },
		{ value: 150000, label: '150K' },
		{ value: 200000, label: '200K+' },
	];

	return (
		<Stack className="job-filter-container">
			{/* Search Section */}
			<Box className="filter-section">
				<Typography variant="h6" className="section-title">
					Find Your Dream Job
				</Typography>

				<Box className="search-box">
					<OutlinedInput
						fullWidth
						value={searchText}
						type="text"
						placeholder="Job title, company, or keywords"
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						endAdornment={
							searchText && (
								<IconButton size="small" onClick={() => setSearchText('')}>
									<CancelRoundedIcon fontSize="small" />
								</IconButton>
							)
						}
					/>
					{/* <Button variant="contained" className="search-button" onClick={handleSearch}>
						Search
					</Button> */}
				</Box>
			</Box>

			{/* Location Filter */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggleSection('location')}>
					<Typography variant="h6" className="section-title">
						Location
					</Typography>
					<span className="toggle-icon">{expandedSections.location ? '−' : '+'}</span>
				</Box>

				{expandedSections.location && (
					<Box className="filter-options">
						{Object.values(JobLocation).map((location) => (
							<Box key={location} className="filter-option">
								<Checkbox
									checked={(searchFilter.search.locationList || []).includes(location)}
									onChange={() => handleLocationChange(location)}
									size="small"
								/>
								<Typography>{location}</Typography>
							</Box>
						))}
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Job Type Filter */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggleSection('jobType')}>
					<Typography variant="h6" className="section-title">
						Job Type
					</Typography>
					<span className="toggle-icon">{expandedSections.jobType ? '−' : '+'}</span>
				</Box>

				{expandedSections.jobType && (
					<Box className="filter-options">
						{Object.values(JobType).map((type) => (
							<Box key={type} className="filter-option">
								<Checkbox
									checked={(searchFilter.search.typeList || []).includes(type)}
									onChange={() => handleJobTypeChange(type)}
									size="small"
								/>
								<Typography>
									{type === JobType.FULL_TIME
										? 'Full-time'
										: type === JobType.PART_TIME
										? 'Part-time'
										: type === JobType.CONTRACT
										? 'Contact'
										: type === JobType.INTERN
										? 'Internship'
										: type}
								</Typography>
							</Box>
						))}
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Salary Range */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggleSection('salary')}>
					<Typography variant="h6" className="section-title">
						Salary Range
					</Typography>
					<span className="toggle-icon">{expandedSections.salary ? '−' : '+'}</span>
				</Box>

				{expandedSections.salary && (
					<Box className="slider-container">
						<Slider
							value={[searchFilter.search.salaryRange?.start || 0, searchFilter.search.salaryRange?.end || 200000]}
							onChange={handleSalaryChange}
							valueLabelDisplay="auto"
							min={0}
							max={200000}
							step={10000}
							marks={salaryMarks}
							valueLabelFormat={(value: any) => `$${value.toLocaleString()}`}
						/>
						<Box className="salary-range-display">
							<Chip label={`Min: $${(searchFilter.search.salaryRange?.start || 0).toLocaleString()}`} size="small" />
							<Chip label={`Max: $${(searchFilter.search.salaryRange?.end || 200000).toLocaleString()}`} size="small" />
						</Box>
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Experience Level */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggleSection('experience')}>
					<Typography variant="h6" className="section-title">
						Experience Level
					</Typography>
					<span className="toggle-icon">{expandedSections.experience ? '−' : '+'}</span>
				</Box>

				{expandedSections.experience && (
					<Box className="filter-options">
						<FormControl fullWidth>
							<InputLabel>Minimum Experience</InputLabel>
							<Select
								value={searchFilter.search.experienceRange || 0}
								onChange={handleExperienceChange}
								label="Minimum Experience"
								MenuProps={MenuProps}
							>
								<MenuItem value={0}>Any experience</MenuItem>
								<MenuItem value={1}>1+ years</MenuItem>
								<MenuItem value={2}>2+ years</MenuItem>
								<MenuItem value={3}>3+ years</MenuItem>
								<MenuItem value={5}>5+ years</MenuItem>
								<MenuItem value={10}>10+ years</MenuItem>
							</Select>
						</FormControl>

						<Box className="filter-options">
							{Object.values(EmploymentLevel).map((level) => (
								<Box key={level} className="filter-option">
									<Checkbox
										checked={(searchFilter.search.employmentLevels || []).includes(level)}
										onChange={() => handleEmploymentLevelChange(level)}
										size="small"
									/>
									<Typography>{level}</Typography>
								</Box>
							))}
						</Box>
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Education Level */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggleSection('education')}>
					<Typography variant="h6" className="section-title">
						Education
					</Typography>
					<span className="toggle-icon">{expandedSections.education ? '−' : '+'}</span>
				</Box>

				{expandedSections.education && (
					<Box className="filter-options">
						{Object.values(EducationLevel).map((level) => (
							<Box key={level} className="filter-option">
								<Checkbox
									checked={(searchFilter.search.educationLevelList || []).includes(level)}
									onChange={() => handleEducationChange(level)}
									size="small"
								/>
								<Typography>
									{level === EducationLevel.HIGH_SCHOOL
										? 'High School'
										: level === EducationLevel.BACHELOR
										? "Bachelor's"
										: level === EducationLevel.MASTER
										? "Master's"
										: level === EducationLevel.DOCTORATE
										? 'PhD'
										: level}
								</Typography>
							</Box>
						))}
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Remote Work */}
			<Box className="filter-section">
				<Box className="filter-option">
					<Checkbox
						checked={searchFilter.search.isRemote || false}
						onChange={(e) => handleRemoteChange(e.target.checked)}
						size="small"
					/>
					<Typography>Remote only</Typography>
				</Box>
			</Box>

			{/* Action Buttons */}
			<Box className="action-buttons">
				<Button variant="outlined" fullWidth onClick={refreshHandler} className="reset-btn">
					Reset Filters
				</Button>
				<Button variant="contained" fullWidth onClick={() => router.push('/jobs')} className="apply-btn">
					Apply Filters
				</Button>
			</Box>
		</Stack>
	);
};

export default JobFilter;
