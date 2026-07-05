// @vitest-environment node
//
// SQL execution module — the one PGLite orchestrator. Runs real PGLite in node,
// same engine the browser workspace uses, so boot/run/teardown are validated
// against the real thing rather than a mock.

import { describe, it, expect } from "vitest";
import { SqlExecutionEngine } from "./sqlEngine";

describe("SqlExecutionEngine", () => {
  it("boots, seeds, and runs a query", async () => {
    const engine = new SqlExecutionEngine();
    const bootResult = await engine.boot({
      schemaSql: "CREATE TABLE t (id int, name text);",
      initialSql: "INSERT INTO t VALUES (1, 'a'), (2, 'b');",
    });
    expect(bootResult.error).toBeNull();
    expect(bootResult.seeded).toBe(true);
    expect(engine.status).toBe("ready");

    const result = await engine.run("SELECT * FROM t ORDER BY id;");
    expect(result.error).toBeNull();
    expect(result.rows).toEqual([{ id: 1, name: "a" }, { id: 2, name: "b" }]);
    expect(result.columns).toEqual(["id", "name"]);

    await engine.teardown();
  });

  it("returns a query error on the result rather than throwing", async () => {
    const engine = new SqlExecutionEngine();
    await engine.boot({ schemaSql: "CREATE TABLE t (id int);" });

    const result = await engine.run("SELECT * FROM nonexistent_table;");
    expect(result.error).not.toBeNull();
    expect(result.rows).toEqual([]);

    await engine.teardown();
  });

  it("does not re-seed when the same schema/initial SQL is booted again", async () => {
    const engine = new SqlExecutionEngine();
    await engine.boot({
      schemaSql: "CREATE TABLE t (id int);",
      initialSql: "INSERT INTO t VALUES (1);",
    });
    // Re-seeding with identical SQL must not throw (would fail on duplicate CREATE TABLE otherwise).
    const second = await engine.boot({
      schemaSql: "CREATE TABLE t (id int);",
      initialSql: "INSERT INTO t VALUES (1);",
    });
    expect(second.error).toBeNull();
    expect(second.seeded).toBe(false);

    const result = await engine.run("SELECT count(*)::int FROM t;");
    // Confirms the insert did not run twice.
    expect(result.rows).toEqual([{ count: 1 }]);

    await engine.teardown();
  });

  it("re-seeds when switching to different schema/initial SQL (mission step change)", async () => {
    const engine = new SqlExecutionEngine();
    await engine.boot({ schemaSql: "CREATE TABLE a (id int);", initialSql: "INSERT INTO a VALUES (1);" });
    const stepTwo = await engine.boot({ schemaSql: "CREATE TABLE b (id int);", initialSql: "INSERT INTO b VALUES (2);" });
    expect(stepTwo.error).toBeNull();

    const result = await engine.run("SELECT * FROM b;");
    expect(result.rows).toEqual([{ id: 2 }]);

    await engine.teardown();
  });

  it("boot() with no seed just boots the instance without erroring", async () => {
    const engine = new SqlExecutionEngine();
    const result = await engine.boot();
    expect(result.error).toBeNull();
    expect(engine.status).toBe("ready");
    await engine.teardown();
  });

  it("run() before boot() throws — callers must boot first", async () => {
    const engine = new SqlExecutionEngine();
    await expect(engine.run("SELECT 1;")).rejects.toThrow(/boot\(\) must be called/);
  });

  it("teardown() resets status to idle and clears seed memory", async () => {
    const engine = new SqlExecutionEngine();
    await engine.boot({ schemaSql: "CREATE TABLE t (id int);" });
    await engine.teardown();
    expect(engine.status).toBe("idle");
    await expect(engine.run("SELECT 1;")).rejects.toThrow();
  });
});
