import React, { useState, useContext } from 'react';
import Layout from '../components/system/layout/layout'
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';

const Home = () => {
    
    return (
        <Layout>
            <Box component={Paper} px={2} pt={2} mx={2} mb={2} style={{ height: '80vh' }}>
                <h2>¡BIENVENIDO!</h2>
            </Box>
        </Layout>
    );
}

export default Home;