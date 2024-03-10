import connect from "better-sqlite3";
import { join } from "path";

const connection = connect(join(__dirname, "../../database.db"));
connection.pragma("journal_mode = WAL");

export function execute(sql: string, ...values: any[]) {
	connection.prepare(sql).run(...values);
}

export function query(sql: string, ...values: any[]): unknown[] {
	return connection.prepare(sql).all(...values);
}