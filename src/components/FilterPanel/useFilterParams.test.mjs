import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

// Exercise URL changes and navigation timing without a backend or additional test dependencies.
function setup(t, href) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let location = new URL(href);
  const events = new EventTarget();
  const navigations = [];
  const cleanups = [];
  const originalWindow = globalThis.window;
  globalThis.window = {
    get location() { return location; },
    history: {
      replaceState(_state, _title, href) { location = new URL(href, location); },
    },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  };
  t.after(() => {
    for (const cleanup of cleanups) cleanup();
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  });

  const dependencies = {
    react: {
      useRef: (value) => ({ current: value }),
      useEffect: (effect) => { cleanups.push(effect()); },
    },
    "next/navigation": {
      useRouter: () => ({
        replace: (href, options) => {
          assert.deepEqual(options, { scroll: false });
          navigations.push(new URL(href, location).href);
        },
      }),
      useSearchParams: () => new URLSearchParams(location.search),
    },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("./useFilterParams.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  );
  const compiledModule = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    }, compiledModule, compiledModule.exports,
  );

  return {
    ...compiledModule.exports.useFilterParams(),
    valuesFromParams: compiledModule.exports.valuesFromParams,
    get url() { return location; },
    navigations,
    navigate(href) { location = new URL(href, location); },
    popstate() { events.dispatchEvent(new Event("popstate")); },
    unmount() { for (const cleanup of cleanups) cleanup(); },
  };
}

test("rapid clicks update the localized URL immediately and navigate once after the last click", (t) => {
  const panel = setup(t, "https://example.test/ro/brokeri-forex/rebaturi-forex?broker_type=crypto&page=4#results");
  panel.toggleValue("filter_headquarters", "gb", true);
  assert.equal(panel.url.searchParams.get("filter_headquarters"), "gb");
  assert.equal(panel.url.searchParams.has("page"), false);
  t.mock.timers.tick(200);
  panel.toggleValue("filter_headquarters", "cy", true);
  panel.toggleValue("filter_headquarters", "au", true);
  panel.toggleValue("filter_headquarters", "gb", false);
  assert.equal(panel.url.searchParams.get("filter_headquarters"), "cy,au");
  assert.equal(panel.url.pathname, "/ro/brokeri-forex/rebaturi-forex");
  assert.equal(panel.url.hash, "#results");
  assert.equal(panel.url.searchParams.get("broker_type"), "crypto");
  assert.ok(panel.url.href.includes("filter_headquarters=cy,au"));
  t.mock.timers.tick(299);
  assert.equal(panel.navigations.length, 0);
  t.mock.timers.tick(1);
  assert.deepEqual(panel.navigations, [panel.url.href]);
});

test("accepts repeated query parameters and comma-separated values without duplicate selections", (t) => {
  const panel = setup(t, "https://example.test/en/rebates?filter_headquarters=gb&filter_headquarters=cy,au");
  assert.deepEqual(panel.valuesFromParams(panel.url.searchParams, "filter_headquarters"), ["gb", "cy", "au"]);
  panel.toggleValue("filter_headquarters", "gb", true);
  assert.deepEqual(panel.url.searchParams.getAll("filter_headquarters"), ["gb,cy,au"]);
});

test("clear removes only configured filters and pagination, including pending selections", (t) => {
  const panel = setup(t, "https://example.test/en/rebates?broker_type=broker&order_direction=asc&trading_name=A%26B&page=2#results");
  panel.updateValue("filter_country", ["gb"]);
  panel.toggleValue("filter_clients", "europe", true);
  panel.clearValues(["filter_country", "filter_clients"]);
  assert.deepEqual(Object.fromEntries(panel.url.searchParams), {
    broker_type: "broker", order_direction: "asc", trading_name: "A&B",
  });
  assert.equal(panel.url.hash, "#results");
  t.mock.timers.tick(300);
  assert.deepEqual(panel.navigations, [panel.url.href]);
});

test("select clear removes the parameter and unchanged selections do not issue extra navigations", (t) => {
  const panel = setup(t, "https://example.test/en/rebates?filter_country=gb");
  panel.updateValue("filter_country", ["gb"]);
  t.mock.timers.tick(300);
  assert.equal(panel.navigations.length, 0);
  panel.updateValue("filter_country", []);
  assert.equal(panel.url.search, "");
  t.mock.timers.tick(300);
  assert.equal(panel.navigations.length, 1);
});

test("does not overwrite a different page after navigation", (t) => {
  const panel = setup(t, "https://example.test/en/rebates");
  panel.updateValue("filter_country", ["gb"]);
  panel.navigate("/fr");
  t.mock.timers.tick(300);
  assert.equal(panel.navigations.length, 0);
});

test("browser history and unmount cancel pending navigations", (t) => {
  const panel = setup(t, "https://example.test/en/rebates");
  panel.updateValue("filter_country", ["gb"]);
  panel.popstate();
  t.mock.timers.tick(300);
  assert.equal(panel.navigations.length, 0);
  panel.toggleValue("filter_clients", "europe", true);
  panel.unmount();
  t.mock.timers.tick(300);
  assert.equal(panel.navigations.length, 0);
});
