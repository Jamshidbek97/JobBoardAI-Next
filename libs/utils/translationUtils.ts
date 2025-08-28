import { useTranslation } from 'next-i18next';

// Utility for handling dynamic translations with interpolation
export const useTranslationUtils = () => {
	const { t, i18n } = useTranslation('common');

	// Format time ago with proper localization
	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return t('Just now');
		if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `${minutes} ${t('minute', { count: minutes })} ${t('ago')}`;
		}
		if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `${hours} ${t('hour', { count: hours })} ${t('ago')}`;
		}
		if (diffInSeconds < 2592000) {
			const days = Math.floor(diffInSeconds / 86400);
			return `${days} ${t('day', { count: days })} ${t('ago')}`;
		}
		return date.toLocaleDateString(i18n.language);
	};

	// Format currency with proper localization
	const formatCurrency = (val?: number | string | null, currency = 'KRW') => {
		if (val == null || val === '') return t('Negotiable');
		const num = typeof val === 'string' ? Number(val) : val;
		if (!isFinite(num)) return String(val);
		
		try {
			const locale = i18n.language === 'kr' ? 'ko-KR' : 
						  i18n.language === 'ru' ? 'ru-RU' : 'en-US';
			
			return new Intl.NumberFormat(locale, { 
				style: 'currency', 
				currency, 
				maximumFractionDigits: 0 
			}).format(num);
		} catch {
			return `${num} ${currency}`;
		}
	};

	// Interpolate translation with variables
	const interpolate = (key: string, variables: Record<string, any>) => {
		let translation = t(key);
		
		Object.entries(variables).forEach(([key, value]) => {
			translation = translation.replace(new RegExp(`{${key}}`, 'g'), String(value));
		});
		
		return translation;
	};

	// Get notification type label
	const getNotificationTypeLabel = (type: string) => {
		switch (type) {
			case 'JOB_APPLICATION_RECEIVED':
				return t('Job Applications');
			case 'JOB_APPLICATION_STATUS_CHANGED':
				return t('Application Update');
			case 'JOB_APPLICATION_ACCEPTED':
				return t('Application Accepted');
			case 'JOB_APPLICATION_REJECTED':
				return t('Application Rejected');
			case 'JOB_INTERVIEW_SCHEDULED':
				return t('Interview Scheduled');
			case 'NEW_FOLLOWER':
				return t('Followers');
			case 'LIKE_RECEIVED':
				return t('Likes');
			case 'COMMENT_RECEIVED':
				return t('Comments');
			default:
				return type.replace(/_/g, ' ');
		}
	};

	return {
		t,
		i18n,
		formatTimeAgo,
		formatCurrency,
		interpolate,
		getNotificationTypeLabel,
	};
};

// Pluralization helper
export const pluralize = (count: number, singular: string, plural: string) => {
	return count === 1 ? singular : plural;
};

// Date formatting with localization
export const formatDate = (dateString: string, locale?: string) => {
	const date = new Date(dateString);
	const lang = locale || 'en';
	
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	};
	
	return date.toLocaleDateString(lang, options);
};

// Number formatting with localization
export const formatNumber = (num: number, locale?: string) => {
	const lang = locale || 'en';
	return new Intl.NumberFormat(lang).format(num);
};
