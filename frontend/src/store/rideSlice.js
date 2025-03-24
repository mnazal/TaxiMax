import { createSlice } from '@reduxjs/toolkit';

const rideSlice = createSlice({
  name: 'rides',
  initialState: {
    requests: [],
    error: null,
    loading: false
  },
  reducers: {
    addRideRequest: (state, action) => {
      state.requests = [action.payload, ...state.requests].slice(0, 10);
    },
    removeRideRequest: (state, action) => {
      state.requests = state.requests.filter(request => request.id !== action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { addRideRequest, removeRideRequest, setError, setLoading } = rideSlice.actions;
export default rideSlice.reducer;
