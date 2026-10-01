import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { beforeEach, test } from "node:test";
import ts from "typescript";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Transpile without a custom runtime dependency; inject I/O to test reporting without sending logs.
function loadModule(filename, dependencies) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(filename, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const compiledModule = { exports: {} };
  const require = (name) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
    return dependencies[name];
  };
  new Function("require", "module", "exports", outputText)(require, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}

const logs = [];
const logger = { default: { child: (scope) => ({ error: (message, meta) => logs.push({ scope, message, meta }) }) } };
const helpers = loadModule("./translations.ts", { "./logger": logger });
const { t, prepareTranslations, withTranslationContext, createTranslator } = helpers;
beforeEach(() => { logs.length = 0; });

test("reads plain translations without changing their spacing", () => {
  assert.equal(t({ notes: " Note " }, "notes"), " Note ");
});

test("interpolates repeated parameters and numeric or empty values", () => {
  const translations = { greeting: "Hello {name}, {name}! {count} {suffix}" };
  assert.equal(t(translations, "greeting", { name: "John", count: 0, suffix: "" }), "Hello John, John! 0 ");
});

test("preserves literal replacement characters and does not interpolate recursively", () => {
  const translations = { greeting: "Hello {name}: {amount}" };
  const params = { name: "$& {amount}", amount: "$10" };
  assert.equal(t(translations, "greeting", params), "Hello $& {amount}: $10");
});

test("leaves unspecified parameters intact and ignores inherited parameters", () => {
  const translations = { greeting: "Hello {name}, {toString}!" };
  assert.equal(t(translations, "greeting"), "Hello {name}, {toString}!");
  assert.equal(t(translations, "greeting", { name: "John" }), "Hello John, {toString}!");
  assert.equal(t(translations, "greeting", Object.create({ name: "John" })), "Hello {name}, {toString}!");
});

test("reports missing, blank and non-text entries without stopping the page", () => {
  const translations = { valid: "Notes", blank: " \n", empty: "", invalid: { nested: "text" } };
  for (const key of ["missing", "blank", "empty", "invalid", "toString"]) {
    assert.equal(t(translations, key), key);
  }
  assert.equal(logs.length, 5);
  assert.ok(logs.every(({ meta }) => meta.event === "missing_translation"));
});

test("logs even when an explicit fallback is used and interpolates fallback parameters", () => {
  assert.equal(t({ valid: "Notes" }, "greeting", { name: "John" }, { fallback: "Hello {name}" }), "Hello John");
  assert.equal(t({ valid: "Notes" }, "greeting", undefined, { fallback: "" }), "");
  assert.equal(t({ greeting: "Welcome {name}" }, "greeting", { name: "John" }, { fallback: "Hello" }), "Welcome John");
  assert.equal(logs.length, 2);
  assert.ok(logs.every(({ meta }) => meta.hasExplicitFallback));
});

test("works with separate layout and page dictionaries without changing them", () => {
  const navbar = Object.freeze({ login: "Sign in" });
  const page = Object.freeze({ login: "Continue", authorization: "Contact {broker}" });
  assert.equal(t(navbar, "login"), "Sign in");
  assert.equal(t(page, "login"), "Continue");
  assert.equal(t(page, "authorization", { broker: "4XC" }), "Contact 4XC");
  assert.equal(page.authorization, "Contact {broker}");
});

test("throws when the entire dictionary is unusable, even with a fallback", () => {
  for (const dictionary of [{}, { empty: " " }, { nested: {} }, Object.create({ inherited: "text" })]) {
    assert.throws(() => t(dictionary, "title", undefined, { fallback: "Title" }), /No valid translations/);
  }
  assert.ok(logs.every(({ meta }) => meta.event === "translations_unavailable"));
});

test("reports context once per missing key and never includes interpolation values", () => {
  const dictionary = withTranslationContext({ title: "Notes" }, {
    page: "/ro/brokeri-forex/rebaturi-forex/juno-markets",
    locale: "ro",
    resource: "set_rebates_account_page",
    section: "client",
  });
  t(dictionary, "greeting", { name: "private account name" });
  t(dictionary, "greeting", { name: "another account" });
  assert.equal(logs.length, 1);
  assert.equal(logs[0].meta.page, "/ro/brokeri-forex/rebaturi-forex/juno-markets");
  assert.equal(logs[0].meta.locale, "ro");
  assert.equal(logs[0].meta.resource, "set_rebates_account_page");
  assert.equal(logs[0].meta.section, "client");
  assert.equal(logs[0].meta.translationKey, "greeting");
  assert.ok(!JSON.stringify(logs).includes("private account name"));
});

test("keeps request contexts separate and handles nested navbar dictionaries", () => {
  const source = Object.freeze({ navbar: Object.freeze({ login: "Sign in" }) });
  const ro = withTranslationContext(source, { page: "/ro", locale: "ro", resource: "layout" });
  const fr = withTranslationContext(source, { page: "/fr", locale: "fr", resource: "layout" });
  t(ro.navbar, "join_now");
  t(fr.navbar, "join_now");
  assert.equal(logs[0].meta.page, "/ro");
  assert.equal(logs[1].meta.page, "/fr");
  assert.equal(logs[0].meta.section, "navbar");
  assert.equal(JSON.stringify(ro), JSON.stringify(source));
});

test("prepares partial resources and rejects absent or malformed sections", () => {
  const context = { page: "/en", resource: "home_page", section: "client", locale: "en" };
  assert.deepEqual(prepareTranslations({ title: "Home", invalid: null }, context), { title: "Home" });
  for (const payload of [null, undefined, [], "text", {}, { title: " " }, { title: 12 }]) {
    assert.throws(() => prepareTranslations(payload, context), /No valid translations/);
  }
  assert.equal(logs.length, 7);
  assert.ok(logs.every(({ meta }) => meta.page === "/en" && meta.resource === "home_page"));
});

function fetcher(response, requests = []) {
  return loadModule("./fetchTranslations.ts", {
    "server-only": {},
    "next/headers": { headers: async () => new Headers({ "x-pathname": "/ro/brokeri-forex/rebaturi-forex" }) },
    "@/lib/api-client": { apiClient: async (...args) => { requests.push(args); return response; } },
    "@/lib/enums": { UseTokenAuth: { No: false }, ErrorMode: { Return: "return" } },
    "@/lib/logger": logger,
    "@/lib/translations": helpers,
  }).fetchTranslations;
}

test("fetches translations without caching by default and preserves resource context", async () => {
  const requests = [];
  const fetchTranslations = fetcher({ success: true, data: { client: { title: "Rebates", invalid: null } } }, requests);
  const dictionary = await fetchTranslations({ key: "forex_rebates_page", locale: "ro", zone: "eu" });
  const query = new URL(requests[0][0], "http://localhost").searchParams;
  assert.equal(query.get("lang[eq]"), "ro");
  assert.equal(query.get("key[eq]"), "forex_rebates_page");
  assert.equal(query.get("zone[eq]"), "eu");
  assert.equal(requests[0][2].cache, "no-store");
  assert.equal(t(dictionary, "title"), "Rebates");
  assert.equal(t(dictionary, "missing"), "missing");
  assert.equal(logs[0].meta.page, "/ro/brokeri-forex/rebaturi-forex");
  assert.equal(logs[0].meta.resource, "forex_rebates_page");
});

test("throws and reports page context for backend failures and empty responses", async () => {
  const options = { key: "forex_rebates_page", locale: "ro" };
  await assert.rejects(fetcher({ success: false, status: 503, message: "Unavailable" })(options), /Unavailable/);
  await assert.rejects(fetcher({ success: true, data: { client: {} } })(options), /No valid translations/);
  await assert.rejects(fetcher({ success: true, data: {} })(options), /No valid translations/);
  assert.equal(logs[0].meta.status, 503);
  assert.ok(logs.every(({ meta }) => meta.page === "/ro/brokeri-forex/rebaturi-forex"));
});

test("bound translator accepts a key without params or fallback", () => {
  const translate = createTranslator({ title: "Notes" });
  assert.equal(translate("title"), "Notes");
  assert.equal(typeof translate("title"), "string");
  assert.deepEqual(Object.keys(translate), []);
  assert.equal(logs.length, 0);
});

test("bound translator accepts only fallback or only params, or both", () => {
  const translate = createTranslator({ greeting: "Hello {name}! {count}" });
  assert.equal(translate("missing", { fallback: "" }), "");
  assert.equal(translate("greeting", { params: { name: "John", count: 0 } }), "Hello John! 0");
  assert.equal(translate("missing", { params: { name: "John" }, fallback: "Hello {name}" }), "Hello John");
  assert.equal(translate("greeting", { fallback: "Ignored" }), "Hello {name}! {count}");
  assert.equal(createTranslator({ message: "{fallback}" })("message", { params: { fallback: "parameter, not an option" } }), "parameter, not an option");
});

test("missing, blank, invalid and inherited entries return the key as plain text", () => {
  const translate = createTranslator({ title: "title", blank: " ", invalid: 12 });
  assert.equal(translate("title"), "title");
  for (const key of ["missing", "blank", "invalid", "toString"]) {
    assert.equal(translate(key), key);
  }
  assert.equal(logs.length, 4);
  assert.ok(logs.every(({ meta }) => meta.event === "missing_translation"));
});

test("translation values and missing keys are escaped, never interpreted as HTML", () => {
  const translate = createTranslator({ greeting: "Hello {name}" });
  const translated = React.createElement("p", null, translate("greeting", { params: { name: "<script>alert(1)</script>" } }));
  assert.match(renderToStaticMarkup(translated), /&lt;script&gt;/);
  const missing = renderToStaticMarkup(translate('<img src=x onerror="alert(1)">'));
  assert.ok(!missing.includes("<img"));
  assert.match(missing, /&lt;img/);
});

test("attributes and payloads receive strings, never React elements", () => {
  const translate = createTranslator({ greeting: "Hello {name}" });
  assert.equal(translate("missing"), "missing");
  const markup = renderToStaticMarkup(React.createElement("input", { placeholder: translate("missing"), "aria-label": translate("greeting", { params: { name: "John" } }) }));
  assert.match(markup, /placeholder="missing"/);
  assert.match(markup, /aria-label="Hello John"/);
  assert.equal(JSON.stringify({ tab_name: translate("missing") }), '{"tab_name":"missing"}');
});

test("text-only fallback is optional and missing placeholders are logged without markup", () => {
  const translate = createTranslator({ name: "Enter name" });
  assert.equal(translate("missing"), "missing");
  assert.equal(translate("missing", { fallback: "" }), "");
  assert.equal(logs[0].meta.translationKey, "missing");
  assert.equal(logs[0].meta.event, "missing_translation");
  assert.equal(translate("name"), "Enter name");
});

test("bound translator retains contextual logging and empty-dictionary errors", () => {
  const dictionary = withTranslationContext({ title: "Notes" }, { page: "/ro/test", locale: "ro", resource: "home_page" });
  const translate = createTranslator(dictionary);
  translate("missing");
  translate("missing");
  assert.equal(logs.length, 1);
  assert.equal(logs[0].meta.page, "/ro/test");
  assert.equal(logs[0].meta.resource, "home_page");
  assert.throws(() => createTranslator({})("missing", { fallback: "Hidden" }), /No valid translations/);
});
