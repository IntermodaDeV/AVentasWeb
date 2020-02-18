import React from 'react';
import ReactDOM from 'react-dom';
import { i18n } from 'element-react'
import locale from 'element-react/src/locale/lang/es'
import { Provider } from 'react-redux'
import App from './App';
import * as serviceWorker from './serviceWorker';
import store from './store/store'

import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import 'element-theme-default';
// import hardSet from 'redux-persist/es/stateReconciler/hardSet';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
i18n.use(locale);

let persistor = persistStore(store)
ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <App />
            </MuiPickersUtilsProvider>
        </PersistGate>
    </Provider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();