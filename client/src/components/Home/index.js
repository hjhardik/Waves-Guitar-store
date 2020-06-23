import React, {useEffect } from 'react';
import HomeSlider from './home_slider';
import HomePromotion from './home_promotion'
import CardBlock from '../utils/card_block';

import { connect } from 'react-redux';
import { getProductsBySell, getProductsByArrival } from '../../actions/products_actions';

function Home(props) {
    useEffect(() => {
        props.dispatch(getProductsBySell()).then(()=>{
            console.log(props)
        });
        props.dispatch(getProductsByArrival());
    })
    return (
        <div>
            <HomeSlider/>
            <CardBlock
                list={props.products.bySell}
                title="Best Selling guitars"
            />
            <HomePromotion/>
            <CardBlock
                list={props.products.byArrival}
                title="New arrivals"
            />
        </div>
    );
}


const mapStateToProps = (state) => {
    return {
        products: state.products
    }
}

export default connect(mapStateToProps)(Home);