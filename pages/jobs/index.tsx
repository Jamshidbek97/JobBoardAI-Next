import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/job/Filter';
import { useRouter } from 'next/router';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';

import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { AllJobsInquiry } from '../../libs/types/job/job.input';
import { Job } from '../../libs/types/job/job';
import { LIKE_TARGET_JOB } from '../../apollo/user/mutation';
import { GET_JOBS } from '../../apollo/user/query';
import JobRow from '../../libs/components/job/JobRow';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const JobList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<AllJobsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [properties, setProperties] = useState<Job[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [likeTargetJob] = useMutation(LIKE_TARGET_JOB);
	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_JOBS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data?.getJobs?.list);
			setTotal(data?.getJobs?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLE **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {}, [searchFilter]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/jobs?input=${JSON.stringify(searchFilter)}`, `/jobs?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetJob({ variables: { input: id } });
			await getPropertiesRefetch({ input: searchFilter });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, LikeTargetProperty', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		const id = e.currentTarget.id as 'new' | 'lowest' | 'highest' | 'likes' | 'views' | 'rank' | 'updated';

		const map = {
			new: { sort: 'createdAt' as const, direction: Direction.DESC, label: 'New' },
			updated: { sort: 'updatedAt' as const, direction: Direction.DESC, label: 'Recently Updated' },
			lowest: { sort: 'salaryRange' as const, direction: Direction.ASC, label: 'Lowest Salary' },
			highest: { sort: 'salaryRange' as const, direction: Direction.DESC, label: 'Highest Salary' },
			likes: { sort: 'jobLikes' as const, direction: Direction.DESC, label: 'Most Liked' },
			views: { sort: 'jobViews' as const, direction: Direction.DESC, label: 'Most Viewed' },
			rank: { sort: 'jobRank' as const, direction: Direction.DESC, label: 'Top Rank' },
		};

		const cfg = map[id] ?? map.new;

		setSearchFilter((prev) => ({ ...prev, page: 1, sort: cfg.sort, direction: cfg.direction }));
		setFilterSortName(cfg.label);
		setSortingOpen(false);
		setAnchorEl(null);
	};

	return (
		<div id="property-list-page" style={{ position: 'relative' }}>
			<div className="container">
				<Box component={'div'} className={'right'}>
					<span>Sort by</span>
					<div>
						<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
							{filterSortName}
						</Button>
						<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
							<MenuItem id="new" onClick={sortingHandler} disableRipple>
								New
							</MenuItem>
							<MenuItem id="updated" onClick={sortingHandler} disableRipple>
								Recently Updated
							</MenuItem>
							<MenuItem id="lowest" onClick={sortingHandler} disableRipple>
								Lowest Salary
							</MenuItem>
							<MenuItem id="highest" onClick={sortingHandler} disableRipple>
								Highest Salary
							</MenuItem>
							<MenuItem id="likes" onClick={sortingHandler} disableRipple>
								Most Liked
							</MenuItem>
							<MenuItem id="views" onClick={sortingHandler} disableRipple>
								Most Viewed
							</MenuItem>
							<MenuItem id="rank" onClick={sortingHandler} disableRipple>
								Top Rank
							</MenuItem>
						</Menu>
					</div>
				</Box>
				<Stack className={'property-page'}>
					<Stack className={'filter-config'}>
						{/* @ts-ignore */}
						<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
					</Stack>
					<div className="list-list">
						<Stack className={'list-config'}>
							{properties?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No jobs found!</p>
								</div>
							) : (
								properties.map((job: Job) => (
									<JobRow
										key={job._id}
										job={job}
										likePropertyHandler={likePropertyHandler}
										onApply={(id) => router.push(`/job/${id}#apply`)}
									/>
								))
							)}
						</Stack>
						{properties.length > 0 && (
							<Stack className="pagination-config" mt={2}>
								<Stack className="pagination-box">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / searchFilter.limit)}
										onChange={handlePaginationChange}
										shape="circular"
										color="primary"
									/>
								</Stack>

								<Stack className="total-result">
									<Typography>
										Total {total} job{total > 1 ? 's' : ''} available
									</Typography>
								</Stack>
							</Stack>
						)}
					</div>
				</Stack>
			</div>
		</div>
	);
};

JobList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(JobList);
