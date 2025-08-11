import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

const MenuProps = { PaperProps: { style: { maxHeight: '200px' } } };

interface FilterType {
	searchFilter: JobInquiry;
	setSearchFilter: (updater: JobInquiry | ((prev: JobInquiry) => JobInquiry)) => void;
	initialInput: JobInquiry;
}

const JobFilter = ({ searchFilter, setSearchFilter, initialInput }: FilterType) => {
	const router = useRouter();
	const [searchText, setSearchText] = useState<string>(searchFilter?.search?.text ?? '');
	const [expanded, setExpanded] = useState<Record<string, boolean>>({
		location: true,
		jobType: true,
		salary: true,
		experience: true,
		education: true,
	});

	// --- helpers ---------------------------------------------------------------
	const pushWithInput = useCallback(
		(input: JobInquiry) =>
			router.push(`/jobs?input=${encodeURIComponent(JSON.stringify(input))}`, undefined, { scroll: false }),
		[router],
	);

	const debouncedApplyText = useMemo(() => {
		let t: any;
		return (value: string) => {
			clearTimeout(t);
			t = setTimeout(() => {
				setSearchFilter((prev) => ({
					...prev,
					page: 1,
					search: { ...prev.search, text: value.trim() || undefined },
				}));
			}, 350);
		};
	}, [setSearchFilter]);

	useEffect(() => {
		debouncedApplyText(searchText);
	}, [searchText, debouncedApplyText]);

	const toggle = (key: keyof typeof expanded) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

	const typeLabel = (t: JobType) =>
		t === JobType.FULL_TIME
			? 'Full-time'
			: t === JobType.PART_TIME
			? 'Part-time'
			: t === JobType.CONTRACT
			? 'Contract'
			: t === JobType.INTERN
			? 'Internship'
			: t;

	const eduLabel = (e: EducationLevel) =>
		e === EducationLevel.HIGH_SCHOOL
			? 'High School'
			: e === EducationLevel.BACHELOR
			? "Bachelor's"
			: e === EducationLevel.MASTER
			? "Master's"
			: e === EducationLevel.DOCTORATE
			? 'PhD'
			: e;

	const marks = useMemo(
		() => [
			{ value: 0, label: '0' },
			{ value: 50000, label: '50K' },
			{ value: 100000, label: '100K' },
			{ value: 150000, label: '150K' },
			{ value: 200000, label: '200K+' },
		],
		[],
	);

	// --- handlers --------------------------------------------------------------
	const handleLocationChange = useCallback(
		(loc: JobLocation) =>
			setSearchFilter((prev) => {
				const list = prev.search.locationList || [];
				const next = list.includes(loc) ? list.filter((l) => l !== loc) : [...list, loc];
				return { ...prev, page: 1, search: { ...prev.search, locationList: next.length ? next : undefined } };
			}),
		[setSearchFilter],
	);

	const handleJobTypeChange = useCallback(
		(type: JobType) =>
			setSearchFilter((prev) => {
				const list = prev.search.typeList || [];
				const next = list.includes(type) ? list.filter((t) => t !== type) : [...list, type];
				return { ...prev, page: 1, search: { ...prev.search, typeList: next.length ? next : undefined } };
			}),
		[setSearchFilter],
	);

	const handleEmploymentLevelChange = useCallback(
		(lvl: EmploymentLevel) =>
			setSearchFilter((prev) => {
				const list = prev.search.employmentLevels || [];
				const next = list.includes(lvl) ? list.filter((x) => x !== lvl) : [...list, lvl];
				return { ...prev, page: 1, search: { ...prev.search, employmentLevels: next } };
			}),
		[setSearchFilter],
	);

	const handleEducationChange = useCallback(
		(lvl: EducationLevel) =>
			setSearchFilter((prev) => {
				const list = prev.search.educationLevelList || [];
				const next = list.includes(lvl) ? list.filter((x) => x !== lvl) : [...list, lvl];
				return { ...prev, page: 1, search: { ...prev.search, educationLevelList: next.length ? next : undefined } };
			}),
		[setSearchFilter],
	);

	const handleRemoteChange = useCallback(
		(remote: boolean) =>
			setSearchFilter((prev) => ({ ...prev, page: 1, search: { ...prev.search, isRemote: remote || undefined } })),
		[setSearchFilter],
	);

	const handleSalaryChange = useCallback(
		(_: Event, value: number | number[]) =>
			setSearchFilter((prev) => {
				const [start, end] = value as number[];
				return { ...prev, page: 1, search: { ...prev.search, salaryRange: { start, end } } };
			}),
		[setSearchFilter],
	);

	const handleExperienceChange = useCallback(
		(e: SelectChangeEvent<number>) =>
			setSearchFilter((prev) => ({
				...prev,
				page: 1,
				search: { ...prev.search, experienceRange: Number(e.target.value) || 0 },
			})),
		[setSearchFilter],
	);

	const refreshHandler = useCallback(() => {
		setSearchText('');
		const reset = { ...initialInput, page: 1 };
		setSearchFilter(reset);
		pushWithInput(reset);
	}, [initialInput, pushWithInput, setSearchFilter]);

	const applyFilters = useCallback(() => {
		pushWithInput({ ...searchFilter, page: 1 });
	}, [pushWithInput, searchFilter]);

	// --- selected chips (quick clear) -----------------------------------------
	const selectedChips = useMemo(() => {
		const chips: { label: string; onDelete: () => void }[] = [];

		(searchFilter.search.locationList || []).forEach((loc) =>
			chips.push({
				label: String(loc),
				onDelete: () =>
					setSearchFilter((prev) => ({
						...prev,
						page: 1,
						search: {
							...prev.search,
							locationList: (prev.search.locationList || []).filter((l) => l !== loc) || undefined,
						},
					})),
			}),
		);

		(searchFilter.search.typeList || []).forEach((t) =>
			chips.push({
				label: typeLabel(t),
				onDelete: () =>
					setSearchFilter((prev) => ({
						...prev,
						page: 1,
						search: { ...prev.search, typeList: (prev.search.typeList || []).filter((x) => x !== t) || undefined },
					})),
			}),
		);

		(searchFilter.search.educationLevelList || []).forEach((e) =>
			chips.push({
				label: eduLabel(e),
				onDelete: () =>
					setSearchFilter((prev) => ({
						...prev,
						page: 1,
						search: {
							...prev.search,
							educationLevelList: (prev.search.educationLevelList || []).filter((x) => x !== e) || undefined,
						},
					})),
			}),
		);

		(searchFilter.search.employmentLevels || []).forEach((lvl) =>
			chips.push({
				label: String(lvl),
				onDelete: () =>
					setSearchFilter((prev) => ({
						...prev,
						page: 1,
						search: {
							...prev.search,
							employmentLevels: (prev.search.employmentLevels || []).filter((x) => x !== lvl),
						},
					})),
			}),
		);

		if (searchFilter.search.isRemote) {
			chips.push({
				label: 'Remote',
				onDelete: () =>
					setSearchFilter((prev) => {
						const { isRemote, ...restSearch } = prev.search;
						return { ...prev, page: 1, search: restSearch };
					}),
			});
		}

		if (searchFilter.search.text) {
			chips.push({
				label: `“${searchFilter.search.text}”`,
				onDelete: () => setSearchFilter((prev) => ({ ...prev, page: 1, search: { ...prev.search, text: undefined } })),
			});
		}

		if (searchFilter.search.salaryRange?.start != null || searchFilter.search.salaryRange?.end != null) {
			const { start = 0, end = 200000 } = searchFilter.search.salaryRange || {};
			chips.push({
				label: `Salary: $${start.toLocaleString()}–$${end.toLocaleString()}`,
				onDelete: () =>
					setSearchFilter((prev) => ({ ...prev, page: 1, search: { ...prev.search, salaryRange: undefined } })),
			});
		}

		if (searchFilter.search.experienceRange) {
			chips.push({
				label: `${searchFilter.search.experienceRange}+ yrs`,
				onDelete: () =>
					setSearchFilter((prev) => ({ ...prev, page: 1, search: { ...prev.search, experienceRange: 0 } })),
			});
		}

		return chips;
	}, [searchFilter, setSearchFilter]);

	// --- render ----------------------------------------------------------------
	return (
		<Stack className="job-filter-container">
			{/* Search */}
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
						onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
						endAdornment={
							searchText && (
								<IconButton size="small" onClick={() => setSearchText('')}>
									<CancelRoundedIcon fontSize="small" />
								</IconButton>
							)
						}
					/>
				</Box>

				{/* Selected chips */}
				{selectedChips.length > 0 && (
					<Box mt={1} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
						{selectedChips.map((c, i) => (
							<Chip key={i} label={c.label} onDelete={c.onDelete} size="small" />
						))}
						<Chip
							label="Clear all"
							onClick={refreshHandler}
							onDelete={refreshHandler as any}
							size="small"
							color="primary"
							variant="outlined"
						/>
					</Box>
				)}
			</Box>

			{/* Location */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggle('location')} role="button" tabIndex={0}>
					<Typography variant="h6" className="section-title">
						Location
					</Typography>
					<span className="toggle-icon">{expanded.location ? '−' : '+'}</span>
				</Box>
				{expanded.location && (
					<Box className="filter-options">
						{Object.values(JobLocation).map((loc) => (
							<Box key={loc} className="filter-option">
								<Checkbox
									checked={(searchFilter.search.locationList || []).includes(loc)}
									onChange={() => handleLocationChange(loc)}
									size="small"
								/>
								<Typography>{loc}</Typography>
							</Box>
						))}
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Job Type */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggle('jobType')} role="button" tabIndex={0}>
					<Typography variant="h6" className="section-title">
						Job Type
					</Typography>
					<span className="toggle-icon">{expanded.jobType ? '−' : '+'}</span>
				</Box>
				{expanded.jobType && (
					<Box className="filter-options">
						{Object.values(JobType).map((t) => (
							<Box key={t} className="filter-option">
								<Checkbox
									checked={(searchFilter.search.typeList || []).includes(t)}
									onChange={() => handleJobTypeChange(t)}
									size="small"
								/>
								<Typography>{typeLabel(t)}</Typography>
							</Box>
						))}
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Salary */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggle('salary')} role="button" tabIndex={0}>
					<Typography variant="h6" className="section-title">
						Salary Range
					</Typography>
					<span className="toggle-icon">{expanded.salary ? '−' : '+'}</span>
				</Box>
				{expanded.salary && (
					<Box className="slider-container">
						<Slider
							value={[searchFilter.search.salaryRange?.start ?? 0, searchFilter.search.salaryRange?.end ?? 200000]}
							onChange={handleSalaryChange}
							valueLabelDisplay="auto"
							min={0}
							max={200000}
							step={10000}
							marks={marks}
							valueLabelFormat={(v: number) => `$${v.toLocaleString()}`}
						/>
						<Box className="salary-range-display">
							<Chip label={`Min: $${(searchFilter.search.salaryRange?.start ?? 0).toLocaleString()}`} size="small" />
							<Chip label={`Max: $${(searchFilter.search.salaryRange?.end ?? 200000).toLocaleString()}`} size="small" />
						</Box>
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Experience */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggle('experience')} role="button" tabIndex={0}>
					<Typography variant="h6" className="section-title">
						Experience Level
					</Typography>
					<span className="toggle-icon">{expanded.experience ? '−' : '+'}</span>
				</Box>
				{expanded.experience && (
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
							{Object.values(EmploymentLevel).map((lvl) => (
								<Box key={lvl} className="filter-option">
									<Checkbox
										checked={(searchFilter.search.employmentLevels || []).includes(lvl)}
										onChange={() => handleEmploymentLevelChange(lvl)}
										size="small"
									/>
									<Typography>{lvl}</Typography>
								</Box>
							))}
						</Box>
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Education */}
			<Box className="filter-section">
				<Box className="section-header" onClick={() => toggle('education')} role="button" tabIndex={0}>
					<Typography variant="h6" className="section-title">
						Education
					</Typography>
					<span className="toggle-icon">{expanded.education ? '−' : '+'}</span>
				</Box>
				{expanded.education && (
					<Box className="filter-options">
						{Object.values(EducationLevel).map((lvl) => (
							<Box key={lvl} className="filter-option">
								<Checkbox
									checked={(searchFilter.search.educationLevelList || []).includes(lvl)}
									onChange={() => handleEducationChange(lvl)}
									size="small"
								/>
								<Typography>{eduLabel(lvl)}</Typography>
							</Box>
						))}
					</Box>
				)}
			</Box>

			<Divider className="section-divider" />

			{/* Remote */}
			<Box className="filter-section">
				<Box className="filter-option">
					<Checkbox
						checked={!!searchFilter.search.isRemote}
						onChange={(e) => handleRemoteChange(e.target.checked)}
						size="small"
					/>
					<Typography>Remote only</Typography>
				</Box>
			</Box>

			{/* Actions */}
			<Box className="action-buttons">
				<Button variant="outlined" fullWidth onClick={refreshHandler} className="reset-btn" startIcon={<RefreshIcon />}>
					Reset Filters
				</Button>
				<Button variant="contained" fullWidth onClick={applyFilters} className="apply-btn">
					Apply Filters
				</Button>
			</Box>
		</Stack>
	);
};

export default JobFilter;
