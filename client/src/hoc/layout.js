import React from 'react';

function Layout(props){
    return(
        <div>
            Header
            <div className="page_container">
                {props.children}
            </div>
            Footer
        </div>
    )
};

export default Layout;