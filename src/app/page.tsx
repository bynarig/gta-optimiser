"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { CircleHelp } from "lucide-react";
import { Input } from "@/components/ui/input";
import GtaConfigEditor from "../components/GtaConfigEditor";
import {configSchema} from "@/validators/config.validator";

interface ConfigItem {
	value: boolean | number | string;
	type: "boolean" | "number" | "string" | "container";
	readonly?: boolean;
	originalValue?: boolean | number | string;
}
interface FlatConfig {
	[key: string]: ConfigItem;
}




function parseGtaConfigXml(xmlDoc: Document): FlatConfig {
	const config: FlatConfig = {};

	function processNode(node: Element, currentPath: Array<string>) {
		if (node.hasAttribute("value")) {
			const valueAttr = node.getAttribute("value");
			if (valueAttr !== null) {
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
			config[node.tagName] = {
				value: node.textContent,
				type: "string",
				readonly: true,
				originalValue: node.textContent,
			};
		} else {
			if (!config[currentPath.join(".")]) {
				config[currentPath.join(".")] = { value: "", type: "container" };
			}
		}

		Array.from(node.children).forEach((child) => {
			processNode(child, [...currentPath, child.tagName]);
		});
	}

	if (xmlDoc.documentElement) {
		Array.from(xmlDoc.documentElement.children).forEach((rootChild) => {
			processNode(rootChild, [rootChild.tagName]);
		});
	}

	return config;
}

function serializeGtaConfigToXml(
	flatConfig: FlatConfig,
	originalXmlString: string
): string {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(originalXmlString, "text/xml");

	for (const key in flatConfig) {
		if (Object.prototype.hasOwnProperty.call(flatConfig, key)) {
			const parts = key.split(".");
			let currentNode: Element | null = xmlDoc.documentElement;

			if (parts.length === 1 && parts[0] === "VideoCardDescription") {
				const videoCardDescElement = xmlDoc.querySelector(
					"VideoCardDescription"
				);
				if (videoCardDescElement) {
					videoCardDescElement.textContent = String(flatConfig[key].value);
				}
				continue;
			}

			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];
				if (currentNode) {
					const nextNode: Element | undefined = Array.from(
						currentNode.children
					).find((child) => child.tagName === part);
					if (!nextNode) {
						currentNode = null;
						break;
					}
					currentNode = nextNode;
				} else {
					break;
				}
			}

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

	const form = useForm<z.infer<typeof configSchema>>({
		resolver: zodResolver(configSchema),
		defaultValues: {
			configfile: undefined,
		},
	});

	function onSubmit(values: z.infer<typeof configSchema>) {
		const file = values.configfile;

		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => {
			const xmlString = e.target?.result;
			if (typeof xmlString !== "string") {
				form.setError("configfile", {
					type: "manual",
					message: "Could not read file content as text.",
				});
				setParsedConfig(null);
				setOriginalXmlContent(null);
				return;
			}

			setOriginalXmlContent(xmlString);

			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlString, "text/xml");

			// Check for parsing errors
			const errorNode = xmlDoc.querySelector("parsererror");
			if (errorNode) {
				form.setError("configfile", {
					type: "manual",
					message: "Invalid XML file format.",
				});
				setParsedConfig(null);
				setOriginalXmlContent(null);
			} else {
				const parsedData = parseGtaConfigXml(xmlDoc);
				setParsedConfig(parsedData);
			}
		};
		reader.onerror = () => {
			form.setError("configfile", {
				type: "manual",
				message: "Could not read file.",
			});
			setParsedConfig(null);
			setOriginalXmlContent(null);
		};
		reader.readAsText(file);
	}

	const handleSaveConfig = (updatedConfig: FlatConfig) => {
		if (!originalXmlContent) {
			return;
		}
		const newXmlString = serializeGtaConfigToXml(
			updatedConfig,
			originalXmlContent
		);

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
				<GtaConfigEditor config={parsedConfig} onSave={handleSaveConfig} />
			) : (
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
