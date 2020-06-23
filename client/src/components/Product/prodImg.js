import React, { useState, useEffect } from 'react';
import ImageLightBox from '../utils/lightbox';


function ProdImg(props) {
    const [lightbox, setLightbox] = useState(false);
    const [imagePos, setImagePos] = useState(0);
    const [lightboxImages, setLightboxImages] = useState([])
    
    useEffect(() => {
        if(props.detail.images.length > 0){
            let lightboxImages = [];

            props.detail.images.forEach(item=>{
                lightboxImages.push(item.url)
            })

            setLightboxImages(lightboxImages);
        }
    })


    handleLightBox = (pos) => {
        if(lightboxImages.length > 0){
            setLightbox(true);
            setImagePos(pos);         
        }
    }

    handleLightBoxClose = () => {
        setLightbox(false)
    }


    showThumbs = () => (
        lightboxImages.map((item,i)=>(
            i > 0 ?
                <div
                    key={i}
                    onClick={()=> handleLightBox(i)}
                    className="thumb"
                    style={{background: `url(${item}) no-repeat`}}
                ></div>
            :null
        ))
    )


    renderCardImage = (images) => {
        if(images.length > 0){
            return images[0].url
        }else{
            return `/images/image_not_availble.png`
        }
    }

        const {detail} = props;
        return (
            <div className="product_image_container">
                <div className="main_pic">
                    <div
                        style={{background:`url(${renderCardImage(detail.images)}) no-repeat`}} 
                        onClick={()=> handleLightBox(0)}
                    >
                    </div>
                </div>
                <div className="main_thumbs">
                    { showThumbs(detail)}
                </div>
                {
                    lightbox ?
                        <ImageLightBox
                            id={detail.id}
                            images={lightboxImages}
                            open={open}
                            pos={imagePos}
                            onclose={()=> handleLightBoxClose()}
                        />
                    :null
                }
            </div>
        );
    }

export default ProdImg;