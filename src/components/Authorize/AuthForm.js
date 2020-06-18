import logo200Image from 'assets/img/logo/Logoinv.png';
import PropTypes from 'prop-types';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons'
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { ScaleLoader } from 'react-spinners';
import {APIURL} from 'utils/Enviroment';

class AuthForm extends React.Component {
  urlApi = APIURL;
  // urlApi="http://localhost:62630";

  state = {
    username: '',
    password: '',
    error: false,
    logged: false,
    loading: false,
  };

  get isLogin() {
    return this.props.authState === STATE_LOGIN;
  }

  get isSignup() {
    return this.props.authState === STATE_SIGNUP;
  }

  changeAuthState = authState => event => {
    event.preventDefault();
    this.props.onChangeAuthState(authState);
  };

  handleSubmit = event => {

    this.setState({ loading: true });
    event.preventDefault();
    fetch(this.urlApi + "/api/authentication", {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ 'UserAccount': this.state.username, 'Password': this.state.password })
    })
      .then(res => res.json())
      .then(
        (result) => {
          if (result.Message === 'Ok') {
            localStorage.setItem("asesor",this.state.username.toLowerCase());
            localStorage.setItem('token', result.Data.Token);
            localStorage.setItem('empresa', result.Data.Empresa);
            this.setState({ logged: true });
            window.location.reload();
          } else {
            this.setState({ error: true, loading: false });

          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            error: true
          });
        }
      )

  };
  usernameChange = (event) => {
    if (this.state.error) {
      this.setState({ username: event.target.value, error: false });
    } else {
      this.setState({ username: event.target.value });
    }
  }
  passwordChange = (event) => {
    if (this.state.error) {
      this.setState({ password: event.target.value, error: false });
    } else {
      this.setState({ password: event.target.value });
    }
  }
  renderButtonText() {
    const { buttonText } = this.props;

    if (!buttonText && this.isLogin) {
      return 'Login';
    }

    if (!buttonText && this.isSignup) {
      return 'Signup';
    }

    return buttonText;
  }

  render() {

    const {
      showLogo,
      usernameLabel,
      usernameInputProps,
      passwordLabel,
      passwordInputProps,
      confirmPasswordLabel,
      confirmPasswordInputProps,
      children,
      onLogoClick,
    } = this.props;
    const styleFormLogin = {
      // backgroundColor: '#153950',
      color: '#153950',
    };
    const styleInputFormLogin = {
      // backgroundColor: '#153950',
      color: '#153950',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottomStyle: 'solid',
      borderRadius: 'unset'
    };
    return (

      <Form onSubmit={this.handleSubmit} style={styleFormLogin}>
        {showLogo && (
          <div className="text-center pb-4 d-flex justify-content-center">
            <div style={{ maxWidth: 250, maxHeight: 65 }}>
              <img
                src={logo200Image}
                className="img-fluid"
                alt="logo"
                onClick={onLogoClick}
              />
            </div>
          </div>
        )}
        <FormGroup>
          {this.state.error ? <div style={{ color: 'red', textAlign: 'center' }}>Usuario o Contraseña Incorrectos</div> : null}

          <Label for={usernameLabel}>
            <FontAwesomeIcon icon={faUser} />
            {usernameLabel}
          </Label>
          <Input onChange={this.usernameChange.bind(this)} value={this.state.username} {...usernameInputProps} style={styleInputFormLogin} />
        </FormGroup>
        <FormGroup>
          <Label for={passwordLabel}>
            <FontAwesomeIcon icon={faLock} />
            {passwordLabel}
          </Label>
          <Input onChange={this.passwordChange.bind(this)} value={this.state.password} {...passwordInputProps} style={styleInputFormLogin} />
        </FormGroup>
        {this.isSignup && (
          <div>

            <FormGroup>
              <Label for={confirmPasswordLabel}>{confirmPasswordLabel}</Label>
              <Input {...confirmPasswordInputProps} />
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input type="checkbox" />{' '}
                {'Agree the terms and policy'}
              </Label>
            </FormGroup>
          </div>
        )}
        {/* <FormGroup check>
          <Label check>
            <Input type="checkbox" />{' '}
            {this.isSignup ? 'Agree the terms and policy' : 'Remember me'}
          </Label>
        </FormGroup> */}
        <hr />
        <Button
          size="lg"
          className="btn-danger"
          block
          disabled={this.state.loading}
          type="submit"
          onClick={this.handleSubmit}>

          {this.state.loading ?
            <ScaleLoader
              css={{ height: '30px', bottom: '5px', position: 'relative', transform: 'scale(0.8)' }}
              size={'20px'}
              color={'#fff'}
              loading={this.state.loading} /> : 'Iniciar'
          }

        </Button>

        {/* <div className="text-center pt-1">
          <h6>or</h6>
          <h6>
            {this.isSignup ? (
              <a href="#login" onClick={this.changeAuthState(STATE_LOGIN)}>
                Login
              </a>
            ) : (
                <a href="#signup" onClick={this.changeAuthState(STATE_SIGNUP)}>
                  Signup
              </a>
              )}
          </h6>
        </div> */}

        {children}
        {this.state.logged && <Redirect to='/agenda' />}
      </Form>
    );
  }
}

export const STATE_LOGIN = 'LOGIN';
export const STATE_SIGNUP = 'SIGNUP';

AuthForm.propTypes = {
  authState: PropTypes.oneOf([STATE_LOGIN, STATE_SIGNUP]).isRequired,
  showLogo: PropTypes.bool,
  usernameLabel: PropTypes.string,
  usernameInputProps: PropTypes.object,
  passwordLabel: PropTypes.string,
  passwordInputProps: PropTypes.object,
  confirmPasswordLabel: PropTypes.string,
  confirmPasswordInputProps: PropTypes.object,
  onLogoClick: PropTypes.func,
};

AuthForm.defaultProps = {
  authState: 'LOGIN',
  showLogo: true,
  usernameLabel: '  Usuario',
  usernameInputProps: {
    type: 'email',
    placeholder: 'Correo Electronico',
  },
  passwordLabel: '  Contraseña',
  passwordInputProps: {
    type: 'password',
    placeholder: 'Contraseña',
  },
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordInputProps: {
    type: 'password',
    placeholder: 'confirm your password',
  },
  onLogoClick: () => { },
};

export default AuthForm;
