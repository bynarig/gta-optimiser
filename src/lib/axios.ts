import type { AxiosError } from "axios";
import axios from "axios"; // Import AxiosError for better type hinting

const axiosInstance = axios.create({
	baseURL: "/api/",
	headers: {
		"Content-Type": "application/json",
	},
});

axiosInstance.interceptors.request.use(
	(config) => {
		return config;
	},
	// The error object from a request interceptor typically already extends Error
	(error: AxiosError) => {
		// Ensure the rejected value is an Error instance. Axios errors are already instances of Error.
		return Promise.reject(error);
	}
);

axiosInstance.interceptors.response.use(
	(response) => response,
	// The error object from a response interceptor is also typically an AxiosError
	async (error: AxiosError) => {
		// Ensure the rejected value is an Error instance.
		// No explicit wrapping is needed here as AxiosError extends Error.
		return Promise.reject(error);
	}
);

export default axiosInstance;
