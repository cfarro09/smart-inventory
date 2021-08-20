import React, { useState, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import triggeraxios from '../../config/axiosv2';
import trackingContext from '../../context/tracking/trackingContext'
import popupsContext from '../../context/pop-ups/pop-upsContext';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const optionsFilterBy = [
	{ description: 'Codigo de Barras', value: 'client_barcode' },
	{ description: 'Codigo de Seguimiento', value: 'seg_code' },
	{ description: 'N° de Guia', value: 'guide_number' },
	{ description: 'DNI Cliente', value: 'client_dni' },
]

const useStyles = makeStyles((theme) => ({
	root: {
		padding: '2px 4px',
		display: 'flex',
		alignItems: 'center',
		marginTop: '1rem'

	},
	input: {
		marginLeft: theme.spacing(1),
		flex: 1,
	},
	iconButton: {
		padding: 10,
	},
	divider: {
		height: 28,
		margin: 4,
	},
}));

const requestdata = (guide_number,) => (
	{
		method: "SP_SEL_GUIDE_BY_BARCODE",
		data: {
			guide_number,
		}
	}
)
const SearchGuide = ({ }) => {

	const { setOpenBackdrop, setOpenSnackBack, setModalQuestion } = useContext(popupsContext);
	const { guides, addguide } = useContext(trackingContext);
	
	const classes = useStyles();
	const [textsearch, settextsearch] = useState('');

	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const searchbarcode = async () => {
		const listposibles = textsearch.split(",");
		
		listposibles.forEach(async textsearch => {
			const textcleaned = textsearch.trim();
			if (guides.some(x => x.guide_number === textcleaned)) {
				setOpenSnackBack(true, { success: false, message: `El guide_number ya fue consultado.` });
				return;
			}
			if (textcleaned) {
				setOpenBackdrop(true);
				const res = await triggeraxios('post', process.env.endpoints.selsimple, requestdata(textcleaned));

				if (res.success) {
					if (res.result.data && res.result.data.length > 0) {
						addguide(res.result.data);
						settextsearch("");
					} else {
						setOpenSnackBack(true, { success: false, message: `No se encontró ese guide_number.` });
					}
				}
				setOpenBackdrop(false);
			}
		});

	}

	const handlersubmit = (e) => {
		e.preventDefault();
		searchbarcode();
	}

	return (
		<Paper component="form" onSubmit={handlersubmit} className={classes.root}>
			<InputBase
				className={classes.input}
				placeholder={`Buscar por id orden`}
				inputProps={{ 'aria-label': 'buscar guideo' }}
				value={textsearch}
				onChange={e => settextsearch(e.target.value)}
			/>
			<IconButton type="button" onClick={searchbarcode} className={classes.iconButton} aria-label="search">
				<SearchIcon />
			</IconButton>
		</Paper>
	);
}

export default SearchGuide;