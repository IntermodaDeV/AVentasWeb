import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";
import styles from 'components/Pedidos/ProductoDetalle/VistaProducto.module.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

const SliderFunction = (props) => {
    let slider1 = null;
    let slider2 = null;

    const [state, setState] = useState({
        nav1: null,
        nav2: null,
        imagenes: [],
        isInfinite: false,
        multipleImages: false,
    });


    const getImages = () => {
        let imagenes = [...props.ListaImagenes]
        return imagenes;
    }

    useEffect(() => {
        let imagenes = getImages()
        let isInfinite = false;
        let multipleImages = false;

        if (imagenes.length > 4) {
            isInfinite = true;
        }

        if (imagenes.length > 1) {
            multipleImages = true;
        }

        setState({
            nav1: slider1,
            nav2: slider2,
            imagenes: imagenes,
            isInfinite: isInfinite,
            multipleImages: multipleImages,
        });

        // eslint-disable-next-line
    }, [props.ListaImagenes]);

    let PrimaryCarouselSettings = {
        lazyLoad: true,
        fade: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        focusOnSelect: true,
        nextArrow: <PrimaryNextArrow />,
        prevArrow: <PrimaryPrevArrow />
    };

    let SecondaryCarouselSettings = {
        slidesToShow: 4,
        lazyLoad: true,
        slidesToScroll: 1,
        swipeToSlide: true,
        focusOnSelect: true,
        nextArrow: <SecondaryNextArrow />,
        prevArrow: <SecondaryPrevArrow />
    }

    if (state.isInfinite) {
        SecondaryCarouselSettings = { ...SecondaryCarouselSettings, infinite: true, }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-12">
                <Slider  {...PrimaryCarouselSettings}
                    asNavFor={state.nav2}
                    ref={slider => (slider1 = slider)}
                >
                    {
                        state.imagenes.map((imagen, index) => {
                            return (
                                <div key={index} className="w-100 row justify-content-center d-flex">
                                    <img className={styles.ImagenProducto} alt="foto" src={imagen.FotografiaProducto} />
                                </div>
                            );
                        })
                    }
                </Slider>
            </div>
            {
                state.multipleImages &&
                <div className="col-6 my-2">
                    <Slider   {...SecondaryCarouselSettings}
                        asNavFor={state.nav1}
                        ref={slider => (slider2 = slider)}
                    >
                        {
                            state.imagenes.map((imagen, index) => {
                                return (
                                    <div key={index} className='mx-2 w-auto'>
                                        <img className={styles.ImagenProductoSmall} alt="foto" src={imagen.FotografiaProducto} />
                                    </div>
                                );
                            })
                        }
                    </Slider>
                </div>
            }
        </div>
    )
}

export default SliderFunction;



const PrimaryNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <MdKeyboardArrowRight
            color={"#666"}
            className={className}
            style={{ ...style, display: "block" }}
            onClick={onClick}
        />
    );
}

const PrimaryPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <MdKeyboardArrowLeft
            color={"#666"}
            className={className}
            style={{ ...style, display: "block" }}
            onClick={onClick}
        />
    );
}

const SecondaryNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <IoIosArrowRoundForward
            color={"#666"}
            className={className}
            style={{ ...style, display: "block" }}
            onClick={onClick}
        />
    );
}

const SecondaryPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <IoIosArrowRoundBack
            color={"#666"}
            className={className}
            style={{ ...style, display: "block" }}
            onClick={onClick}
        />
    );
}