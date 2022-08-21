import { defineConfig } from 'cypress';

export default defineConfig({
	codeCoverage: {
		url: "http://localhost:1337/__coverage__"
	},
	e2e: {
		video: false,
		setupNodeEvents(on, config){
			require('@cypress/code-coverage/task')(on, config)
			return config;
		}
	},
});
