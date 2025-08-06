import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { propertySquare, propertyYears } from '../../config';

import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { JobInquiry } from '../../types/property/job.input';
import { JobLocation, JobType } from '../../enums/job.enum';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'background.paper',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: 24,
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

const thisYear = new Date().getFullYear();

interface HeaderFilterProps {
	initialInput: JobInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const { t, i18n } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<JobInquiry>(initialInput);
	const locationRef: any = useRef();
	const typeRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [jobLocation, setJobLocation] = useState<JobLocation[]>(Object.values(JobLocation));
	const [jobType, setJobType] = useState<JobType[]>(Object.values(JobType));
	const [optionCheck, setOptionCheck] = useState('all');
	const [experienceYears, setExperienceYears] = useState<number | ''>(0);

	/** LIFECYCLE **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target)) {
				setOpenLocation(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
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
		setOpenType(false);
		setOpenAdvancedFilter(status);
	};

	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenType(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
	};

	const disableAllStateHandler = () => {
		setOpenType(false);
		setOpenLocation(false);
	};

	const jobLocationSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						locationList: [value],
					},
				});
				locationStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, propertyLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const jobTypeSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						typeList: [value],
					},
				});
				typeStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, propertyTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const salaryRangeSelectHandler = useCallback(
		async (value: { start: number; end: number }) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						salaryRange: {
							start: value.start,
							end: value.end,
						},
					},
				});

				typeStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, salaryRangeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const jobOptionSelectHandler = useCallback(
		async (e: any) => {
			try {
				const value = e.target.value;
				setOptionCheck(value);

				if (value !== 'all') {
					setSearchFilter({
						...searchFilter,
						search: {
							...searchFilter.search,
							options: [value], // Set the selected job option (e.g., full-time, part-time)
						},
					});
				} else {
					delete searchFilter.search.options;
					setSearchFilter({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					});
				}
			} catch (err: any) {
				console.log('ERROR, jobOptionSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const experienceChangeHandler = (event: React.ChangeEvent<{ value: unknown }>) => {
		const years = event.target.value as number;
		setExperienceYears(years);
	};

	const resetFilterHandler = () => {
		setSearchFilter(initialInput);
		setOptionCheck('all');
	};

	const pushSearchHandler = async () => {
		try {
			// Filter out empty or undefined values
			const updatedSearch = { ...searchFilter.search };

			if (!updatedSearch.locationList?.length) {
				delete updatedSearch.locationList;
			}

			if (!updatedSearch.typeList?.length) {
				delete updatedSearch.typeList;
			}

			if (!updatedSearch.options?.length) {
				delete updatedSearch.options;
			}

			if (updatedSearch.experienceRange === 0) {
				delete updatedSearch.experienceRange;
			}

			if (!updatedSearch.skillsRequired?.length) {
				delete updatedSearch.skillsRequired;
			}

			setSearchFilter((prev) => ({
				...prev,
				search: updatedSearch,
			}));

			await router.push(`/property?input=${JSON.stringify(searchFilter)}`);
		} catch (err) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};
	return (
		<>
			<Stack className={'search-box'}>
				<Stack className={'select-box'}>
					<Box component={'div'} className={`box ${openLocation ? 'on' : ''}`} onClick={locationStateChangeHandler}>
						<span>{searchFilter?.search?.locationList ? searchFilter?.search?.locationList[0] : t('Location')} </span>
						<ExpandMoreIcon />
					</Box>
					<Box className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler}>
						<span> {searchFilter?.search?.typeList ? searchFilter?.search?.typeList[0] : t('Property type')} </span>
						<ExpandMoreIcon />
					</Box>
					<Box className={`box ${openLocation ? 'on' : ''}`} onClick={salaryRangeSelectHandler}>
						<span>
							{searchFilter?.search?.salaryRange
								? `${searchFilter.search.salaryRange.start} - ${searchFilter.search.salaryRange.end} USD`
								: t('Salary Range')}
						</span>
						<ExpandMoreIcon />
					</Box>
				</Stack>
				<Stack className={'search-box-other'}>
					<Box className={'advanced-filter'} onClick={() => advancedFilterHandler(true)}>
						<img src="/img/icons/tune.svg" alt="" />
						<span>{t('Advanced')}</span>
					</Box>
					<Box className={'search-btn'} onClick={pushSearchHandler}>
						<img src="/img/icons/search_white.svg" alt="" />
					</Box>
				</Stack>

				{/*MENU */}
				<div className={`filter-location ${openLocation ? 'on' : ''}`} ref={locationRef}>
					{jobLocation.map((location: string) => {
						return (
							<div onClick={() => jobLocationSelectHandler(location)} key={location}>
								<img src={`img/banner/cities/${location}.webp`} alt="" />
								<span>{location}</span>
							</div>
						);
					})}
				</div>

				<div className={`filter-type ${openType ? 'on' : ''}`} ref={typeRef}>
					{jobType.map((type: string) => {
						return (
							<div
								style={{ backgroundImage: `url(/img/banner/types/${type.toLowerCase()}.webp)` }}
								onClick={() => jobTypeSelectHandler(type)}
								key={type}
							>
								<span>{type}</span>
							</div>
						);
					})}
				</div>

				<div className={`filter-experience-range ${openLocation ? 'on' : ''}`} ref={locationRef}>
					{[1, 2, 3, 4, 5].map((experience: number) => {
						return (
							<span
								// onClick={() => experienceRangeSelectHandler({ start: experience, end: experience + 1 })}
								key={experience}
							>
								{experience} - {experience + 1} years
							</span>
						);
					})}
				</div>
			</Stack>

			{/* ADVANCED FILTER MODAL */}
			<Modal
				open={openAdvancedFilter}
				onClose={() => advancedFilterHandler(false)}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				{/* @ts-ignore */}
				<Box sx={style}>
					<Box className={'advanced-filter-modal'}>
						<div className={'close'} onClick={() => advancedFilterHandler(false)}>
							<CloseIcon />
						</div>
						<div className={'top'}>
							<span>Find your home</span>
							<div className={'search-input-box'}>
								<img src="/img/icons/search.svg" alt="" />
								<input
									value={searchFilter?.search?.text ?? ''}
									type="text"
									placeholder={'What are you looking for?'}
									onChange={(e: any) => {
										setSearchFilter({
											...searchFilter,
											search: { ...searchFilter.search, text: e.target.value },
										});
									}}
								/>
							</div>
						</div>
						<Divider sx={{ mt: '30px', mb: '35px' }} />
						<div className={'middle'}>
							<div className={'row-box'}>
								<div className={'box'}>
									<span>skills</span>
									<div className={'inside'}>
										<div
											className={`skills ${!searchFilter?.search?.skillsRequired?.length ? 'active' : ''}`}
											onClick={() => jobOptionSelectHandler({ target: { value: 'any' } })}
										>
											Any
										</div>
										{['JavaScript', 'React', 'Node.js', 'Python'].map((skill: string) => (
											<div
												className={`skills ${searchFilter?.search?.skillsRequired?.includes(skill) ? 'active' : ''}`}
												onClick={() => jobOptionSelectHandler({ target: { value: skill } })}
												key={skill}
											>
												{skill}
											</div>
										))}
									</div>
								</div>
								<div className={'box'}>
									<span>options</span>
									<div className={'inside'}>
										<FormControl>
											<Select
												value={optionCheck}
												onChange={jobOptionSelectHandler}
												displayEmpty
												inputProps={{ 'aria-label': 'Without label' }}
											>
												<MenuItem value={'all'}>All Options</MenuItem>
												<MenuItem value={'propertyBarter'}>Barter</MenuItem>
												<MenuItem value={'propertyRent'}>Rent</MenuItem>
											</Select>
										</FormControl>
									</div>
								</div>
							</div>
							<div className={'row-box'} style={{ marginTop: '44px' }}>
								<div className={'box'}>
									<span>Year Built</span>
									<div className={'inside space-between align-center'}>
										<FormControl sx={{ width: '122px' }}>
											<Select
												value={experienceYears.toString()}
												// onChange={experienceChangeHandler}
												displayEmpty
												inputProps={{ 'aria-label': 'Experience in Years' }}
												MenuProps={MenuProps}
											>
												{[1, 2, 3, 4, 5].map((years) => (
													<MenuItem value={years} key={years}>
														{years} {years > 1 ? 'years' : 'year'}
													</MenuItem>
												))}
											</Select>
										</FormControl>
										<div className={'minus-line'}></div>
										<FormControl sx={{ width: '122px' }}>
											<Select displayEmpty inputProps={{ 'aria-label': 'Without label' }} MenuProps={MenuProps}>
												{propertyYears
													?.slice(0)
													.reverse()
													.map((year: number) => (
														<MenuItem>year</MenuItem>
													))}
											</Select>
										</FormControl>
									</div>
								</div>
								<div className={'box'}>
									<span>square meter</span>
									<div className={'inside space-between align-center'}>
										<FormControl sx={{ width: '122px' }}>
											<Select
												// value={searchFilter?.search?.squaresRange?.start}
												// onChange={(e: any) => propertySquareHandler(e, 'start')}
												displayEmpty
												inputProps={{ 'aria-label': 'Without label' }}
												MenuProps={MenuProps}
											>
												{propertySquare.map((square: number) => (
													<MenuItem
														value={square}
														// disabled={(searchFilter?.search?.squaresRange?.end || 0) < square}
														key={square}
													>
														{square}
													</MenuItem>
												))}
											</Select>
										</FormControl>
										<div className={'minus-line'}></div>
										<FormControl sx={{ width: '122px' }}>
											<Select
												// value={searchFilter?.search?.squaresRange?.end}
												// onChange={(e: any) => propertySquareHandler(e, 'end')}
												displayEmpty
												inputProps={{ 'aria-label': 'Without label' }}
												MenuProps={MenuProps}
											>
												{propertySquare.map((square: number) => (
													<MenuItem
														value={square}
														// disabled={(searchFilter?.search?.squaresRange?.start || 0) > square}
														key={square}
													>
														{square}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</div>
								</div>
							</div>
						</div>
						<Divider sx={{ mt: '60px', mb: '18px' }} />
						<div className={'bottom'}>
							<div onClick={resetFilterHandler}>
								<img src="/img/icons/reset.svg" alt="" />
								<span>Reset all filters</span>
							</div>
							<Button
								startIcon={<img src={'/img/icons/search.svg'} />}
								className={'search-btn'}
								onClick={pushSearchHandler}
							>
								Search
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
		limit: 9,
		search: {
			salaryRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default HeaderFilter;
