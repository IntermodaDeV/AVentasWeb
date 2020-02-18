import React, { useState } from "react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import Tour from "reactour";

const Guia = (props) => {
    const [isTourOpen, setIsTourOpen] = useState(false);
    const accentColor = props.Color;

    if (props.Node !== null) {
        props.Node.addEventListener("click", () => openTour());
    }

    const disableBody = target => disableBodyScroll(target);
    const enableBody = target => enableBodyScroll(target);

    const closeTour = () => {
        setIsTourOpen(false);
    };

    const openTour = () => {
        setIsTourOpen(true);
    };

    return (
        <Tour
            onRequestClose={closeTour}
            steps={props.Steps}
            isOpen={isTourOpen}
            maskClassName="mask"
            className="helper"
            rounded={5}
            startAt={props.startAt}
            accentColor={accentColor}
            onAfterOpen={disableBody}
            onBeforeClose={enableBody}
        />
    );
}

export default Guia;
