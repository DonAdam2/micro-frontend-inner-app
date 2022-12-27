import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  innerTestString: 'Inner app initial test',
};

const appSlice = createSlice({
  name: 'innerApp',
  initialState,
  reducers: {
    updateTestString: (state) => {
      state.innerTestString = 'Inner app final test';
    },
  },
});

export const { updateTestString } = appSlice.actions;
export default appSlice.reducer;
