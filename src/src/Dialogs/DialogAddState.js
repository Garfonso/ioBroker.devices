import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import {
    Autocomplete,
    Checkbox,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    ThemeProvider
} from '@mui/material';

import IconClose from '@mui/icons-material/Close';
import IconCheck from '@mui/icons-material/Check';

import I18n from '@iobroker/adapter-react-v5/i18n';
import theme from '@iobroker/adapter-react-v5/Theme';
import Utils from '@iobroker/adapter-react-v5/Components/Utils';


const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        height: 'auto',
        display: 'flex'
    },
    paper: {
        maxWidth: 960,
        width: 'calc(100% - 64px)'
    },
    overflowHidden: {
        display: 'flex',
        flexDirection: 'column',
        border: 'none'
        // overflow: 'hidden'
    },
    pre: {
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        margin: 0
    },
    showDialog: {
        marginTop: 10
    },
    nameField: {
        marginTop: 10
    },
    roleField: {
        marginTop: 10

    },
    typeField: {
        marginTop: 10

    },
    unitField: {
        // marginTop: 10

    },
    minField: {
        marginTop: 10,
        marginRight: 10,
    },
    maxField: {
        marginTop: 10,
    },
    minMax: {
        display: 'flex',
    },
    overflowText:{
        '& h2':{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
    },
    '@media screen and (max-width: 450px)': {
        paper: {
            maxWidth: 960,
            width: 'calc(100% - 12px)',
            height: 'calc(100% - 12px)',
            maxHeight:'calc(100% - 12px)',
            margin: 0,
        },
    },
}));

const typeArray = [
    'string',
    'boolean',
    'number',
    'file',
];

const DialogAddState = ({ onClose, objects, socket, channelId, arrayStateDefault, editState }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(true);
    const [role, setRole] = useState(null);
    const [roleInput, setRoleInput] = useState(null);
    const [roles, setRoles] = useState([]);
    const [name, setName] = useState('NEW_STATE');
    const [unit, setUnit] = useState('');
    const [type, setType] = useState('string');
    const [checkedRead, setCheckedRead] = useState(true);
    const [checkedWrite, setCheckedWrite] = useState(true);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [step, setStep] = useState(0);
    const [checkedStates, setCheckedStates] = useState(false);

    useEffect(() => {
        let rolesArr = [];
        Object.keys(objects).forEach(key => {
            const obj = objects[key];
            if (obj) {
                const common = obj.common;
                const role = common && common.role;
                if (role && !rolesArr.includes(role)) {
                    rolesArr.push(role);
                }
            }
        });

        setRoles(rolesArr.sort());

        if (editState) {
            const newObj = objects[editState];
            if (newObj) {
                setType(newObj.common.type);
                setRole(newObj.common.role);
                setName(newObj.common.name);
                if (newObj.common.type === 'number') {
                    setMin(newObj.common.min);
                    setMax(newObj.common.max);
                    setUnit(newObj.common.unit);
                    setStep(newObj.common.step);
                    setCheckedStates(!!newObj.common.states);
                }
                if (newObj.common.type !== 'file') {
                    setCheckedRead(newObj.common.read);
                    setCheckedWrite(newObj.common.write);
                }
            }
        }
    }, [editState, objects]);

    return <ThemeProvider theme={theme(Utils.getThemeName())}>
        <Dialog
            onClose={() => setOpen(false)}
            open={open}
            classes={{ paper: classes.paper }}
        >
            <DialogTitle className={classes.overflowText}>{I18n.t(editState ? 'Edit state %s' : 'Add state %s', `${channelId}.${name}`)}</DialogTitle>
            <DialogContent className={classes.overflowHidden} dividers>
                <Paper className={classes.showDialog} style={{ padding: `10px 20px` }} p={3}>
                    <TextField
                        variant="standard"
                        fullWidth
                        value={name}
                        error={!name || (objects[`${channelId}.${name}`] && editState !== `${channelId}.${name}`) || arrayStateDefault.find(item => item.name === name)}
                        className={classes.nameField}
                        label={I18n.t('Name')}
                        onChange={e => setName(e.target.value?.toUpperCase())}
                    />
                    <Autocomplete
                        freeSolo
                        options={roles}
                        className={classes.roleField}
                        style={{ width: '100%' }}
                        value={role}
                        onChange={(event, role) => {
                            setRole(role);
                            setRoleInput(role);
                        }}
                        onInputChange={(event, role) => setRoleInput(role)}
                        renderInput={params => <TextField
                            variant="standard"
                            {...params}
                            label={I18n.t('Role')}
                        // variant="outlined"
                        />}
                    />
                    <FormControl
                        fullWidth
                        variant="standard"
                        className={classes.typeField}
                    >
                        <InputLabel>{I18n.t('Type')}</InputLabel>
                        <Select
                            variant="standard"
                            fullWidth
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            {typeArray.map(key => <MenuItem key={key} value={key}>{key}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {type !== 'file' &&
                        <>
                            <FormControlLabel
                                control={<Checkbox checked={checkedRead} onChange={e => setCheckedRead(e.target.checked)} />}
                                label={I18n.t('Readable')}
                            />
                            <FormControlLabel
                                control={<Checkbox checked={checkedWrite} onChange={e => setCheckedWrite(e.target.checked)} />}
                                label={I18n.t('Writable')}
                            />
                        </>
                    }
                    {type === 'number' && <TextField
                        variant="standard"
                        fullWidth
                        value={unit}
                        className={classes.unitField}
                        label={I18n.t('Unit')}
                        onChange={e => setUnit(e.target.value)}
                    />}
                    {type === 'number' && <div className={classes.minMax}>
                        <TextField
                            variant="standard"
                            fullWidth
                            value={min}
                            type="number"
                            className={classes.minField}
                            label={I18n.t('Min')}
                            onChange={e => setMin(e.target.value)}
                        />
                        <TextField
                            variant="standard"
                            fullWidth
                            value={max}
                            type="number"
                            className={classes.minField}
                            label={I18n.t('Max')}
                            onChange={e => setMax(e.target.value)}
                        />
                        <TextField
                            variant="standard"
                            fullWidth
                            value={step}
                            type="number"
                            className={classes.maxField}
                            label={I18n.t('Step')}
                            onChange={e => setStep(e.target.value)}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={checkedStates} onChange={e => setCheckedStates(e.target.checked)} />}
                            label={I18n.t('Value=>String')}
                        />
                    </div>}
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    autoFocus
                    disabled={!name || (objects[`${channelId}.${name}`] && !editState) || (editState && editState !== `${channelId}.${name}` && objects[`${channelId}.${name}`]) || arrayStateDefault.find(item => item.name === name)}
                    onClick={async () => {
                        setOpen(false);
                        let obj = {
                            _id: `${channelId}.${name}`,
                            common: {
                                name,
                                role: roleInput,
                                type,
                            },
                            type: 'state'
                        };
                        if (editState){
                            obj = JSON.parse(JSON.stringify(objects[editState]));
                            obj._id = `${channelId}.${name}`;
                            obj.common.name = name;
                            obj.common.role = roleInput;
                            obj.common.type = type;
                        }
                        if (type === 'number') {
                            obj.common.min = parseFloat(min.toString().replace(',', '.'));
                            obj.common.max = parseFloat(max.toString().replace(',', '.'));
                            obj.common.unit = unit;
                            if (step || step === 0) {
                                obj.common.step = parseFloat(step.toString().replace(',', '.'));
                            }
                            if (checkedStates) {
                                obj.common.states = obj.common.states || {};
                            } else if (obj.common.states) {
                               delete obj.common.states;
                            }
                        }
                        if (type !== 'file') {
                            obj.common.read = checkedRead;
                            obj.common.write = checkedWrite;
                        }
                        await socket.setObject(`${channelId}.${name}`, obj);
                        onClose && onClose(obj);
                    }}
                    startIcon={<IconCheck />}
                    color="primary">
                    {I18n.t(editState ? 'Save' : 'Add')}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => setOpen(false)}
                    startIcon={<IconClose />}
                    color="grey"
                >
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    </ThemeProvider>;
}

DialogAddState.propTypes = {
    editState: PropTypes.string,
    objects: PropTypes.object,
    socket: PropTypes.object,
    arrayStateDefault: PropTypes.array,
    onClose: PropTypes.func.isRequired,
};

export default DialogAddState;