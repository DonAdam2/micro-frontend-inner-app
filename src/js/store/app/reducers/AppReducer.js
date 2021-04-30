//action types
import { TEST_ACTION } from '../appActionTypes';
//constants
import { updateObject } from '../../../constants/Helpers';

const initialState = {
	innerTestString: 'Inner app initial test',
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case TEST_ACTION:
			return updateObject(state, { innerTestString: 'Inner app final test' });
		default:
			return state;
	}
};

export default reducer;
