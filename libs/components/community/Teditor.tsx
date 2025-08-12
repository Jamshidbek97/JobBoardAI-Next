import React, { useMemo, useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import '@toast-ui/editor/dist/toastui-editor.css';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { BoardArticleInput } from '../../types/board-article/board-article.input';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();
	const user = useReactiveVar(userVar);
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [articleTitle, setArticleTitle] = useState<string>('');
	const [articleImage, setArticleImage] = useState<string>('');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	/** HANDLERS **/
	const uploadImage = async (image: any) => {
		try {
			console.log('Starting image upload:', image);
			console.log('Image type:', image.type);
			console.log('Image size:', image.size);
			
			// Validate image type
			if (!image.type.startsWith('image/')) {
				throw new Error('Please select a valid image file (JPEG, PNG, GIF)');
			}

			// Validate image size (max 5MB)
			if (image.size > 5 * 1024 * 1024) {
				throw new Error('Image size must be less than 5MB');
			}
			
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'board-article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			// Use the correct API URL with fallbacks
			const apiUrl = process.env.NEXT_PUBLIC_API_GRAPHQL_URL || 
						  process.env.REACT_APP_API_GRAPHQL_URL || 
						  `${REACT_APP_API_URL}/graphql` ||
						  'http://localhost:4000/graphql'; // Fallback for development
			
			console.log('Uploading to:', apiUrl);
			console.log('Token available:', !!token);

			const response = await axios.post(apiUrl, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
				timeout: 30000, // 30 second timeout
			});

			console.log('Upload response:', response.data);

			if (response.data.errors) {
				throw new Error(response.data.errors[0]?.message || 'Upload failed');
			}

			const responseImage = response.data.data?.imageUploader;
			if (!responseImage) {
				throw new Error('No image URL returned from server');
			}

			console.log('Upload successful, image URL:', responseImage);
			setArticleImage(responseImage);

			// Return the full URL
			const fullImageUrl = responseImage.startsWith('http') 
				? responseImage 
				: `${REACT_APP_API_URL}/${responseImage}`;
			
			console.log('Full image URL:', fullImageUrl);
			return fullImageUrl;
		} catch (err: any) {
			console.error('Error uploading image:', err);
			
			// Show user-friendly error message
			const errorMessage = err.response?.data?.errors?.[0]?.message || 
								err.message || 
								'Failed to upload image. Please try again.';
			
			sweetErrorHandling(new Error(errorMessage)).then();
			
			// Return null to indicate upload failed
			return null;
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		console.log(e.target.value);
		setArticleTitle(e.target.value);
	};

	const handleRegisterButton = async () => {
		try {
			if (!user?._id) {
				throw new Error('You must be logged in to create an article');
			}

			const editor = editorRef.current;
			let articleContent = editor?.getInstance().getHTML();

			if (!articleTitle.trim() || !articleContent || articleContent === '<p><br></p>') {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			// Sanitize and validate content
			articleContent = articleContent.trim();
			
			// Check if content is too long (GraphQL might have limits)
			if (articleContent.length > 50000) {
				throw new Error('Article content is too long. Please keep it under 50,000 characters.');
			}

			// Basic HTML sanitization
			articleContent = articleContent
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'");

			// Remove any problematic characters that might cause GraphQL issues
			articleContent = articleContent
				.replace(/\u0000/g, '') // Remove null characters
				.replace(/\u0001/g, '') // Remove start of heading
				.replace(/\u0002/g, '') // Remove start of text
				.replace(/\u0003/g, '') // Remove end of text
				.replace(/\u0004/g, '') // Remove end of transmission
				.replace(/\u0005/g, '') // Remove enquiry
				.replace(/\u0006/g, '') // Remove acknowledge
				.replace(/\u0007/g, '') // Remove bell
				.replace(/\u0008/g, '') // Remove backspace
				.replace(/\u000B/g, '') // Remove vertical tab
				.replace(/\u000C/g, '') // Remove form feed
				.replace(/\u000E/g, '') // Remove shift out
				.replace(/\u000F/g, ''); // Remove shift in

			setIsSubmitting(true);

			// Create a simplified version of the input to avoid GraphQL issues
			const articleInput: BoardArticleInput = {
				articleCategory: articleCategory,
				articleTitle: articleTitle.trim().substring(0, 200), // Limit title length
				articleContent: articleContent,
				articleImage: articleImage || ''
			};

			console.log('Submitting article:', {
				title: articleInput.articleTitle,
				category: articleInput.articleCategory,
				contentLength: articleInput.articleContent.length,
				hasImage: !!articleInput.articleImage
			});

			// Try to submit the article
			const result = await createBoardArticle({
				variables: {
					input: articleInput,
				},
			});

			console.log('Article created successfully:', result);

			await sweetTopSuccessAlert('Article created successfully!', 700);
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myArticles',
				},
			});
		} catch (error: any) {
			console.log('Error creating article:', error);
			
			// Handle specific GraphQL errors
			if (error.graphQLErrors && error.graphQLErrors.length > 0) {
				const graphQLError = error.graphQLErrors[0];
				console.log('GraphQL Error:', graphQLError);
				
				if (graphQLError.message.includes('Variable "$input" got invalid value')) {
					// Try with simplified content
					try {
						const editor = editorRef.current;
						let simplifiedContent = editor?.getInstance().getMarkdown() || editor?.getInstance().getHTML();
						
						// Convert to plain text if HTML is causing issues
						if (simplifiedContent && simplifiedContent.length > 1000) {
							simplifiedContent = simplifiedContent.replace(/<[^>]*>/g, '').substring(0, 1000);
						}

						const fallbackInput: BoardArticleInput = {
							articleCategory: articleCategory,
							articleTitle: articleTitle.trim().substring(0, 100),
							articleContent: simplifiedContent || 'Article content',
							articleImage: ''
						};

						console.log('Trying fallback submission with simplified content');
						
						await createBoardArticle({
							variables: {
								input: fallbackInput,
							},
						});

						await sweetTopSuccessAlert('Article created successfully! (Content simplified)', 700);
						await router.push({
							pathname: '/mypage',
							query: { category: 'myArticles' },
						});
						return;
					} catch (fallbackError: any) {
						console.log('Fallback also failed:', fallbackError);
						sweetErrorHandling(new Error('Unable to create article. Please try with simpler content.')).then();
					}
				} else {
					sweetErrorHandling(new Error(graphQLError.message)).then();
				}
			} else if (error.networkError) {
				console.log('Network Error:', error.networkError);
				sweetErrorHandling(new Error('Network error. Please check your connection and try again.')).then();
			} else {
				sweetErrorHandling(error).then();
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const doDisabledCheck = () => {
		return !articleTitle.trim() || isSubmitting;
	};

	return (
		<div className="teditor-wrapper">
			<Stack>
				<Stack direction="row" style={{ margin: '40px' }} justifyContent="space-evenly">
					<Box component={'div'} className={'form_row'} style={{ width: '300px' }}>
						<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
							Category
						</Typography>
						<FormControl sx={{ width: '100%', background: 'white' }}>
							<Select
								value={articleCategory}
								onChange={changeCategoryHandler}
								displayEmpty
								inputProps={{ 'aria-label': 'Without label' }}
							>
								<MenuItem value={BoardArticleCategory.FREE}>
									<span>Free</span>
								</MenuItem>
								<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
								<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
								<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
							</Select>
						</FormControl>
					</Box>
					<Box component={'div'} style={{ width: '300px', flexDirection: 'column' }}>
						<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
							Title
						</Typography>
						<TextField
							onChange={articleTitleHandler}
							value={articleTitle}
							id="filled-basic"
							label="Type Title"
							style={{ width: '300px', background: 'white' }}
						/>
					</Box>
				</Stack>

				<Editor
					initialValue={'Type here'}
					placeholder={'Type here'}
					previewStyle={'vertical'}
					height={'640px'}
					// @ts-ignore
					initialEditType={'WYSIWYG'}
					toolbarItems={[
						['heading', 'bold', 'italic', 'strike'],
						['image', 'table', 'link'],
						['ul', 'ol', 'task'],
					]}
					ref={editorRef}
					hooks={{
						addImageBlobHook: async (image: any, callback: any) => {
							try {
								console.log('Image upload hook triggered:', image);
								const uploadedImageURL = await uploadImage(image);
								
								if (uploadedImageURL) {
									console.log('Image uploaded successfully, inserting into editor');
									callback(uploadedImageURL);
									return false; // Prevent default behavior
								} else {
									console.log('Image upload failed, not inserting into editor');
									// Don't call callback, so image won't be inserted
									return false;
								}
							} catch (error) {
								console.error('Error in image upload hook:', error);
								// Don't call callback, so image won't be inserted
								return false;
							}
						},
					}}
					events={{
						load: function (param: any) {},
					}}
				/>

				<Stack direction="row" justifyContent="center">
					<Button
						variant="contained"
						color="primary"
						style={{ margin: '30px', width: '250px', height: '45px' }}
						onClick={handleRegisterButton}
						disabled={doDisabledCheck()}
					>
						{isSubmitting ? 'Creating...' : 'Publish Article'}
					</Button>
				</Stack>
			</Stack>
		</div>
	);
};

export default TuiEditor;
