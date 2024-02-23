import { StringBuilder } from "./builder";
import { Formatting } from "./formatting";

export class Component {
	public componentText = "";
	public componentFormatting: Formatting | null = null;
	public children = [] as Component[];

	private constructor() {}

	public static text(text: string) {
		return new Component().text(text);
	}

	public static formatting(formatting: Formatting) {
		return new Component().formatting(formatting);
	}

	public static empty() {
		return new Component();
	}

	public text(text: string): Component {
		this.componentText = text;
		return this;
	}

	public formatting(formatting: Formatting): Component {
		this.componentFormatting = formatting;
		return this;
	}

	public append(component: Component): Component {
		this.children.push(component);
		return this;
	}

	public toString(): string {
		const builder = new StringBuilder();

		if (this.componentFormatting !== null)
			builder.append(`\x1b[${this.componentFormatting}m`);

		builder.append(this.componentText);

		for (const child of this.children)
			builder.append(child.toString());

		return builder.toString();
	}
}

export function deserialize(message: string, index: number = 0): Component {
	const component = Component.empty();
	let streamIndex = 0;

	if (message.startsWith("<")) {
		const code = new StringBuilder();

		streamIndex++;
		while (streamIndex < message.length && message[streamIndex] !== ">") {
			code.append(message[streamIndex]);
			streamIndex++;
		}

		if (message[streamIndex] !== ">")
			throw new Error(`Unclosed tag at index ${index}`);

		streamIndex++;
		const formatting = Formatting[code.toString().toUpperCase()];

		if (formatting === undefined)
			throw new Error(`Invalid tag <${code.toString()}>`);

		component.formatting(formatting);
	}

	let text = new StringBuilder();

	while (streamIndex < message.length && message[streamIndex] !== "<") {
		text.append(message[streamIndex]);
		streamIndex++;
	}

	component.text(text.toString());

	if (message[streamIndex] === "<")
		component.append(deserialize(message.substring(streamIndex), streamIndex));

	return component;
}