import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Stack, Typography, TextField, Chip } from '@mui/material';
import axios from 'axios';
import { Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLE **/
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user.memberNick || '',
			memberFullName: user.memberFullName || '',
			memberPhone: user.memberPhone || '',
			memberAddress: user.memberAddress || '',
			memberDesc: user.memberDesc || '',
			memberImage: user.memberImage || '',
		});
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			console.log('+image:', image);

			// Validate image type
			if (!image.type.startsWith('image/')) {
				throw new Error('Please select a valid image file (JPEG, PNG)');
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
						target: 'member',
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
						  'http://localhost:4000/graphql';

			const response = await axios.post(apiUrl, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
				timeout: 30000,
			});

			if (response.data.errors) {
				throw new Error(response.data.errors[0]?.message || 'Upload failed');
			}

			const responseImage = response.data.data?.imageUploader;
			if (!responseImage) {
				throw new Error('No image URL returned from server');
			}

			console.log('+responseImage: ', responseImage);
			updateData.memberImage = responseImage;
			setUpdateData({ ...updateData });

			await sweetMixinSuccessAlert('Profile image uploaded successfully!');
			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err: any) {
			console.log('Error, uploadImage:', err);
			const errorMessage = err.response?.data?.errors?.[0]?.message || 
								err.message || 
								'Failed to upload image. Please try again.';
			sweetErrorHandling(new Error(errorMessage)).then();
		}
	};

	const updatePropertyHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			updateData._id = user._id;
			const result = await updateMember({
				variables: {
					input: updateData,
				},
			});

			const jwtToken = result.data?.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember.accessToken);
			await sweetMixinSuccessAlert('Information Updated Successfully');
		} catch (error: any) {
			sweetErrorHandling(error).then();
		}
	}, [updateData]);

	const doDisabledCheck = () => {
		if (
			updateData.memberNick === '' ||
			updateData.memberPhone === '' ||
			updateData.memberAddress === ''
		) {
			return true;
		}
		return false;
	};

	console.log('+updateData', updateData);

	if (device === 'mobile') {
		return <>MY PROFILE PAGE MOBILE</>;
	} else
		return (
			<div id="my-profile-page" style={{ width: '100%', padding: '20px' }}>
				<Stack className="main-title-box" style={{ marginBottom: '30px' }}>
					<Stack className="right-box">
						<Typography className="main-title" style={{ 
							fontSize: '30px', 
							fontWeight: 600, 
							marginBottom: '10px',
							color: '#181a20'
						}}>
							My Profile
						</Typography>
						<Typography className="sub-title" style={{ 
							fontSize: '14px', 
							color: '#666',
							lineHeight: '1.5'
						}}>
							We are glad to see you again!
						</Typography>
					</Stack>
				</Stack>
				
				<Stack className="top-box" style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: '40px',
					padding: '30px',
					borderRadius: '12px',
					border: '1px solid rgba(196, 196, 196, 0.79)',
					background: '#fff',
					boxShadow: '0px 1px 4px 0px rgba(24, 26, 32, 0.07)'
				}}>
					
					{/* Left Column - Photo and Basic Info */}
					<Stack style={{ gap: '30px' }}>
						<Stack className="photo-box">
							<Typography className="title" style={{ 
								fontSize: '16px', 
								fontWeight: 600, 
								marginBottom: '15px',
								color: '#181a20'
							}}>
								Profile Photo
							</Typography>
							<Stack className="image-big-box" style={{ alignItems: 'center', gap: '20px' }}>
								<Stack className="image-box" style={{
									width: '120px',
									height: '120px',
									borderRadius: '50%',
									overflow: 'hidden',
									border: '3px solid #e5e7eb'
								}}>
									<img
										src={
											updateData?.memberImage
												? `${REACT_APP_API_URL}/${updateData?.memberImage}`
												: `/img/profile/defaultUser.svg`
										}
										alt="Profile"
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover'
										}}
									/>
								</Stack>
								<Stack className="upload-big-box" style={{ alignItems: 'center', gap: '10px' }}>
									<input
										type="file"
										hidden
										id="hidden-input"
										onChange={uploadImage}
										accept="image/jpg, image/jpeg, image/png"
									/>
									<label htmlFor="hidden-input" style={{
										padding: '10px 20px',
										background: '#181a20',
										color: '#fff',
										borderRadius: '8px',
										cursor: 'pointer',
										fontSize: '14px',
										fontWeight: 600,
										textAlign: 'center'
									}}>
										Upload Profile Image
									</label>
									<Typography style={{ 
										fontSize: '12px', 
										color: '#666',
										textAlign: 'center'
									}}>
										A photo must be in JPG, JPEG or PNG format!
									</Typography>
								</Stack>
							</Stack>
						</Stack>

						<Stack className="small-input-box" style={{ gap: '20px' }}>
							<Stack className="input-box">
								<Typography className="title" style={{ 
									fontSize: '14px', 
									fontWeight: 600, 
									marginBottom: '8px',
									color: '#181a20'
								}}>
									Username *
								</Typography>
								<input
									type="text"
									placeholder="Your username"
									value={updateData.memberNick}
									onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
									style={{
										width: '100%',
										height: '47px',
										outline: 'none',
										borderRadius: '8px',
										padding: '0px 15px',
										border: '1px solid #ddd',
										fontSize: '14px'
									}}
								/>
							</Stack>
							<Stack className="input-box">
								<Typography className="title" style={{ 
									fontSize: '14px', 
									fontWeight: 600, 
									marginBottom: '8px',
									color: '#181a20'
								}}>
									Full Name
								</Typography>
								<input
									type="text"
									placeholder="Your full name"
									value={updateData.memberFullName}
									onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberFullName: value })}
									style={{
										width: '100%',
										height: '47px',
										outline: 'none',
										borderRadius: '8px',
										padding: '0px 15px',
										border: '1px solid #ddd',
										fontSize: '14px'
									}}
								/>
							</Stack>
							<Stack className="input-box">
								<Typography className="title" style={{ 
									fontSize: '14px', 
									fontWeight: 600, 
									marginBottom: '8px',
									color: '#181a20'
								}}>
									Phone *
								</Typography>
								<input
									type="text"
									placeholder="Your Phone"
									value={updateData.memberPhone}
									onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
									style={{
										width: '100%',
										height: '47px',
										outline: 'none',
										borderRadius: '8px',
										padding: '0px 15px',
										border: '1px solid #ddd',
										fontSize: '14px'
									}}
								/>
							</Stack>
						</Stack>
					</Stack>

					{/* Right Column - Address and Description */}
					<Stack style={{ gap: '20px' }}>
						<Stack className="address-box">
							<Typography className="title" style={{ 
								fontSize: '14px', 
								fontWeight: 600, 
								marginBottom: '8px',
								color: '#181a20'
							}}>
								Address *
							</Typography>
							<input
								type="text"
								placeholder="Your address"
								value={updateData.memberAddress}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
								style={{
									width: '100%',
									height: '47px',
									outline: 'none',
									borderRadius: '8px',
									padding: '0px 15px',
									border: '1px solid #ddd',
									fontSize: '14px'
								}}
							/>
						</Stack>

						<Stack className="about-me-box">
							<Typography className="title" style={{ 
								fontSize: '14px', 
								fontWeight: 600, 
								marginBottom: '8px',
								color: '#181a20'
							}}>
								About Me
							</Typography>
							<textarea
								placeholder="Tell us about yourself..."
								value={updateData.memberDesc}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberDesc: value })}
								rows={6}
								style={{
									width: '100%',
									minHeight: '120px',
									borderRadius: '8px',
									padding: '12px 15px',
									border: '1px solid #ddd',
									outline: 'none',
									resize: 'vertical',
									background: '#fff',
									fontSize: '14px',
									lineHeight: '1.5',
									fontFamily: 'inherit'
								}}
							/>
						</Stack>

						<Stack className="about-me-box" style={{ marginTop: '20px' }}>
							<Button 
								className="update-button" 
								onClick={updatePropertyHandler} 
								disabled={doDisabledCheck()}
								style={{
									width: '100%',
									height: '50px',
									padding: '16px 30px',
									borderRadius: '12px',
									background: doDisabledCheck() ? '#ccc' : '#181a20',
									color: '#fff',
									border: 'none',
									cursor: doDisabledCheck() ? 'not-allowed' : 'pointer',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									gap: '10px',
									fontSize: '16px',
									fontWeight: 600
								}}
							>
								<Typography style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>
									Update Profile
								</Typography>
								<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
									<g clipPath="url(#clip0_7065_6985)">
										<path
											d="M12.6389 0H4.69446C4.49486 0 4.33334 0.161518 4.33334 0.361122C4.33334 0.560727 4.49486 0.722245 4.69446 0.722245H11.7672L0.105803 12.3836C-0.0352676 12.5247 -0.0352676 12.7532 0.105803 12.8942C0.176321 12.9647 0.268743 13 0.361131 13C0.453519 13 0.545907 12.9647 0.616459 12.8942L12.2778 1.23287V8.30558C12.2778 8.50518 12.4393 8.6667 12.6389 8.6667C12.8385 8.6667 13 8.50518 13 8.30558V0.361122C13 0.161518 12.8385 0 12.6389 0Z"
											fill="white"
										/>
									</g>
									<defs>
										<clipPath id="clip0_7065_6985">
											<rect width="13" height="13" fill="white" />
										</clipPath>
									</defs>
								</svg>
							</Button>
						</Stack>
					</Stack>
				</Stack>
			</div>
		);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberFullName: '',
		memberPhone: '',
		memberAddress: '',
		memberDesc: '',
	},
};

export default MyProfile;
