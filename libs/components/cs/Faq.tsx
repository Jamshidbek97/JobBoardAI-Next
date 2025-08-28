import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography, Chip } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);
const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const Faq = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [category, setCategory] = useState<string>('jobs');
	const [expanded, setExpanded] = useState<string | false>('panel1');

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	
	/** HANDLERS **/
	const changeCategoryHandler = (category: string) => {
		setCategory(category);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	const categories = [
		{ key: 'jobs', label: 'Available Jobs', color: '#10b981' },
		{ key: 'application', label: 'Application Process', color: '#3b82f6' },
		{ key: 'companies', label: 'Companies', color: '#8b5cf6' },
		{ key: 'membership', label: 'Membership', color: '#f59e0b' },
		{ key: 'community', label: 'Community', color: '#ef4444' },
		{ key: 'other', label: 'Other', color: '#6b7280' },
	];

	const data: any = {
		jobs: [
			{
				id: '00f5a45ed8897f8090116a01',
				subject: 'Are the job listings on the site reliable and up-to-date?',
				content: 'Yes, we only display verified job postings from legitimate companies. All listings are regularly updated and monitored for accuracy.',
			},
			{
				id: '00f5a45ed8897f8090116a22',
				subject: 'What types of jobs do you offer?',
				content: 'We offer a wide range of job opportunities including full-time, part-time, contract, remote, and freelance positions across various industries.',
			},
			{
				id: '00f5a45ed8897f8090116a21',
				subject: 'How can I search for jobs on your website?',
				content: 'Simply use our search bar to enter keywords, location, job type, or company name. You can also use our advanced filters to narrow down your search.',
			},
			{
				id: '00f5a45ed8897f8090116a23',
				subject: 'Do you provide assistance for job seekers?',
				content: 'Yes, we offer career guidance, resume tips, and interview preparation resources to help you succeed in your job search.',
			},
			{
				id: '00f5a45ed8897f8090116a24',
				subject: 'What should I consider when applying for a job?',
				content: 'Consider the job requirements, company culture, location, salary, benefits, and growth opportunities before applying.',
			},
			{
				id: '00f5a45ed8897f8090116a25',
				subject: 'How long does the job application process typically take?',
				content: 'The application process varies by company, but typically takes 1-4 weeks from application to offer.',
			},
		],
		application: [
			{
				id: '00f5a45ed8897f8090116a02',
				subject: 'How do I apply for a job?',
				content: 'Click the "Apply Now" button on any job listing. You can apply directly through our platform or be redirected to the company\'s application system.',
			},
			{
				id: '00f5a45ed8897f8090116a91',
				subject: 'Is there a fee to apply for jobs?',
				content: 'No, job applications are completely free for job seekers. Companies pay fees for posting job listings.',
			},
			{
				id: '00f5a45ed8897f8090116a92',
				subject: 'Can I save job applications for later?',
				content: 'Yes, you can save job listings to your favorites and apply later. You can also track your application status.',
			},
			{
				id: '00f5a45ed8897f8090116a93',
				subject: 'How do I know if my application was received?',
				content: 'You will receive an email confirmation when your application is submitted successfully.',
			},
			{
				id: '00f5a45ed8897f8090116a94',
				subject: 'Can I apply to multiple jobs at the same company?',
				content: 'Yes, you can apply to multiple positions at the same company if you meet the qualifications for each role.',
			},
		],
		companies: [
			{
				id: '00f5a45ed8897f8090116a03',
				subject: 'How do I know if a company is legitimate?',
				content: 'We verify all companies before allowing them to post jobs. You can also research companies through their profiles and reviews.',
			},
			{
				id: '00f5a45ed8897f8090116a95',
				subject: 'Can I see company reviews and ratings?',
				content: 'Yes, we provide company reviews and ratings from current and former employees to help you make informed decisions.',
			},
			{
				id: '00f5a45ed8897f8090116a96',
				subject: 'How do companies post job listings?',
				content: 'Companies can create an account and post job listings through our employer portal. All listings are reviewed before going live.',
			},
			{
				id: '00f5a45ed8897f8090116a97',
				subject: 'What information do companies provide about themselves?',
				content: 'Companies provide information about their mission, culture, benefits, location, and other relevant details.',
			},
		],
		membership: [
			{
				id: '00f5a45ed8897f8090116a04',
				subject: 'Do I need to create an account to apply for jobs?',
				content: 'While you can browse jobs without an account, creating a free account allows you to save jobs, track applications, and receive job alerts.',
			},
			{
				id: '00f5a45ed8897f8090116a98',
				subject: 'Are there premium membership options?',
				content: 'Yes, we offer premium memberships with additional features like priority application status, advanced search filters, and career coaching.',
			},
			{
				id: '00f5a45ed8897f8090116a99',
				subject: 'How do I update my profile information?',
				content: 'You can update your profile, resume, and preferences anytime through your account dashboard.',
			},
		],
		community: [
			{
				id: '00f5a45ed8897f8090116a05',
				subject: 'What should I do if there is abusive or criminal behavior in the community section?',
				content: 'Please report any inappropriate behavior immediately through our reporting system. We take all reports seriously and will investigate promptly.',
			},
			{
				id: '00f5a45ed8897f8090116a100',
				subject: 'Can I connect with other job seekers?',
				content: 'Yes, our community features allow you to connect with other professionals, share experiences, and network.',
			},
			{
				id: '00f5a45ed8897f8090116a101',
				subject: 'Are there community guidelines I should follow?',
				content: 'Yes, we have community guidelines to ensure a respectful and professional environment for all users.',
			},
		],
		other: [
			{
				id: '00f5a45ed8897f8090116a06',
				subject: 'How do I contact customer support?',
				content: 'You can contact our support team through email, phone, or live chat. We typically respond within 24 hours.',
			},
			{
				id: '00f5a45ed8897f8090116a102',
				subject: 'Can I suggest new features for the platform?',
				content: 'Yes, we welcome feedback and suggestions. You can submit your ideas through our feedback form.',
			},
			{
				id: '00f5a45ed8897f8090116a103',
				subject: 'Is my personal information secure?',
				content: 'Yes, we use industry-standard security measures to protect your personal information and ensure your privacy.',
			},
		],
	};

	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	} else {
		return (
			<Stack className={'faq-content'}>
				<Box className={'categories'} component={'div'}>
					{categories.map((cat) => (
						<Chip
							key={cat.key}
							label={cat.label}
							onClick={() => changeCategoryHandler(cat.key)}
							className={`category-chip ${category === cat.key ? 'active' : ''}`}
							style={{
								backgroundColor: category === cat.key ? cat.color : 'white',
								color: category === cat.key ? 'white' : '#64748b',
								border: `2px solid ${category === cat.key ? cat.color : '#e2e8f0'}`,
								cursor: 'pointer',
								fontWeight: category === cat.key ? 600 : 500,
								transition: 'all 0.3s ease',
								'&:hover': {
									borderColor: cat.color,
									backgroundColor: category === cat.key ? cat.color : `${cat.color}10`,
								}
							}}
						/>
					))}
				</Box>
				<Box className={'wrap'} component={'div'}>
					{data[category] &&
						data[category].map((ele: any) => (
							<Accordion expanded={expanded === ele?.id} onChange={handleChange(ele?.id)} key={ele?.subject}>
								<AccordionSummary id="panel1d-header" className="question" aria-controls="panel1d-content">
									<Typography className="badge" variant={'h4'}>
										Q
									</Typography>
									<Typography> {ele?.subject}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Stack className={'answer flex-box'}>
										<Typography className="badge" variant={'h4'} color={'primary'}>
											A
										</Typography>
										<Typography> {ele?.content}</Typography>
									</Stack>
								</AccordionDetails>
							</Accordion>
						))}
				</Box>
			</Stack>
		);
	}
};

export default Faq;
