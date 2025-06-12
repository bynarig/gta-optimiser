import {z} from "zod";


const MAX_FILE_SIZE = 500000; // 0.5MB
const ACCEPTED_FILE_TYPES = ["text/xml", "application/xml"];


export const configSchema = z.object({
	configfile: z
		.instanceof(File)
		.refine((file) => file.size <= MAX_FILE_SIZE, {
			message: "File size must be less than 0.5MB",
		})
		.refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
			message: "Only .xml files are accepted",
		}),
});