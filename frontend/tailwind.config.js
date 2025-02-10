import daisyui from "daisyui";
import daisyUIThemes from "daisyui/src/theming/themes";
/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				redAccent: "#B22234", // Deep red
				blueAccent: "#3C3B6E", // Navy blue
			},
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				patriotic: {
					primary: "#B22234", // Red
					secondary: "#3C3B6E", // Blue
					accent: "#B22234", // Red accents
					neutral: "#3C3B6E", // Blue neutral
					"base-100": "#FFF5E1", // Light cream background
					info: "#3C3B6E",
					success: "#B22234",
					warning: "#FFD700",
					error: "#DC143C",
				},
			},
		],
	},
};
