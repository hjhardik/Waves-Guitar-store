import React from 'react';

function Layout(){
    return(
        <div>
            <div className="page_container">
                {this.props.children}
            </div>
        </div>
    )
};

export default Layout;