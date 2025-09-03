import { useEffect, useState } from 'react';

const useDeviceDetect = (): string => {
	const [device, setDevice] = useState('desktop');

	useEffect(() => {
		const checkDevice = () => {
			// Use CSS media queries instead of User Agent
			if (window.innerWidth <= 480) {
				setDevice('mobile');
			} else if (window.innerWidth <= 768) {
				setDevice('tablet');
			} else {
				setDevice('desktop');
			}
		};

		// Check on mount
		checkDevice();

		// Add resize listener
		window.addEventListener('resize', checkDevice);

		// Cleanup
		return () => window.removeEventListener('resize', checkDevice);
	}, []);

	return device;
};

export default useDeviceDetect;
