import React, { useState } from 'react';
import FormField from '../utils/Form/formfield';
import { update, generateData, isFormValid } from '../utils/Form/formActions';
import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import { loginUser } from '../../actions/user_actions';

function Login(props) {
    const state = {
        formError: false,
        formSuccess:'',
        formdata:{
            email: {
                element: 'input',
                value: '',
                config:{
                    name: 'email_input',
                    type: 'email',
                    placeholder: 'Enter your email'
                },
                validation:{
                    required: true,
                    email: true
                },
                valid: false,
                touched: false,
                validationMessage:''
            },
            password: {
                element: 'input',
                value: '',
                config:{
                    name: 'password_input',
                    type: 'password',
                    placeholder: 'Enter your password'
                },
                validation:{
                    required: true
                },
                valid: false,
                touched: false,
                validationMessage:''
            }
        }
    }

    const [newState, setNewState] = useState(state)
    const updateForm = (element) => {
        const newFormdata = update(element, newState.formdata,'login');
        setNewState({
            formError: false,
            formdata: newFormdata
        })
    }


    const submitForm= (event) =>{
        event.preventDefault();
        
        let dataToSubmit = generateData(newState.formdata,'login');
        let formIsValid = isFormValid(newState.formdata,'login')

        if(formIsValid){
            this.props.dispatch(loginUser(dataToSubmit)).then(response =>{
                if(response.payload.loginSuccess){
                    console.log(response.payload);
                    props.history.push('/user/dashboard')
                }else{
                    setNewState({
                        formError: true
                    })
                }
            });

        } else {
            setNewState({
                formError: true
            })
        }
    }

        return (
            <div className="signin_wrapper">
                <form onSubmit={(event)=> submitForm(event)}>

                    <FormField
                        id={'email'}
                        formdata={newState.formdata.email}
                        change={(element)=> updateForm(element)}
                    />

                    <FormField
                        id={'password'}
                        formdata={newState.formdata.password}
                        change={(element)=> updateForm(element)}
                    />

                    { this.state.formError ?
                        <div className="error_label">
                            Please check your data
                        </div>
                    :null}
                    <button onClick={(event)=> submitForm(event)}>
                        Log in
                    </button>
                    <button 
                        style={{marginLeft:'10px'}}
                        onClick={()=> props.history.push('/reset_user') }>
                       Forgot my password
                    </button>


                </form>
            </div>
        );
    }


export default connect()(withRouter(Login));