import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';

import CloseIcon from '@material-ui/icons/Close';
import AppsIcon from '@material-ui/icons/Apps';

import Icon from '@iobroker/adapter-react/Components/Icon';
import Utils from '@iobroker/adapter-react/Components/Utils';
import { Tooltip } from '@material-ui/core';

// import Utils from '../Utils';

class IconSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opened: false,
        };
    }

    componentDidMount() {
        this.setState({ loading: true }, () => {
            const icons = [];

            const promises = this.props.icons.map((href, i) => {
                if (href.startsWith('data:')) {
                    icons[i] = href;
                    return Promise.resolve();
                } else {
                    return Utils.getSvg(href)
                        .then(icon =>
                            icons[i] = icon);
                }
            });

            Promise.all(promises)
                .then(() =>
                    this.setState({ icons, loading: false }));
        });
    }

    render() {
        if (!this.props.icons) {
            return null;
        }
        if (this.state.loading) {
            return <LinearProgress />;
        }

        return <>
            <Tooltip title={this.props.t('Icons')}>
                <IconButton onClick={e => {
                    this.setState({ opened: true });
                    e.stopPropagation();
                }}><AppsIcon />
                </IconButton>
            </Tooltip>
            {this.state.opened ? <Dialog onClose={(e) => {
                this.setState({ opened: false });
                e.stopPropagation();
            }} open={true}>
                <DialogTitle>{this.props.t('Select predefined icon')}</DialogTitle>
                <DialogContent>
                    <div style={{ width: 340 }}>
                        {this.state.icons.map((icon, i) => (
                            <IconButton
                                key={i}
                                onClick={e => {
                                    this.setState({ opened: false }, () =>
                                        this.props.onSelect(icon));
                                    e.stopPropagation();
                                }
                                }
                            >
                                <Icon src={icon} alt={i} style={{ width: 32, height: 32, borderRadius: 5 }} />
                            </IconButton>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={(e) => {
                        this.setState({ opened: false });
                        e.stopPropagation();
                    }} color="primary" autoFocus>
                        <CloseIcon style={{ marginRight: 8 }} />{this.props.t('Close')}
                    </Button>
                </DialogActions>
            </Dialog> : null}
        </>
    }
}

IconSelector.propTypes = {
    icons: PropTypes.array,
    onSelect: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

export default IconSelector;