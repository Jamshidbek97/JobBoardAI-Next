import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import TopProperties from '../libs/components/homepage/FeaturedJobs';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import FeaturedJobs from '../libs/components/homepage/FeaturedJobs';
import JobBoardAIHomeHero from '../libs/components/homepage/JobBoardAIHomeHero';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<Stack className={'home-page'}>
			<FeaturedJobs />
			{/* <TrendProperties /> */}
			{/* <PopularProperties /> */}
			{/* <Advertisement /> */}
			{/* <TopProperties /> */}
			{/* <TopAgents /> */}
			<JobBoardAIHomeHero />
			{/* <CommunityBoards /> */}
		</Stack>
	);
};

export default withLayoutMain(Home);
