import React, { useEffect } from 'react';

import Header from '../components/Header_footer/Header';
import Footer from '../components/Header_footer/Footer';

import { connect } from 'react-redux';
import { getSiteData } from '../actions/site_actions';

function Layout (props) {
    console.log('XXXXXXXXXXXXXXX',props);
    useEffect(()=>{
        if(Object.keys(props.site).length === 0){
            props.dispatch(getSiteData());
        }
    });

        return (
            <div>
                <Header/>
                <div className="page_container">
                    {props.children}
                </div>
                <Footer data={props.site}/>
            </div>
        );
}

const mapStateToProps = (state) => {
    return {
        site: state.site
    }
}

export default connect(mapStateToProps)(Layout);    //The connect() function connects a React component to a Redux store.
//It provides its connected component with the pieces of the data it needs from the store, and the functions it can use to dispatch actions to the store.
//It does not modify the component class passed to it; instead, it returns a new, connected component class that wraps the component you passed in.