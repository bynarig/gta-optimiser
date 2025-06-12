"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ConfigItem {
	value: boolean | number | string;
	type: "boolean" | "number" | "string" | "container";
	readonly?: boolean;
	originalValue?: boolean | number | string;
}

interface FlatConfig {
	[key: string]: ConfigItem;
}

interface GtaConfigEditorProps {
	config: FlatConfig;
	onSave: (updatedConfig: FlatConfig) => void;
}

const sectionMapping: { [key: string]: string } = {
	graphics: "Graphics Settings",
	system: "System Settings",
	audio: "Audio Settings",
	video: "Video Settings",
	VideoCardDescription: "Hardware Info",
	version: "General",
	configSource: "General",
};

interface SliderProps {
	min: number;
	max: number;
	step: number;
	readonly?: boolean;
}

interface SelectProps {
	options: Array<string>;
	labels?: Array<string>;
	readonly?: boolean;
}

interface InputProps {
	type: "number" | "text";
	readonly?: boolean;
}

interface SwitchProps {
	readonly?: boolean;
}

interface TextProps {
	readonly?: boolean;
}

type SettingProps =
	| SliderProps
	| SelectProps
	| InputProps
	| SwitchProps
	| TextProps;

interface SettingDefinition {
	label: string;
	component: "input" | "slider" | "switch" | "select" | "text";
	props?: SettingProps;
}

const settingDefinitions: {
	[key: string]: SettingDefinition;
} = {
	"graphics.Tessellation": {
		label: "Tessellation",
		component: "select",
		props: {
			options: ["0", "1", "2", "3"],
			labels: ["Off", "Normal", "High", "Ultra"],
		},
	},
	"graphics.LodScale": {
		label: "Level of Detail Scaling",
		component: "slider",
		props: { min: 0, max: 5, step: 0.01 },
	},
	"graphics.PedLodBias": {
		label: "Pedestrian LOD Bias",
		component: "slider",
		props: { min: -1, max: 1, step: 0.01 },
	},
	"graphics.VehicleLodBias": {
		label: "Vehicle LOD Bias",
		component: "slider",
		props: { min: -1, max: 1, step: 0.01 },
	},
	"graphics.ShadowQuality": {
		label: "Shadow Quality",
		component: "select",
		props: {
			options: ["0", "1", "2", "3"],
			labels: ["Off", "Normal", "High", "Ultra"],
		},
	},
	"graphics.ReflectionQuality": {
		label: "Reflection Quality",
		component: "select",
		props: {
			options: ["0", "1", "2", "3"],
			labels: ["Off", "Normal", "High", "Ultra"],
		},
	},
	"graphics.ReflectionMSAA": {
		label: "Reflection MSAA",
		component: "select",
		props: { options: ["0", "2", "4", "8"], labels: ["Off", "2x", "4x", "8x"] },
	},
	"graphics.SSAO": {
		label: "SSAO",
		component: "select",
		props: { options: ["0", "1", "2"], labels: ["Off", "Low", "High"] },
	},
	"graphics.AnisotropicFiltering": {
		label: "Anisotropic Filtering",
		component: "select",
		props: { options: ["0", "2", "4", "8", "16"] },
	},
	"graphics.MSAA": {
		label: "MSAA",
		component: "select",
		props: { options: ["0", "2", "4", "8"] },
	},
	"graphics.MSAAFragments": {
		label: "MSAA Fragments",
		component: "input",
		props: { type: "number", readonly: true },
	},
	"graphics.MSAAQuality": {
		label: "MSAA Quality",
		component: "input",
		props: { type: "number", readonly: true },
	},
	"graphics.SamplingMode": {
		label: "Sampling Mode",
		component: "input",
		props: { type: "number", readonly: true },
	},
	"graphics.TextureQuality": {
		label: "Texture Quality",
		component: "select",
		props: { options: ["0", "1", "2"], labels: ["Normal", "High", "Ultra"] },
	},
	"graphics.ParticleQuality": {
		label: "Particle Quality",
		component: "select",
		props: {
			options: ["-1", "0", "1", "2"],
			labels: ["Auto", "Normal", "High", "Ultra"],
		},
	},
	"graphics.WaterQuality": {
		label: "Water Quality",
		component: "select",
		props: {
			options: ["-1", "0", "1", "2"],
			labels: ["Auto", "Normal", "High", "Ultra"],
		},
	},
	"graphics.GrassQuality": {
		label: "Grass Quality",
		component: "select",
		props: { options: ["0", "1", "2"], labels: ["Normal", "High", "Ultra"] },
	},
	"graphics.ShaderQuality": {
		label: "Shader Quality",
		component: "select",
		props: { options: ["0", "1", "2"], labels: ["Normal", "High", "Ultra"] },
	},
	"graphics.Shadow_SoftShadows": {
		label: "Soft Shadows",
		component: "select",
		props: { options: ["0", "1", "2"], labels: ["Sharp", "Soft", "Softer"] },
	},
	"graphics.UltraShadows_Enabled": {
		label: "Ultra Shadows",
		component: "switch",
	},
	"graphics.Shadow_ParticleShadows": {
		label: "Particle Shadows",
		component: "switch",
	},
	"graphics.Shadow_Distance": {
		label: "Shadow Distance",
		component: "slider",
		props: { min: 0, max: 2, step: 0.01 },
	},
	"graphics.Shadow_LongShadows": { label: "Long Shadows", component: "switch" },
	"graphics.Shadow_SplitZStart": {
		label: "Shadow Split Z Start",
		component: "slider",
		props: { min: -5, max: 5, step: 0.01, readonly: true },
	},
	"graphics.Shadow_SplitZEnd": {
		label: "Shadow Split Z End",
		component: "slider",
		props: { min: -5, max: 5, step: 0.01, readonly: true },
	},
	"graphics.Shadow_aircraftExpWeight": {
		label: "Aircraft Exp. Weight",
		component: "slider",
		props: { min: -5, max: 5, step: 0.01, readonly: true },
	},
	"graphics.Shadow_DisableScreenSizeCheck": {
		label: "Disable Screen Size Check",
		component: "switch",
		props: { readonly: true },
	},
	"graphics.Reflection_MipBlur": {
		label: "Reflection Mip Blur",
		component: "switch",
	},
	"graphics.FXAA_Enabled": { label: "FXAA Enabled", component: "switch" },
	"graphics.TXAA_Enabled": { label: "TXAA Enabled", component: "switch" },
	"graphics.Lighting_FogVolumes": {
		label: "Lighting Fog Volumes",
		component: "switch",
	},
	"graphics.Shader_SSA": { label: "Shader SSA", component: "switch" },
	"graphics.DX_Version": {
		label: "DirectX Version",
		component: "text",
		props: { readonly: true },
	},
	"graphics.CityDensity": {
		label: "City Density",
		component: "slider",
		props: { min: 0, max: 1, step: 0.01 },
	},
	"graphics.PedVarietyMultiplier": {
		label: "Pedestrian Variety Multiplier",
		component: "slider",
		props: { min: -10, max: 10, step: 0.1 },
	},
	"graphics.VehicleVarietyMultiplier": {
		label: "Vehicle Variety Multiplier",
		component: "slider",
		props: { min: -10, max: 10, step: 0.1 },
	},
	"graphics.PostFX": {
		label: "Post FX",
		component: "select",
		props: { options: ["0", "1", "2"], labels: ["Off", "Normal", "High"] },
	},
	"graphics.DoF": { label: "Depth of Field", component: "switch" },
	"graphics.HdStreamingInFlight": {
		label: "HD Streaming In Flight",
		component: "switch",
	},
	"graphics.MaxLodScale": {
		label: "Max LOD Scale",
		component: "slider",
		props: { min: -1, max: 1, step: 0.01 },
	},
	"graphics.MotionBlurStrength": {
		label: "Motion Blur Strength",
		component: "slider",
		props: { min: 0, max: 1, step: 0.01 },
	},

	"system.numBytesPerReplayBlock": {
		label: "Bytes Per Replay Block",
		component: "text",
		props: { readonly: true },
	},
	"system.numReplayBlocks": {
		label: "Number of Replay Blocks",
		component: "text",
		props: { readonly: true },
	},
	"system.maxSizeOfStreamingReplay": {
		label: "Max Streaming Replay Size",
		component: "text",
		props: { readonly: true },
	},
	"system.maxFileStoreSize": {
		label: "Max File Store Size",
		component: "text",
		props: { readonly: true },
	},

	"audio.Audio3d": { label: "3D Audio", component: "switch" },

	"video.AdapterIndex": {
		label: "Adapter Index",
		component: "text",
		props: { readonly: true },
	},
	"video.OutputIndex": {
		label: "Output Index",
		component: "text",
		props: { readonly: true },
	},
	"video.ScreenWidth": {
		label: "Screen Width",
		component: "text",
		props: { readonly: true },
	},
	"video.ScreenHeight": {
		label: "Screen Height",
		component: "text",
		props: { readonly: true },
	},
	"video.RefreshRate": {
		label: "Refresh Rate",
		component: "text",
		props: { readonly: true },
	},
	"video.Windowed": {
		label: "Window Mode",
		component: "select",
		props: {
			options: ["0", "1", "2"],
			labels: ["Fullscreen", "Windowed", "Borderless Windowed"],
		},
	},
	"video.VSync": {
		label: "V-Sync",
		component: "select",
		props: { options: ["0", "1", "2"], labels: ["Off", "On", "Half"] },
	},
	"video.Stereo": {
		label: "Stereo",
		component: "text",
		props: { readonly: true },
	},
	"video.Convergence": {
		label: "Convergence",
		component: "slider",
		props: { min: 0, max: 1, step: 0.001 },
	},
	"video.Separation": {
		label: "Separation",
		component: "slider",
		props: { min: -2, max: 2, step: 0.001 },
	},
	"video.PauseOnFocusLoss": {
		label: "Pause On Focus Loss",
		component: "switch",
	},
	"video.AspectRatio": {
		label: "Aspect Ratio",
		component: "select",
		props: {
			options: ["0", "1", "2", "3", "4"],
			labels: ["Auto", "4:3", "5:4", "16:9", "16:10"],
		},
	},

	VideoCardDescription: {
		label: "Video Card",
		component: "text",
		props: { readonly: true },
	},
	version: { label: "Version", component: "text", props: { readonly: true } },
	configSource: {
		label: "Config Source",
		component: "text",
		props: { readonly: true },
	},
};

const GtaConfigEditor: React.FC<GtaConfigEditorProps> = ({


	config,
	onSave,
}) => {
	const [editedConfig, setEditedConfig] = useState<FlatConfig>(config);

	useEffect(() => {
		setEditedConfig(config);
	}, [config]);

	const handleValueChange = useCallback(
		(key: string, newValue: ConfigItem["value"]) => {
			setEditedConfig((prevConfig) => ({
				...prevConfig,
				[key]: {
					...prevConfig[key],
					value: newValue,
				},
			}));
		},
		[]
	);

	const groupedSettings = Object.keys(editedConfig).reduce(
		(acc, key) => {
			const rootSection = key.split(".")[0];
			const groupName = sectionMapping[rootSection] || "Other Settings";
			if (!acc[groupName]) {
				acc[groupName] = [];
			}
			const definition = settingDefinitions[key];
			if (definition && editedConfig[key].type !== "container") {
				if (!definition.props?.readonly || definition.component === "text") {
					acc[groupName].push(key);
				}
			} else if (!definition && editedConfig[key].type !== "container") {
				acc[groupName].push(key);
			}
			return acc;
		},
		{} as { [group: string]: Array<string> }
	);

	const renderSettingControl = (key: string, item: ConfigItem) => {
		const definition = settingDefinitions[key];
		const isDisabled: boolean =
			(definition?.props &&
				"readonly" in definition.props &&
				definition.props.readonly) ||
			false;

		if (!definition || (isDisabled && definition.component !== "text")) {
			return (
				<div
					key={key}
					className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
				>
					<Label
						htmlFor={key}
						className="text-sm font-medium capitalize text-foreground"
					>
						{key
							.split(".")
							.pop()
							?.replace(/([A-Z])/g, " $1")
							.trim()}
						:
					</Label>
					<span className="text-sm text-muted-foreground">
						{String(item.value)}
					</span>
				</div>
			);
		}

		switch (definition.component) {
			case "switch": {
				const switchProps = definition.props as SwitchProps | undefined;
				return (
					<div
						key={key}
						className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
					>
						<Label
							htmlFor={key}
							className="text-sm font-medium text-foreground"
						>
							{definition.label}
						</Label>
						<Switch
							id={key}
							checked={Boolean(item.value)}
							onCheckedChange={(checked: boolean) => {
								handleValueChange(key, checked);
							}}
							disabled={isDisabled || switchProps?.readonly || false}
						/>
					</div>
				);
			}
			case "slider": {
				const sliderProps = definition.props as SliderProps;
				return (
					<div
						key={key}
						className="py-2 border-b border-border last:border-b-0"
					>
						<Label
							htmlFor={key}
							className="text-sm font-medium block mb-2 text-foreground"
						>
							{definition.label}:{" "}
							<span className="font-normal text-muted-foreground">
								{(item.value as number).toFixed(
									sliderProps.step === 0.01 ? 2 : 0
								)}
							</span>
						</Label>
						<Slider
							id={key}
							min={sliderProps.min}
							max={sliderProps.max}
							step={sliderProps.step}
							value={[item.value as number]}
							onValueChange={(val: Array<number>) => {
								handleValueChange(key, val[0]);
							}}
							className="w-full"
							disabled={isDisabled || sliderProps.readonly || false}
						/>
					</div>
				);
			}
			case "select": {
				const selectProps = definition.props as SelectProps;
				return (
					<div
						key={key}
						className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
					>
						<Label
							htmlFor={key}
							className="text-sm font-medium text-foreground"
						>
							{definition.label}
						</Label>
						<Select
							value={String(item.value)}
							onValueChange={(val: string) => {
								handleValueChange(
									key,
									item.type === "number" ? Number(val) : val
								);
							}}
							disabled={isDisabled || selectProps.readonly || false}
						>
							<SelectTrigger
								id={key}
								className="w-[180px] bg-input text-foreground border-border backdrop-blur-2xl backdrop-saturate-150"
							>
								<SelectValue placeholder={definition.label} />
							</SelectTrigger>
							<SelectContent className="bg-popover text-popover-foreground border-border backdrop-blur-2xl backdrop-saturate-150">
								{selectProps.options.map((option: string, index: number) => (
									<SelectItem
										key={option}
										value={option}
										className="hover:bg-accent hover:text-accent-foreground"
									>
										{selectProps.labels ? selectProps.labels[index] : option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				);
			}
			case "text": {
				const textProps = definition.props as TextProps | undefined;
				return (
					<div
						key={key}
						className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
					>
						<Label className="text-sm font-medium text-foreground">
							{definition.label}:
						</Label>
						<span className="text-sm text-muted-foreground">
							{String(item.value)}
						</span>
					</div>
				);
			}
			case "input":
			default: {
				const inputProps = definition.props as InputProps | undefined;
				return (
					<div
						key={key}
						className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
					>
						<Label
							htmlFor={key}
							className="text-sm font-medium text-foreground"
						>
							{definition.label}
						</Label>
						<Input
							id={key}
							type={inputProps?.type || "text"}
							value={String(item.value)}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								handleValueChange(
									key,
									item.type === "number"
										? Number(e.target.value)
										: e.target.value
								);
							}}
							className="w-1/2 bg-input text-foreground border-border backdrop-blur-2xl backdrop-saturate-150"
							readOnly={isDisabled || inputProps?.readonly || false}
						/>
					</div>
				);
			}
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-card text-card-foreground rounded-lg shadow-xl border border-border backdrop-blur-2xl backdrop-saturate-150">
			<h2 className="text-3xl font-semibold text-center mb-6 text-foreground">
				Edit GTA Config
			</h2>

			<div className="space-y-6">
				{Object.keys(groupedSettings)
					.sort()
					.map((groupName) => (
						<Card
							key={groupName}
							className="bg-card text-card-foreground border-border backdrop-blur-2xl backdrop-saturate-150"
						>
							<CardHeader>
								<CardTitle className="text-xl font-bold text-foreground">
									{groupName}
								</CardTitle>
								<CardDescription className="text-muted-foreground">
									Adjust settings related to{" "}
									{groupName.toLowerCase().replace(" settings", "")}.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{groupedSettings[groupName]
									.sort()
									.map((key) => renderSettingControl(key, editedConfig[key]))}
							</CardContent>
						</Card>
					))}
			</div>

			<div className="mt-8 flex justify-center gap-4">
				<Button
					onClick={() => {
						onSave(editedConfig);
					}}
					className="py-3 px-8 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				>
					Download Optimized Config
				</Button>
			</div>
		</div>
	);
};

export default GtaConfigEditor;
