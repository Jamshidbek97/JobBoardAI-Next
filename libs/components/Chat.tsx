import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Badge from '@mui/material/Badge';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, REACT_APP_API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';

const NewMessage = (type: any) => {
	if (type === 'right') {
		return (
			<Box
				component={'div'}
				flexDirection={'row'}
				style={{ display: 'flex' }}
				alignItems={'flex-end'}
				justifyContent={'flex-end'}
				sx={{ m: '10px 0px' }}
			>
				<div className={'msg_right'}></div>
			</Box>
		);
	} else {
		return (
			<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
				<Avatar alt={'Avatar'} src={'/img/profile/defaultUser.svg'} />
				<div className={'msg_left'}></div>
			</Box>
		);
	}
};

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const textInput = useRef(null);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	/** LIFECYCLE **/
	useEffect(() => {
		if (!socket) {
			console.log('No socket available');
			setConnectionStatus('disconnected');
			return;
		}

		console.log('Setting up WebSocket handlers, current state:', socket.readyState);

		// Set up WebSocket event handlers
		socket.onopen = () => {
			console.log('WebSocket connected successfully');
			setConnectionStatus('connected');
		};

		socket.onclose = (event) => {
			console.log('WebSocket disconnected:', event.code, event.reason);
			setConnectionStatus('disconnected');
		};

		socket.onerror = (error) => {
			console.error('WebSocket error:', error);
			setConnectionStatus('disconnected');
		};

 		socket.onmessage = (msg) => {
			try {
				const data = JSON.parse(msg.data);
				console.log('Websocket message', data);

				switch (data.event) {
					case 'info':
						const newInfo: InfoPayload = data;
						setOnlineUsers(newInfo.totalClients);
						break;
					case 'getMessages':
						const list: MessagePayload[] = data.list;
						setMessagesList(list);
						break;
					case 'message':
						const newMessage: MessagePayload = data;
						setMessagesList(prev => [...prev, newMessage]);
						break;
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
			}
		};

		// Cleanup function
		return () => {
			if (socket) {
				socket.onopen = null;
				socket.onclose = null;
				socket.onerror = null;
				socket.onmessage = null;
			}
		};
	}, [socket]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback(
		(e: any) => {
			const text = e.target.value;
			setMessageInput(text);
		},
		[messageInput],
	);

	const getKeyHandler = (e: any) => {
		try {
			if (e.key == 'Enter') {
				onClickHandler();
			}
		} catch (err: any) {
			console.log(err);
		}
	};

	const onClickHandler = () => {
		if (!messageInput.trim()) {
			sweetErrorAlert(Messages.error4);
			return;
		}

		if (!socket || connectionStatus !== 'connected') {
			sweetErrorAlert('Chat is not connected. Please try again.');
			return;
		}

		try {
			socket.send(JSON.stringify({ event: 'message', data: messageInput.trim() }));
			setMessageInput('');
		} catch (error) {
			console.error('Error sending message:', error);
			sweetErrorAlert('Failed to send message. Please try again.');
		}
	};

	return (
		<Stack className="chatting">
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
				</button>
			) : null}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					<div style={{ fontFamily: 'Nunito' }}>
						Online Chat
						<span style={{ 
							fontSize: '12px', 
							marginLeft: '8px',
							color: connectionStatus === 'connected' ? '#4caf50' : 
								   connectionStatus === 'connecting' ? '#ff9800' : '#f44336'
						}}>
							{connectionStatus === 'connected' ? '●' : 
							 connectionStatus === 'connecting' ? '●' : '●'}
						</span>
					</div>
					<RippleBadge style={{ margin: '-18px 0 0 21px' }} badgeContent={onlineUsers} />
				</Box>
				<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>
									{connectionStatus === 'connected' ? 'Welcome to Live chat!' :
									 connectionStatus === 'connecting' ? 'Connecting to chat...' :
									 'Chat disconnected. Please refresh the page.'}
								</div>
							</Box>
							{messagesList.map((ele: MessagePayload) => {
								const { text, memberData } = ele;
								const memberImage = memberData?.memberImage
									? `${REACT_APP_API_URL}/${memberData.memberImage}`
									: '/img/profile/defaultUser.svg';

								return memberData?._id === user._id ? (
									<Box
										component={'div'}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										alignItems={'flex-end'}
										justifyContent={'flex-end'}
										sx={{ m: '10px 0px' }}
									>
										<Avatar alt={'Avatar'} src={memberImage} />
										<div className={'msg-right'}>{text}</div>
									</Box>
								) : (
									<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
										<Avatar alt={'Avatar'} src={memberImage} />
										<div className={'msg-left'}>{text}</div>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className={'chat-bott'} component={'div'}>
					<input
						ref={textInput}
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={connectionStatus === 'connected' ? 'Type message' : 'Chat disconnected'}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
						value={messageInput}
						disabled={connectionStatus !== 'connected'}
					/>
					<button 
						className={'send-msg-btn'} 
						onClick={onClickHandler}
						disabled={connectionStatus !== 'connected' || !messageInput.trim()}
						style={{ 
							opacity: connectionStatus !== 'connected' || !messageInput.trim() ? 0.5 : 1,
							cursor: connectionStatus !== 'connected' || !messageInput.trim() ? 'not-allowed' : 'pointer'
						}}
					>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
