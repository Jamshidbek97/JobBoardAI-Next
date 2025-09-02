import React from 'react';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
	Box,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { Member } from '../../../types/member/member';
import { REACT_APP_API_URL } from '../../../config';
import { MemberStatus, MemberType } from '../../../enums/member.enum';

interface Data {
	id: string;
	nickname: string;
	fullname: string;
	phone: string;
	type: string;
	state: string;
	warning: string;
	block: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

type Order = 'asc' | 'desc';

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'id',
		numeric: true,
		disablePadding: false,
		label: 'MB ID',
	},
	{
		id: 'nickname',
		numeric: true,
		disablePadding: false,
		label: 'NICK NAME',
	},
	{
		id: 'fullname',
		numeric: false,
		disablePadding: false,
		label: 'FULL NAME',
	},
	{
		id: 'phone',
		numeric: true,
		disablePadding: false,
		label: 'PHONE NUM',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'MEMBER TYPE',
	},
	{
		id: 'warning',
		numeric: false,
		disablePadding: false,
		label: 'WARNING',
	},
	{
		id: 'block',
		numeric: false,
		disablePadding: false,
		label: 'BLOCK CRIMES',
	},
	{
		id: 'state',
		numeric: false,
		disablePadding: false,
		label: 'STATE',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { onSelectAllClick } = props;

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface MemberPanelListType {
	members: Member[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateMemberHandler: any;
}

export const MemberPanelList = (props: MemberPanelListType) => {
	const { members, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateMemberHandler } = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{members.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{members.length !== 0 &&
							members.map((member: Member, index: number) => {
								// Enhanced default image handling with fallbacks
								const getMemberImage = (member: Member) => {
									if (member.memberImage) {
										return `${REACT_APP_API_URL}/${member.memberImage}`;
									}
									
									// Different default images based on member type
									switch (member.memberType) {
										case 'AGENT':
											return '/img/profile/agent.png';
										case 'ADMIN':
											return '/img/profile/defaultUser.svg';
										case 'USER':
										default:
											return '/img/profile/defaultUser.svg';
									}
								};

								const member_image = getMemberImage(member);
								
								return (
									<TableRow 
										hover 
										key={member?._id} 
										sx={{ 
											'&:last-child td, &:last-child th': { border: 0 },
											'&:hover': {
												backgroundColor: '#f8f9fa',
												transform: 'translateY(-1px)',
												transition: 'all 0.2s ease'
											},
											transition: 'all 0.2s ease'
										}}
									>
										<TableCell align="left">
											<Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#666' }}>
												{member._id?.slice(-8)}
											</Typography>
										</TableCell>

										<TableCell align="left" className={'name'}>
											<Stack direction={'row'} spacing={2} alignItems="center">
												<Link href={`/member?memberId=${member._id}`}>
													<Avatar 
														alt={member.memberNick || 'User'} 
														src={member_image} 
														sx={{ 
															width: 48, 
															height: 48,
															border: '2px solid #e0e0e0',
															transition: 'transform 0.2s ease',
															'&:hover': {
																transform: 'scale(1.1)'
															}
														}}
													/>
												</Link>
												<Link href={`/member?memberId=${member._id}`}>
													<Typography 
														variant="body1" 
														sx={{ 
															fontWeight: 600, 
															color: '#333',
															cursor: 'pointer',
															'&:hover': {
																color: '#2196f3'
															}
														}}
													>
														{member.memberNick || 'Unknown User'}
													</Typography>
												</Link>
											</Stack>
										</TableCell>

										<TableCell align="center">
											<Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
												{member.memberFullName || '-'}
											</Typography>
										</TableCell>
										
										<TableCell align="left">
											<Typography variant="body2" sx={{ color: '#666' }}>
												{member.memberPhone || 'No Phone'}
											</Typography>
										</TableCell>

										<TableCell align="center">
											<Button 
												onClick={(e: any) => menuIconClickHandler(e, index)} 
												className={'badge success'}
												sx={{
													background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
													color: '#fff',
													borderRadius: 2,
													px: 2,
													py: 0.5,
													fontWeight: 600,
													textTransform: 'uppercase',
													fontSize: '0.75rem',
													'&:hover': {
														transform: 'translateY(-1px)',
														boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
													}
												}}
											>
												{member.memberType}
											</Button>

											<Menu
												className={'menu-modal'}
												MenuListProps={{
													'aria-labelledby': 'fade-button',
												}}
												anchorEl={anchorEl[index]}
												open={Boolean(anchorEl[index])}
												onClose={menuIconCloseHandler}
												TransitionComponent={Fade}
												sx={{ 
													p: 1,
													'& .MuiPaper-root': {
														borderRadius: 2,
														boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
														border: '1px solid #e0e0e0'
													}
												}}
											>
												{Object.values(MemberType)
													.filter((ele) => ele !== member?.memberType)
													.map((type: string) => (
														<MenuItem
															onClick={() => updateMemberHandler({ _id: member._id, memberType: type })}
															key={type}
															sx={{
																py: 1.5,
																px: 2,
																'&:hover': {
																	backgroundColor: '#f5f5f5'
																}
															}}
														>
															<Typography variant={'subtitle1'} component={'span'}>
																Change to {type}
															</Typography>
														</MenuItem>
													))}
											</Menu>
										</TableCell>

										<TableCell align="center">
											<Box sx={{ 
												display: 'inline-flex', 
												alignItems: 'center', 
												gap: 0.5,
												px: 1.5,
												py: 0.5,
												bgcolor: member.memberWarnings > 0 ? '#fff3e0' : '#f5f5f5',
												borderRadius: 2,
												border: `1px solid ${member.memberWarnings > 0 ? '#ffcc02' : '#e0e0e0'}`
											}}>
												<Typography 
													variant="body2" 
													sx={{ 
														color: member.memberWarnings > 0 ? '#e65100' : '#666',
														fontWeight: member.memberWarnings > 0 ? 600 : 400,
														fontSize: '0.8rem'
													}}
												>
													{member.memberWarnings || 0}
												</Typography>
											</Box>
										</TableCell>
										
										<TableCell align="center">
											<Box sx={{ 
												display: 'inline-flex', 
												alignItems: 'center', 
												gap: 0.5,
												px: 1.5,
												py: 0.5,
												bgcolor: member.memberBlocks > 0 ? '#ffebee' : '#f5f5f5',
												borderRadius: 2,
												border: `1px solid ${member.memberBlocks > 0 ? '#ef9a9a' : '#e0e0e0'}`
											}}>
												<Typography 
													variant="body2" 
													sx={{ 
														color: member.memberBlocks > 0 ? '#c62828' : '#666',
														fontWeight: member.memberBlocks > 0 ? 600 : 400,
														fontSize: '0.8rem'
													}}
												>
													{member.memberBlocks || 0}
												</Typography>
											</Box>
										</TableCell>
										
										<TableCell align="center">
											<Button 
												onClick={(e: any) => menuIconClickHandler(e, member._id)} 
												className={'badge success'}
												sx={{
													background: member.memberStatus === 'ACTIVE' 
														? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
														: member.memberStatus === 'BLOCK'
														? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
														: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
													color: '#fff',
													borderRadius: 2,
													px: 2,
													py: 0.5,
													fontWeight: 600,
													textTransform: 'uppercase',
													fontSize: '0.75rem',
													'&:hover': {
														transform: 'translateY(-1px)',
														boxShadow: member.memberStatus === 'ACTIVE'
															? '0 2px 8px rgba(76, 175, 80, 0.3)'
															: member.memberStatus === 'BLOCK'
															? '0 2px 8px rgba(255, 152, 0, 0.3)'
															: '0 2px 8px rgba(244, 67, 54, 0.3)'
													}
												}}
											>
												{member.memberStatus}
											</Button>

											<Menu
												className={'menu-modal'}
												MenuListProps={{
													'aria-labelledby': 'fade-button',
												}}
												anchorEl={anchorEl[member._id]}
												open={Boolean(anchorEl[member._id])}
												onClose={menuIconCloseHandler}
												TransitionComponent={Fade}
												sx={{ 
													p: 1,
													'& .MuiPaper-root': {
														borderRadius: 2,
														boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
														border: '1px solid #e0e0e0'
													}
												}}
											>
												{Object.values(MemberStatus)
													.filter((ele: string) => ele !== member?.memberStatus)
													.map((status: string) => (
														<MenuItem
															onClick={() => updateMemberHandler({ _id: member._id, memberStatus: status })}
															key={status}
															sx={{
																py: 1.5,
																px: 2,
																'&:hover': {
																	backgroundColor: '#f5f5f5'
																}
															}}
														>
															<Typography variant={'subtitle1'} component={'span'}>
																Change to {status}
															</Typography>
														</MenuItem>
													))}
											</Menu>
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
