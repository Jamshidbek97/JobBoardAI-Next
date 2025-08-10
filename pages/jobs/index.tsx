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
import { useMutation, useQuery } from '@apollo/client';

import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { AllJobsInquiry } from '../../libs/types/job/job.input';
import { Job } from '../../libs/types/job/job';
import { LIKE_TARGET_JOB } from '../../apollo/user/mutation';
import { GET_JOBS } from '../../apollo/user/query';
import JobRow from '../../libs/components/job/JobRow';

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
		switch (e.currentTarget.id) {
			case 'new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.DESC });
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'jobSalary', direction: Direction.ASC });
				setFilterSortName('Lowest Salary');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'jobSalary', direction: Direction.DESC });
				setFilterSortName('Highest Salary');
				break;
		}
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
							<MenuItem
								onClick={sortingHandler}
								id={'new'}
								disableRipple
								sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
							>
								New
							</MenuItem>
							<MenuItem
								onClick={sortingHandler}
								id={'lowest'}
								disableRipple
								sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
							>
								Lowest Price
							</MenuItem>
							<MenuItem
								onClick={sortingHandler}
								id={'highest'}
								disableRipple
								sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
							>
								Highest Price
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
										onLike={(id) => likePropertyHandler({} as any, id)}
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
