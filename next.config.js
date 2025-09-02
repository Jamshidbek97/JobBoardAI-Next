/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
	reactStrictMode: true,
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_WS: process.env.REACT_APP_API_WS,
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
		NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
	},
	i18n,
	// async rewrites() {
	// 	return [{ source: '/jobs/:id', destination: '/jobs/detail?id=:id' }];
	// },
	// Optional: if you use next/image with external hosts
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				port: '3001',
				pathname: '/**',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
				port: '3001',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'www.msn.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '**.msn.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '**.microsoft.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '**.bing.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '**.google.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '**.googleapis.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '**.amazonaws.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '**.cloudfront.net',
				pathname: '/**',
			},
		],
		// Keep domains for backward compatibility (deprecated but still works)
		domains: [
			'localhost',
			'127.0.0.1',
			'www.msn.com',
			'msn.com',
			'microsoft.com',
			'bing.com',
			'google.com',
			'googleapis.com',
			'amazonaws.com',
			'cloudfront.net',
		],
	},
};

module.exports = nextConfig;
