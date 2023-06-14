import React, { useEffect } from 'react'

const Loader = (props) => {

    useEffect(() => {

        if (props.interval > 600) {
            setTimeout(() => {
                let node = document.getElementById("SVGmator__2kz60s1569860161753");
                if (node !== null) {
                    Loop(props.interval);
                }
            }, props.interval / 2)
        }
        else {
            setTimeout(() => {
                let node = document.getElementById("SVGmator__2kz60s1569860161753");
                if (node !== null) {
                    Loop(props.interval);
                }
            }, props.interval)
        }

        // eslint-disable-next-line
    }, []);

    const Loop = (timeout) => {
        setTimeout(() => {
            let node = document.getElementById("SVGmator__2kz60s1569860161753");
            if (node !== null) {
                document.querySelector('#SVGmator__2kz60s1569860161753').contentWindow.postMessage('play', '*');
                Loop(props.interval);
            }
            else {
                return false;
            }
        }, timeout);
    }

    return (
        <div className="d-flex flex-grow-1 align-items-center justify-content-center">
            <div className="row">
                <div className="col-12 text-center">
                </div>
                <div className="col-12 text-center">
                    Cargando..
            </div>
            </div>

        </div>
    )
}

export default Loader;
