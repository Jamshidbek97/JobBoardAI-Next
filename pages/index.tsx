import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import PopularProperties from '../libs/components/homepage/PopularProperties';
import TopAgents from '../libs/components/homepage/TopAgents';
import Events from '../libs/components/homepage/Events';
import TrendProperties from '../libs/components/homepage/TrendProperties';
import TopProperties from '../libs/components/homepage/FeaturedJobs';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import FeaturedJobs from '../libs/components/homepage/FeaturedJobs';

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
			<Events />
			{/* <CommunityBoards /> */}
		</Stack>
	);
};

export default withLayoutMain(Home);
