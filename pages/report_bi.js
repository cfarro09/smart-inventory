import React, { useState, useContext } from 'react';
import Layout from '../components/system/layout/layout'
import TableZyx from '../components/system/form/table-simple';
import RoleMain from '../components/role/rolemain';
import triggeraxios from '../config/axiosv2';
import popupsContext from '../context/pop-ups/pop-upsContext';
import { validateResArray, getDomain } from '../config/helper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import authContext from '../context/auth/authContext';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@material-ui/icons';

const Role = () => {

    return (
        <Layout>
            <iframe
                title="Reportes BI"
                style={{ width: '100%', height: '100%' }}
                src="https://app.powerbi.com/view?r=eyJrIjoiNzQ0MDBmZjUtNGRkMi00MzkyLTk3MWYtMjcwOWZmYjdkMzE2IiwidCI6IjBlMGNiMDYwLTA5YWQtNDlmNS1hMDA1LTY4YjliNDlhYTFmNiIsImMiOjR9"
                allowFullScreen={true}
            />
        </Layout>
    );
}

export default Role;