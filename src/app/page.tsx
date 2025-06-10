"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { CircleHelp } from "lucide-react";
// import axiosInstance from "@/lib/axios"; // Not used in the provided snippet, so commented out.
import { Input } from "@/components/ui/input";
import GtaConfigEditor from "./GtaConfigEditor";

// Define the structure for a config item, used in the flattened state
interface ConfigItem {
	value: boolean | number | string;
	type: "boolean" | "number" | "string" | "container";
	readonly?: boolean;
	originalValue?: boolean | number | string;
}

// Define the type for the entire flattened configuration object
interface FlatConfig {
	[key: string]: ConfigItem;
}

const MAX_FILE_SIZE = 500000; // 0.5MB
const ACCEPTED_FILE_TYPES = ["text/xml", "application/xml"];

const formSchema = z.object({
	configfile: z
		.instanceof(File)
		.refine((file) => file.size <= MAX_FILE_SIZE, {
			message: "File size must be less than 0.5MB",
		})
		.refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
			message: "Only .xml files are accepted",
		}),
});

/**
 * Helper function to parse XML to a flattened JavaScript object.
 * This function flattens the XML structure into key-value pairs
 * where keys are dot-separated paths (e.g., "graphics.Tessellation")
 * and values are objects containing the parsed value and its inferred type.
 * @param xmlDoc The XML Document to parse.
 * @returns A flattened configuration object.
 */
function parseGtaConfigXml(xmlDoc: Document): FlatConfig {
	const config: FlatConfig = {};

	// Recursive function to process each XML node
	function processNode(node: Element, currentPath: Array<string>) {
		// If the node has a 'value' attribute, extract it
		if (node.hasAttribute("value")) {
			const valueAttr = node.getAttribute("value");
			if (valueAttr !== null) {
				// Infer type for correct UI component rendering (boolean, number, string)
				let parsedValue: boolean | number | string;
				let inferredType: "boolean" | "number" | "string";

				if (valueAttr === "true" || valueAttr === "false") {
					parsedValue = valueAttr === "true";
					inferredType = "boolean";
				} else if (!isNaN(Number(valueAttr)) && valueAttr.trim() !== "") {
					parsedValue = Number(valueAttr);
					inferredType = "number";
				} else {
					parsedValue = valueAttr;
					inferredType = "string";
				}
				config[currentPath.join(".")] = {
					value: parsedValue,
					type: inferredType,
					originalValue: parsedValue,
				};
			}
		} else if (
			node.tagName === "VideoCardDescription" &&
			node.textContent !== null
		) {
			// Special handling for VideoCardDescription, which is a direct child with text content
			config[node.tagName] = {
				value: node.textContent,
				type: "string",
				readonly: true,
				originalValue: node.textContent,
			};
		} else {
			// For container elements like <graphics>, <system>, <audio>, <video>
			// Ensure container objects are only created once if they don't exist
			if (!config[currentPath.join(".")]) {
				config[currentPath.join(".")] = { value: "", type: "container" }; // Value is not relevant for containers
			}
		}

		// Recursively process child elements
		Array.from(node.children).forEach((child) => {
			processNode(child, [...currentPath, child.tagName]);
		});
	}

	// Start processing from the direct children of the root <Settings> element
	if (xmlDoc.documentElement) {
		Array.from(xmlDoc.documentElement.children).forEach((rootChild) => {
			processNode(rootChild, [rootChild.tagName]);
		});
	}

	return config;
}

/**
 * Helper function to serialize the flattened JavaScript object back to an XML string.
 * It updates an original XML string with the new values from the flattened configuration.
 * @param flatConfig The flattened configuration object with updated values.
 * @param originalXmlString The original XML content string.
 * @returns The updated XML content as a string.
 */
function serializeGtaConfigToXml(
	flatConfig: FlatConfig,
	originalXmlString: string
): string {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(originalXmlString, "text/xml");

	// Iterate over the flattened config to update values in the DOM
	for (const key in flatConfig) {
		// Ensure the property belongs to the object and is not inherited
		if (Object.prototype.hasOwnProperty.call(flatConfig, key)) {
			const parts = key.split(".");
			let currentNode: Element | null = xmlDoc.documentElement; // Start from root <Settings>

			// Handle direct children of the root <Settings> that have text content (like VideoCardDescription)
			if (parts.length === 1 && parts[0] === "VideoCardDescription") {
				const videoCardDescElement = xmlDoc.querySelector(
					"VideoCardDescription"
				);
				if (videoCardDescElement) {
					videoCardDescElement.textContent = String(flatConfig[key].value);
				}
				continue; // Move to the next key in flatConfig
			}

			// Traverse the DOM tree to find the target element
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];
				if (currentNode) {
					// Find the child element with the matching tag name
					// Explicitly type nextNode here
					const nextNode: Element | undefined = Array.from(
						currentNode.children
					).find((child) => child.tagName === part);
					if (!nextNode) {
						currentNode = null; // Path not found in the original XML structure
						break;
					}
					currentNode = nextNode;
				} else {
					break; // Parent node was not found, breaking the path
				}
			}

			// If the element is found and has a 'value' attribute, update it
			if (currentNode && currentNode.hasAttribute("value")) {
				let valueToSet: string | number | boolean = flatConfig[key].value;
				if (typeof valueToSet === "boolean") {
					valueToSet = valueToSet ? "true" : "false";
				}
				currentNode.setAttribute("value", String(valueToSet));
			}
		}
	}

	const serializer = new XMLSerializer();
	const updatedXmlString = serializer.serializeToString(xmlDoc);

	// Add XML declaration if it's missing (DOMParser often omits it in serialized output)
	if (!updatedXmlString.startsWith("<?xml")) {
		return `<?xml version="1.0" encoding="UTF-8"?>\n${updatedXmlString}`;
	}
	return updatedXmlString;
}

export default function WelcomePage(): ReactElement {
	const [parsedConfig, setParsedConfig] = useState<FlatConfig | null>(null);
	const [originalXmlContent, setOriginalXmlContent] = useState<string | null>(
		null
	);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			configfile: undefined,
		},
	});

	// This function is called when the user submits the file
	function onSubmit(values: z.infer<typeof formSchema>) {
		const file = values.configfile;

		// Read the file content as text
		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => {
			const xmlString = e.target?.result;
			if (typeof xmlString !== "string") {
				console.error("FileReader did not return a string result.");
				form.setError("configfile", {
					type: "manual",
					message: "Could not read file content as text.",
				});
				setParsedConfig(null);
				setOriginalXmlContent(null);
				return;
			}

			setOriginalXmlContent(xmlString); // Store original content for serialization

			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlString, "text/xml");

			// Check for parsing errors
			const errorNode = xmlDoc.querySelector("parsererror");
			if (errorNode) {
				console.error("Error parsing XML:", errorNode.textContent);
				form.setError("configfile", {
					type: "manual",
					message: "Invalid XML file format.",
				});
				setParsedConfig(null);
				setOriginalXmlContent(null);
			} else {
				const parsedData = parseGtaConfigXml(xmlDoc);
				setParsedConfig(parsedData);
				console.log("Parsed GTA Config:", parsedData);
			}
		};
		reader.onerror = () => {
			console.error("Error reading file");
			form.setError("configfile", {
				type: "manual",
				message: "Could not read file.",
			});
			setParsedConfig(null);
			setOriginalXmlContent(null);
		};
		reader.readAsText(file);
	}

	// This function is called by the GtaConfigEditor when the user wants to save
	const handleSaveConfig = (updatedConfig: FlatConfig) => {
		if (!originalXmlContent) {
			console.error("Original XML content not available for serialization.");
			return;
		}
		const newXmlString = serializeGtaConfigToXml(
			updatedConfig,
			originalXmlContent
		);
		console.log("Optimized XML:\n", newXmlString);

		// Here, you could send the newXmlString to a server, or trigger a download
		// For now, let's trigger a download directly.
		const blob = new Blob([newXmlString], { type: "text/xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "optimized_settings.xml";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="flex flex-col items-center w-full min-h-screen p-4  text-gray-900 dark:text-gray-50">
			<div className="text-4xl font-bold mt-[20px] text-center">
				<span>Optimise your GTA configs with ease</span>
			</div>

			{parsedConfig ? (
				// If config is parsed, show the editor
				<GtaConfigEditor config={parsedConfig} onSave={handleSaveConfig} />
			) : (
				// Otherwise, show the file upload form
				<div className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="configfile"
								render={({ field: { value, onChange, ...fieldProps } }) => (
									<FormItem>
										<FormLabel className="text-lg">
											Upload Config File
										</FormLabel>
										<FormControl>
											<div className="flex items-center gap-4">
												<Input
													{...fieldProps}
													type="file"
													className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
													accept=".xml,text/xml,application/xml"
													onChange={(
														event: React.ChangeEvent<HTMLInputElement>
													) => {
														const file = event.target.files?.[0];
														onChange(file || undefined);
													}}
												/>
												<CircleHelp
													className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-500"
													size={24}
												/>
											</div>
										</FormControl>
										<FormMessage className="text-red-500" />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
							>
								Load Config
							</Button>
						</form>
					</Form>
				</div>
			)}
		</div>
	);
}
