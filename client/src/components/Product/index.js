import React, { Component, useEffect } from 'react';
import PageTop from '../utils/page_top';

import ProdNfo from './prodNfo';
import ProdImg from './prodImg';

import { connect } from 'react-redux';
import { addToCart } from '../../actions/user_actions';
import { getProductDetail, clearProductDetail } from '../../actions/products_actions';

function ProductPage(props) {

    useEffect(() => {
        const id = props.match.params.id;
        props.dispatch(getProductDetail(id)).then(()=>{
            if(!props.products.prodDetail){
                props.history.push('/');
            }
        })
        return(
            props.dispatch(clearProductDetail())
        )
    });

    function addToCartHandler(id){
        props.dispatch(addToCart(id))
    }
    
        return (
            <div>
                <PageTop
                    title="Product detail"
                />
                <div className="container">
                {
                    props.products.prodDetail ?
                    <div className="product_detail_wrapper">
                        <div className="left">
                            <div style={{width:'500px'}}>
                                <ProdImg
                                    detail={props.products.prodDetail}
                                />
                            </div>
                        </div>
                        <div className="right">
                            <ProdNfo
                                addToCart={(id)=> addToCartHandler(id)}
                                detail={props.products.prodDetail}
                            />
                        </div>
                    </div>
                    : 'Loading'
                }

                </div>                
            </div>
        );
    };


const mapStateToProps = (state) => {
    return {
        products: state.products
    }
}

export default connect(mapStateToProps)(ProductPage);