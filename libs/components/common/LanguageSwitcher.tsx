import React, { useState } from 'react';
import {
	IconButton,
	Menu,
	MenuItem,
	Typography,
	Box,
	Stack,
} from '@mui/material';
import {
	Language as LanguageIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const languages = [
	{ code: 'en', name: 'English', flag: '🇺🇸' },
	{ code: 'kr', name: '한국어', flag: '🇰🇷' },
	{ code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

const LanguageSwitcher: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const currentLocale = router.locale || 'en';

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLanguageChange = (locale: string) => {
		handleClose();
		router.push(router.asPath, router.asPath, { locale });
	};

	const currentLanguage = languages.find(lang => lang.code === currentLocale);

	return (
		<>
			<IconButton
				color="inherit"
				onClick={handleClick}
				sx={{ 
					position: 'relative',
					'&:hover': {
						backgroundColor: 'rgba(255, 255, 255, 0.1)',
					},
				}}
			>
				<Stack direction="row" spacing={1} alignItems="center">
					<span style={{ fontSize: '1.2rem' }}>{currentLanguage?.flag}</span>
					<Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
						{currentLanguage?.code.toUpperCase()}
					</Typography>
				</Stack>
			</IconButton>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				PaperProps={{
					sx: {
						minWidth: 150,
					},
				}}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				{languages.map((language) => (
					<MenuItem
						key={language.code}
						onClick={() => handleLanguageChange(language.code)}
						selected={currentLocale === language.code}
						sx={{
							'&.Mui-selected': {
								backgroundColor: 'primary.main',
								color: 'primary.contrastText',
								'&:hover': {
									backgroundColor: 'primary.dark',
								},
							},
						}}
					>
						<Stack direction="row" spacing={2} alignItems="center">
							<span style={{ fontSize: '1.2rem' }}>{language.flag}</span>
							<Typography variant="body2">
								{language.name}
							</Typography>
						</Stack>
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default LanguageSwitcher;
