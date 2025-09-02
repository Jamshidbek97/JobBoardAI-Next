import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/favicon.png" />

				{/* SEO */}
				<meta name="keyword" content={'JobBoardAI, JobBoardAI.uz, jobs, careers, employment, hiring, recruitment, devex mern, mern nestjs fullstack'} />
				<meta
					name={'description'}
					content={
						'Find your dream job or hire the best talent anywhere anytime. Best Jobs and Career Opportunities on JobBoardAI.uz | ' +
						'Найдите работу своей мечты или наймите лучших специалистов в любое время в любом месте. Лучшие вакансии и карьерные возможности на JobBoardAI.uz | ' +
						'꿈의 직장을 찾거나 최고의 인재를 언제 어디서나 채용하세요. JobBoardAI.uz에서 최고의 일자리와 경력 기회를 만나보세요'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
