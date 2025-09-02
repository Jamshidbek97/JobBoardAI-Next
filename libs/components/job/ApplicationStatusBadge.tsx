import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
	Schedule as ScheduleIcon,
	Visibility as VisibilityIcon,
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon,
	Undo as UndoIcon,
} from '@mui/icons-material';

interface ApplicationStatusBadgeProps {
	status: string;
	size?: 'small' | 'medium' | 'large';
	variant?: 'filled' | 'outlined';
}

const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
	status,
	size = 'small',
	variant = 'filled',
}) => {
	const getStatusConfig = (status: string) => {
		switch (status.toUpperCase()) {
			case 'PENDING':
				return {
					label: 'Pending',
					color: 'warning' as ChipProps['color'],
					icon: <ScheduleIcon />,
					bgColor: '#fff3cd',
					textColor: '#856404',
				};
			case 'REVIEWING':
				return {
					label: 'Under Review',
					color: 'info' as ChipProps['color'],
					icon: <VisibilityIcon />,
					bgColor: '#d1ecf1',
					textColor: '#0c5460',
				};
			case 'ACCEPTED':
				return {
					label: 'Accepted',
					color: 'success' as ChipProps['color'],
					icon: <CheckCircleIcon />,
					bgColor: '#d4edda',
					textColor: '#155724',
				};
			case 'REJECTED':
				return {
					label: 'Rejected',
					color: 'error' as ChipProps['color'],
					icon: <CancelIcon />,
					bgColor: '#f8d7da',
					textColor: '#721c24',
				};
			case 'WITHDRAWN':
				return {
					label: 'Withdrawn',
					color: 'default' as ChipProps['color'],
					icon: <UndoIcon />,
					bgColor: '#e2e3e5',
					textColor: '#383d41',
				};
			default:
				return {
					label: status,
					color: 'default' as ChipProps['color'],
					icon: <ScheduleIcon />,
					bgColor: '#f8f9fa',
					textColor: '#6c757d',
				};
		}
	};

	const config = getStatusConfig(status);

	// Map large size to medium since Chip only supports small and medium
	const chipSize = size === 'large' ? 'medium' : size;

	return (
		<Chip
			label={config.label}
			icon={config.icon}
			color={config.color}
			size={chipSize}
			variant={variant}
			sx={{
				backgroundColor: variant === 'filled' ? config.bgColor : 'transparent',
				color: variant === 'filled' ? config.textColor : config.textColor,
				borderColor: config.textColor,
				fontWeight: 600,
				'& .MuiChip-icon': {
					color: 'inherit',
				},
			}}
		/>
	);
};

export default ApplicationStatusBadge;
