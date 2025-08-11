/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
	reactStrictMode: true,
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_WS: process.env.REACT_APP_API_WS,
	},
	i18n,
	// async rewrites() {
	// 	return [{ source: '/jobs/:id', destination: '/jobs/detail?id=:id' }];
	// },
	// Optional: if you use next/image with external hosts
	images: {
		domains: [
			'localhost',
			'127.0.0.1',
			// 'www.logoai.com', // add hosts you actually load images from
		],
	},
};

module.exports = nextConfig;
