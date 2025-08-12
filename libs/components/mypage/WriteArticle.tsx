import React from 'react';
import { NextPage } from 'next';
import { 
	Stack, 
	Typography, 
	Box, 
	Container,
	Card,
	CardContent,
	Avatar,
	Chip
} from '@mui/material';
import { 
	Edit as EditIcon,
	Article as ArticleIcon
} from '@mui/icons-material';
import dynamic from 'next/dynamic';

const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	return (
		<Box className="write-article-page" sx={{ 
			minHeight: '100vh',
			background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
			pt: 8,
			pb: 6
		}}>
			<Container maxWidth="xl">
				{/* Header Section */}
				<Box sx={{ mb: 6 }}>
					<Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 3 }}>
						<Avatar 
							sx={{ 
								width: 80, 
								height: 80,
								bgcolor: '#2196F3',
								boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
							}}
						>
							<EditIcon sx={{ fontSize: 40 }} />
						</Avatar>
						<Box>
							<Typography variant="h3" sx={{ 
								fontWeight: 700, 
								color: '#1a1a1a',
								mb: 1
							}}>
								Write an Article
							</Typography>
							<Typography variant="body1" sx={{ 
								color: '#666',
								maxWidth: 600
							}}>
								Share your thoughts, experiences, and insights with the community. Choose a category and start writing!
							</Typography>
						</Box>
					</Stack>

					{/* Info Cards */}
					<Box sx={{ 
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
						gap: 3,
						mb: 4
					}}>
						<Card sx={{ 
							borderRadius: 3,
							boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
						}}>
							<CardContent sx={{ p: 3 }}>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Avatar sx={{ 
										bgcolor: '#4CAF50',
										width: 48,
										height: 48
									}}>
										<ArticleIcon />
									</Avatar>
									<Box>
										<Typography variant="h6" sx={{ fontWeight: 600 }}>
											Free Board
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Express your opinions freely
										</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>

						<Card sx={{ 
							borderRadius: 3,
							boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
						}}>
							<CardContent sx={{ p: 3 }}>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Avatar sx={{ 
										bgcolor: '#FF9800',
										width: 48,
										height: 48
									}}>
										<ArticleIcon />
									</Avatar>
									<Box>
										<Typography variant="h6" sx={{ fontWeight: 600 }}>
											News & Updates
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Share industry news and updates
										</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>

						<Card sx={{ 
							borderRadius: 3,
							boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
						}}>
							<CardContent sx={{ p: 3 }}>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Avatar sx={{ 
										bgcolor: '#E91E63',
										width: 48,
										height: 48
									}}>
										<ArticleIcon />
									</Avatar>
									<Box>
										<Typography variant="h6" sx={{ fontWeight: 600 }}>
											Humor & Fun
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Light-hearted content and jokes
										</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Box>
				</Box>

				{/* Editor Section */}
				<Card sx={{ 
					borderRadius: 3,
					boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
					overflow: 'hidden'
				}}>
					<CardContent sx={{ p: 0 }}>
						<TuiEditor />
					</CardContent>
				</Card>
			</Container>
		</Box>
	);
};

export default WriteArticle;
