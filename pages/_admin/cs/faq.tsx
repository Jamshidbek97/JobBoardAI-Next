import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Button, InputAdornment, Stack, Chip, Avatar } from '@mui/material';
import { List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { FaqArticlesPanelList } from '../../../libs/components/admin/cs/FaqList';

const FaqArticles: NextPage = (props: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [activeTab, setActiveTab] = useState('all');
	const [searchCategory, setSearchCategory] = useState('mb_nick');
	const [searchInput, setSearchInput] = useState('');

	// Mock data for demonstration - replace with real data
	const faqStats = {
		all: 24,
		active: 18,
		blocked: 4,
		deleted: 2
	};

	/** HANDLERS **/
	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
		// Add your tab change logic here
	};

	const handleSearch = () => {
		// Add your search logic here
		console.log('Searching for:', searchInput, 'in category:', searchCategory);
	};

	const handleClearSearch = () => {
		setSearchInput('');
		// Add your clear search logic here
	};

	return (
		<Box component={'div'} className={'content'} sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
			{/* Header Section */}
			<Box sx={{ mb: 4 }}>
				<Typography 
					variant={'h3'} 
					sx={{ 
						fontWeight: 700, 
						color: '#1a237e',
						mb: 1,
						display: 'flex',
						alignItems: 'center',
						gap: 2
					}}
				>
					<HelpOutlineIcon sx={{ fontSize: '2rem', color: '#2196f3' }} />
					FAQ Management Dashboard
				</Typography>
				<Typography variant={'body1'} sx={{ color: '#666', fontSize: '1.1rem' }}>
					Manage frequently asked questions and help content for users
				</Typography>
			</Box>

			{/* Stats Cards */}
			<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#2196f3', fontWeight: 700, mb: 1 }}>
						{faqStats.all}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Total FAQs</Typography>
				</Box>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#4caf50', fontWeight: 700, mb: 1 }}>
						{faqStats.active}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Active FAQs</Typography>
				</Box>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#ff9800', fontWeight: 700, mb: 1 }}>
						{faqStats.blocked}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Blocked FAQs</Typography>
				</Box>
				<Box sx={{ 
					bg: 'white', 
					p: 3, 
					borderRadius: 3, 
					boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
					border: '1px solid #e0e0e0',
					textAlign: 'center'
				}}>
					<Typography variant={'h4'} sx={{ color: '#f44336', fontWeight: 700, mb: 1 }}>
						{faqStats.deleted}
					</Typography>
					<Typography variant={'body2'} sx={{ color: '#666' }}>Deleted FAQs</Typography>
				</Box>
			</Box>

			{/* Main Content Card */}
			<Box sx={{ 
				bg: 'white', 
				borderRadius: 4, 
				boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
				overflow: 'hidden',
				border: '1px solid #e0e0e0'
			}}>
				{/* Header with Add Button */}
				<Box sx={{ 
					p: 3, 
					borderBottom: '1px solid #f0f0f0',
					backgroundColor: '#fafafa',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}>
					<Typography variant={'h5'} sx={{ fontWeight: 600, color: '#333' }}>
						FAQ Articles
					</Typography>
					<Button
						className="btn_add"
						variant={'contained'}
						size={'medium'}
						sx={{
							background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
							boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)',
							borderRadius: 2,
							px: 3,
							py: 1.5,
							'&:hover': {
								transform: 'translateY(-2px)',
								boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
							}
						}}
						// onClick={() => router.push(`/_admin/cs/faq_create`)}
					>
						<AddRoundedIcon sx={{ mr: 1 }} />
						Add New FAQ
					</Button>
				</Box>

				{/* Tab Navigation */}
				<Box sx={{ 
					borderBottom: '2px solid #f0f0f0',
					backgroundColor: '#fafafa'
				}}>
					<Box sx={{ display: 'flex', gap: 0 }}>
						{[
							{ value: 'all', label: 'All FAQs', count: faqStats.all, color: '#666' },
							{ value: 'active', label: 'Active', count: faqStats.active, color: '#4caf50' },
							{ value: 'blocked', label: 'Blocked', count: faqStats.blocked, color: '#ff9800' },
							{ value: 'deleted', label: 'Deleted', count: faqStats.deleted, color: '#f44336' }
						].map((tab) => (
							<Box
								key={tab.value}
								onClick={() => handleTabChange(tab.value)}
								sx={{
									flex: 1,
									p: 3,
									cursor: 'pointer',
									borderBottom: activeTab === tab.value ? `3px solid ${tab.color}` : '3px solid transparent',
									backgroundColor: activeTab === tab.value ? 'white' : 'transparent',
									transition: 'all 0.3s ease',
									'&:hover': {
										backgroundColor: activeTab === tab.value ? 'white' : '#f5f5f5'
									}
								}}
							>
								<Typography 
									sx={{ 
										color: activeTab === tab.value ? tab.color : '#666',
										fontWeight: activeTab === tab.value ? 600 : 400,
										textAlign: 'center',
										fontSize: '1rem'
									}}
								>
									{tab.label}
								</Typography>
								<Typography 
									sx={{ 
										color: activeTab === tab.value ? tab.color : '#999',
										textAlign: 'center',
										fontSize: '0.9rem',
										mt: 0.5
									}}
								>
									({tab.count})
								</Typography>
							</Box>
						))}
					</Box>
				</Box>

				{/* Search and Filter Section */}
				<Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
						<Select 
							value={searchCategory}
							onChange={(e) => setSearchCategory(e.target.value)}
							sx={{ 
								minWidth: '160px',
								'& .MuiOutlinedInput-root': {
									borderRadius: 2
								}
							}}
						>
							<MenuItem value={'mb_nick'}>User Nickname</MenuItem>
							<MenuItem value={'mb_id'}>User ID</MenuItem>
							<MenuItem value={'faq_title'}>FAQ Title</MenuItem>
							<MenuItem value={'faq_category'}>FAQ Category</MenuItem>
						</Select>

						<OutlinedInput
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							sx={{ 
								flex: 1, 
								minWidth: '300px',
								'& .MuiOutlinedInput-root': {
									borderRadius: 2,
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: '#2196f3'
									}
								}
							}}
							placeholder={`Search by ${searchCategory === 'mb_nick' ? 'user nickname' : searchCategory === 'mb_id' ? 'user ID' : searchCategory === 'faq_title' ? 'FAQ title' : 'FAQ category'}...`}
							onKeyDown={(event) => {
								if (event.key === 'Enter') handleSearch();
							}}
							endAdornment={
								<>
									{searchInput && (
										<CancelRoundedIcon
											style={{ cursor: 'pointer', color: '#999' }}
											onClick={handleClearSearch}
										/>
									)}
									<InputAdornment position="end" onClick={handleSearch}>
										<img src="/img/icons/search_icon.png" alt={'searchIcon'} style={{ cursor: 'pointer' }} />
									</InputAdornment>
								</>
							}
						/>
					</Box>
				</Box>

				{/* FAQ Table */}
				<Box sx={{ p: 0 }}>
					<FaqArticlesPanelList
						anchorEl={anchorEl}
						// Add your props here
					/>
				</Box>

				{/* Pagination */}
				<Box sx={{ 
					p: 3, 
					borderTop: '1px solid #f0f0f0',
					backgroundColor: '#fafafa',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}>
					<Typography variant={'body2'} sx={{ color: '#666' }}>
						Showing 1-10 of {faqStats.all} FAQs
					</Typography>
					<TablePagination
						rowsPerPageOptions={[10, 20, 50]}
						component="div"
						count={faqStats.all}
						rowsPerPage={10}
						page={0}
						onPageChange={() => {}}
						onRowsPerPageChange={() => {}}
						sx={{
							'& .MuiTablePagination-select': {
								borderRadius: 1
							}
						}}
					/>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(FaqArticles);
