import reducer from './reducer'
import { createStore } from 'redux'
import { persistReducer } from 'redux-persist';
import localForage from 'localforage';

const persistConfig = {
    key: 'root',
    storage: localForage,
    // blacklist:['coleccion'],
}
const persistedReducer = persistReducer(persistConfig, reducer)
const store = createStore(persistedReducer);
export default store;
