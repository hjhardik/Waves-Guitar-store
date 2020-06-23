import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { auth } from '../actions/user_actions';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function(ComposedClass,reload,adminRoute = null){ //composed class is the component passed //reload is the boolean var which is true for private routes, null for public and false for in between 
    const AuthenticationCheck = (props) => {
        const [loading,setLoading] = useState(true);  

        useEffect(()=>{
            props.dispatch(auth()).then(response => {
                let user = props.user.userData;

                if(!user.isAuth){
                    if(reload){
                        props.history.push('/register_login')
                    }
                } else{
                    if(adminRoute && !user.isAdmin){
                        props.history.push('/user/dashboard')
                    } else{
                        if(reload === false){
                            props.history.push('/user/dashboard')
                        }
                    }
                }
                setLoading(false)
            })
        });
        
        if(loading){ ////meanwhile when the useEffect is finished running, it will display circular loading 
            return (
                <div className="main_loader">
                    <CircularProgress style={{color:'#2196F3'}} thickness={5}/> 
                </div>
            )
        }
        //else
        return (
            <ComposedClass {...props} user={props.user}/>
            );
    }

    function mapStateToProps(state){
        return {
            user: state.user
        }
    }
    return connect(mapStateToProps)(AuthenticationCheck);
}


