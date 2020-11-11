import React from "react";
import Slider from "react-slick";
import Producto from "components/Pedidos/ProductoDetalle/RelatedProduct";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";


const Carousel = (props) => {
    const settings = {
        infinite: false,
        lazyLoad: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        nextArrow: <PrimaryNextArrow />,
        prevArrow: <PrimaryPrevArrow />,
        responsive: [
            {
                breakpoint: 1124,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    const checkCurrent = (producto) => {
        if (producto.ProductoId === props.producto.ProductoId) {
            localStorage.setItem("PosicionProducto", props.producto.$id)
            return true
        }
        else {
            return false
        }
    }

    if (props.ListaProductos) {
        function sortByNum(a, b) {
            const diff = localStorage.getItem('PosicionProducto') - b.$id;
            return -1 * diff;
        }
        let ListaProductos = props.ListaProductos.sort((a, b) => sortByNum(a, b))

        return (
            <Slider {...settings}>
                {
                    ListaProductos.map((product, index) => {
                        return (
                            <div className={"px-3"}
                                key={index}>
                                <Producto
                                    index={index}
                                    length={props.ListaProductos.length}
                                    producto={product}
                                    current={checkCurrent(product)}
                                    Click={props.Click.bind(this, product)}
                                ></Producto>
                            </div>
                        )
                    })
                }

            </Slider >
        )
    }

    return null;

}


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

export default Carousel;