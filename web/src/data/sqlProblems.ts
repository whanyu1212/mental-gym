import customersWithoutOrders from "../../../src/sql/postgres/joins/customers_without_orders.sql?raw";
import customersWithoutOrdersFixture from "../../../src/sql/postgres/joins/customers_without_orders.fixture.sql?raw";
import latestEventPerDevice from "../../../src/sql/postgres/postgresql/latest_event_per_device.sql?raw";
import latestEventPerDeviceFixture from "../../../src/sql/postgres/postgresql/latest_event_per_device.fixture.sql?raw";
import monthlyPaidRevenue from "../../../src/sql/sqlite/aggregation/monthly_paid_revenue.sql?raw";
import monthlyPaidRevenueFixture from "../../../src/sql/sqlite/aggregation/monthly_paid_revenue.fixture.sql?raw";
import secondHighestSalaryPerDepartment from "../../../src/sql/postgres/window-functions/second_highest_salary_per_department.sql?raw";
import secondHighestSalaryPerDepartmentFixture from "../../../src/sql/postgres/window-functions/second_highest_salary_per_department.fixture.sql?raw";
import employeesOutearningManagers from "../../../src/sql/postgres/joins/employees_outearning_managers.sql?raw";
import employeesOutearningManagersFixture from "../../../src/sql/postgres/joins/employees_outearning_managers.fixture.sql?raw";
import threeDayLoginStreak from "../../../src/sql/sqlite/window-functions/three_day_login_streak.sql?raw";
import threeDayLoginStreakFixture from "../../../src/sql/sqlite/window-functions/three_day_login_streak.fixture.sql?raw";

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
	fixture: string;
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
		fixture: customersWithoutOrdersFixture,
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
		fixture: latestEventPerDeviceFixture,
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
		fixture: monthlyPaidRevenueFixture,
		solution: monthlyPaidRevenue,
		testFile: "src/sql/sqlite/aggregation/monthly_paid_revenue.test.sql",
		status: "Completed",
	},
	{
		id: "SQL 04",
		slug: "second-highest-salary-per-department",
		title: "Second Highest Salary Per Department",
		difficulty: "Medium",
		category: "Window Functions",
		tags: ["postgresql", "dense_rank", "window function"],
		dialect: "postgres",
		summary:
			"Find the second-highest distinct salary within each department, handling ties correctly.",
		prompt:
			"Return the second-highest distinct salary in each department. If a department has fewer than two distinct salary values, it should not appear in the result. Ties for first place should not be double-counted as both first and second. Return department, employee_name, and salary_cents, ordered by department.",
		hints: [
			"ROW_NUMBER breaks ties arbitrarily — that's the wrong tool when two people can share first place.",
			"DENSE_RANK assigns the same rank to tied values and leaves no gap for the next rank.",
			"PARTITION BY department resets the ranking for every department independently.",
		],
		fixture: secondHighestSalaryPerDepartmentFixture,
		solution: secondHighestSalaryPerDepartment,
		testFile: "src/sql/postgres/window-functions/second_highest_salary_per_department.test.sql",
		status: "Completed",
	},
	{
		id: "SQL 05",
		slug: "employees-outearning-managers",
		title: "Employees Who Out-Earn Their Manager",
		difficulty: "Easy",
		category: "Joins",
		tags: ["postgresql", "self join"],
		dialect: "postgres",
		summary:
			"Self-join a single staff table against itself to compare each employee's salary with their manager's.",
		prompt:
			"Each row in staff optionally references another row in the same table as its manager. Return the names of employees whose salary is greater than their own manager's salary, ordered by name.",
		hints: [
			"Join the table to itself: one alias plays the employee, the other plays the manager.",
			"manager_id is nullable — employees with no manager can never match the join condition.",
			"Compare salary_cents between the two aliases after the join, not before.",
		],
		fixture: employeesOutearningManagersFixture,
		solution: employeesOutearningManagers,
		testFile: "src/sql/postgres/joins/employees_outearning_managers.test.sql",
		status: "Completed",
	},
	{
		id: "SQL 06",
		slug: "three-day-login-streak",
		title: "Users With a 3-Day Login Streak",
		difficulty: "Hard",
		category: "Window Functions",
		tags: ["sqlite", "gaps and islands", "cte", "window function"],
		dialect: "sqlite",
		summary:
			"Detect runs of 3+ consecutive calendar days per user using the gaps-and-islands technique.",
		prompt:
			"Given a log of login dates per user, return the distinct user_id values that logged in on at least 3 consecutive calendar days at some point. Non-consecutive logins do not count, even if there are 3 or more of them overall. Order the result by user_id.",
		hints: [
			"Number each user's logins in date order with ROW_NUMBER.",
			"For consecutive dates, (date - row number) is constant — that's the gaps-and-islands trick.",
			"Group by that constant per user and keep groups with at least 3 rows.",
		],
		fixture: threeDayLoginStreakFixture,
		solution: threeDayLoginStreak,
		testFile: "src/sql/sqlite/window-functions/three_day_login_streak.test.sql",
		status: "Completed",
	},
];
