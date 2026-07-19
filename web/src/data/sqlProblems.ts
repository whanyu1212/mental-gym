import customersWithoutOrders from "../../../src/sql/postgres/joins/customers_without_orders.sql?raw";
import latestEventPerDevice from "../../../src/sql/postgres/postgresql/latest_event_per_device.sql?raw";
import monthlyPaidRevenue from "../../../src/sql/sqlite/aggregation/monthly_paid_revenue.sql?raw";

export type SQLDialect = "postgres" | "sqlite";
export type SQLDifficulty = "Easy" | "Medium" | "Hard";

export interface SQLProblem {
	id: string;
	slug: string;
	title: string;
	difficulty: SQLDifficulty;
	category: string;
	tags: string[];
	dialect: SQLDialect;
	summary: string;
	prompt: string;
	hints: string[];
	solution: string;
	testFile: string;
	status: "Completed";
}

export const sqlProblems: SQLProblem[] = [
	{
		id: "SQL 01",
		slug: "customers-without-orders",
		title: "Customers Without Orders",
		difficulty: "Easy",
		category: "Joins",
		tags: ["postgresql", "left join", "null"],
		dialect: "postgres",
		summary:
			"Find every customer who has not placed an order, returning their ID and name in ID order.",
		prompt:
			"The tables below contain customers and their orders. Write a query that returns each customer with no matching order. Return customer_id and customer_name, ordered by customer_id.",
		hints: [
			"Start from customers so people with no orders remain candidates.",
			"After an outer join, unmatched values on the orders side are NULL.",
			"Use an explicit ORDER BY so the result has a stable order.",
		],
		solution: customersWithoutOrders,
		testFile: "src/sql/postgres/joins/customers_without_orders.test.sql",
		status: "Completed",
	},
	{
		id: "SQL 02",
		slug: "latest-event-per-device",
		title: "Latest Event Per Device",
		difficulty: "Medium",
		category: "PostgreSQL",
		tags: ["postgresql", "distinct on", "ordering"],
		dialect: "postgres",
		summary:
			"Use PostgreSQL's DISTINCT ON to select the most recent event for every device.",
		prompt:
			"Return one row per device: its device_id and the event_type from its latest event. If two events have the same timestamp, choose the one with the larger event_id. Sort the final result by device_id.",
		hints: [
			"DISTINCT ON keeps the first row in each ordered device_id group.",
			"The DISTINCT ON expression must lead the ORDER BY list.",
			"Add event_id DESC after the timestamp to make ties deterministic.",
		],
		solution: latestEventPerDevice,
		testFile: "src/sql/postgres/postgresql/latest_event_per_device.test.sql",
		status: "Completed",
	},
	{
		id: "SQL 03",
		slug: "monthly-paid-revenue",
		title: "Monthly Paid Revenue",
		difficulty: "Medium",
		category: "SQLite",
		tags: ["sqlite", "aggregation", "strftime"],
		dialect: "sqlite",
		summary:
			"Aggregate completed purchases by calendar month using SQLite date functions.",
		prompt:
			"Return the monthly revenue from paid purchases only. The result must contain month in YYYY-MM form and revenue_cents, ordered from earliest to latest month.",
		hints: [
			"Filter to paid purchases before grouping.",
			"SQLite's strftime can extract a YYYY-MM value from ISO-style timestamps.",
			"SUM returns the total for each group.",
		],
		solution: monthlyPaidRevenue,
		testFile: "src/sql/sqlite/aggregation/monthly_paid_revenue.test.sql",
		status: "Completed",
	},
];
