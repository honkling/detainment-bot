export class StringBuilder {
	private output = "";

	public append(value: any): StringBuilder {
		this.output += `${value}`;
		return this;
	}

	public toString(): string {
		return this.output;
	}
}