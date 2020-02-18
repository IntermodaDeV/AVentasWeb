import React, {Component} from 'react';

export default class Countdown extends Component {
	state = {
		seconds: 10
	}
	
	componentDidMount =() => {
		var seg = this.props.segundos;
		this.setState({
			seconds:seg,
		})
		this.interval = setInterval(() => {
			this.segundosCount()
		}, 1000);
	}

	segundosCount (){
		var segundos = parseInt(this.state.seconds);
		if(segundos===1){
			this.StopInterval();
			this.props.inactivo();
		}
		segundos = segundos -1;
		this.setState({
			seconds : segundos
		})
	}

StopInterval = () => {
  clearInterval(this.interval);
}

	componentWillUnmount() {
		if(this.interval) {
			clearInterval(this.interval);
		}
	}
	
	render() {
		const { seconds } = this.state;
		const secondsRadius = mapNumber(seconds, 60, 0, 0, 360);

		return (
			<div>
				<div className='countdown-wrapper'>
					{seconds && (
						<div className='countdown-item'>
							<SVGCircle radius={secondsRadius} />
							{seconds} 
							<span>{seconds===1?'segundo':'segundos'}</span>
						</div>
					)}
				</div>
			</div>
		);
	}
}

const SVGCircle = ({ radius }) => (
	<svg className='countdown-svg'>
		<path fill="none" stroke="#333" strokeWidth="4" d={describeArc(50, 50, 48, 0, radius)}/>
	</svg>
);

// From stackoverflow: https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
}

// Stackoverflow: https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
function mapNumber(number, in_min, in_max, out_min, out_max) {
  return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}