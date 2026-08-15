import React from "react";
import Dashboard from './default';

const DefaultPage = () => {
    return (
        <Dashboard>
            <div style={{ padding: '20px' }}>
                <h1>Welcome to City Express</h1>
                <p>You have successfully logged in!</p>
            </div>
        </Dashboard>
    );
};

export default DefaultPage;