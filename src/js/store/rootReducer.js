import { combineReducers } from 'redux';
//slices
import app from './app/reducers/AppReducer';

export const reducerSlices = {
	innerApp: app,
};

const rootReducer = combineReducers(reducerSlices);

export default rootReducer;
