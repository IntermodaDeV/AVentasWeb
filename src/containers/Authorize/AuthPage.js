import AuthForm, { STATE_LOGIN } from 'components/Authorize/AuthForm';
import React from 'react';
import { Card, Col, Row } from 'reactstrap';

class AuthPage extends React.Component {
  handleAuthState = authState => {
    if (authState === STATE_LOGIN) {
      this.props.history.push('/login');
    } else {
      this.props.history.push('/signup');
    }
  };

  handleLogoClick = () => {
    this.props.history.push('/');
  };
  render() {
    const styleBody = {
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      // backgroundColor: '#153950',
      backgroundColor:'#243746',
      // backgroundImage:'linear-gradient(to left, #4CA1AF, #2C3E50)',  /* Chrome 10-25, Safari 5.1-6 */
      backgroundImage: '#243746'//'linear-gradient(to left, #64c4ee, #2C3E50)' /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */,

    };
    return (
      <Row
        style={styleBody}>
        <Col md={6} lg={4}>
          <Card body>
            <AuthForm
              history={this.props.history}
              authState={this.props.authState}
              onChangeAuthState={this.handleAuthState}
              onLogoClick={this.handleLogoClick}
            />
          </Card>
        </Col>
      </Row>
    );
  }
}

export default AuthPage;
