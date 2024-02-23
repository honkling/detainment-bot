import { Component, deserialize } from "./component";
import { Formatting } from "./formatting";

export class Logger {
	public log(component: string) {
		console.log(deserialize(component)
			.append(Component.formatting(Formatting.RESET))
			.toString());
	}

	public warning(component: string) {
		this.log(Component
			.formatting(Formatting.FG_YELLOW)
			.append(deserialize(component))
			.toString());
	}

	public error(component: string) {
		this.log(Component
			.formatting(Formatting.BG_RED)
			.append(deserialize(component))
			.toString());
	}
}

export const logger = new Logger();