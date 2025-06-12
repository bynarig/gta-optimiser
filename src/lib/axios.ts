import type { AxiosError } from "axios";
import axios from "axios";

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
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		return Promise.reject(error);
	}
);

export default axiosInstance;
