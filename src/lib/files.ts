import { readdirSync, statSync } from "fs";
import { join } from "path";

export async function loadFiles(path: string): Promise<any[]> {
	const files = [];

	for (const name of readdirSync(path)) {
		const file = join(path, name);

		if (statSync(file).isFile())
			files.push(await import(file));
		else files.push(...await loadFiles(file));
	}

	return files;
}