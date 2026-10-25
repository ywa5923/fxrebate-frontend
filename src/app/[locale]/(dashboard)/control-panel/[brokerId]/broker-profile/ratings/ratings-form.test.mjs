import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import React from "react";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadModule(path, dependencies = {}) {
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const compiled = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => dependencies[name] ?? require(name), compiled, compiled.exports,
  );
  return compiled.exports;
}

const { getFormSchema } = loadModule("src/components/XForm/schema.ts", {
  "./form-components": { SelectIteNoneValue: "_none_" },
});
const { flattenObject } = loadModule("src/lib/flattenObject.ts");

function backendConfig() {
  return { sections: { ratings: { label: "Broker Ratings", fields: Object.fromEntries(
    ["popularity", "pricing", "customer_support", "features"].map((key) => [key, {
      type: "number", label: key, placeholder: "Not defined", required: false,
      validation: { required: false, min: 0, max: 5 },
    }]),
  ) } } };
}

function payload(values) {
  const parsed = getFormSchema(backendConfig()).parse({ ratings: values });
  return JSON.parse(JSON.stringify(flattenObject(parsed), (_key, value) => value === undefined ? null : value));
}

test("original XForm validation serializes dot decimals, zero and empty fields", () => {
  assert.deepEqual(payload({ popularity: "0", pricing: "3.5", customer_support: "", features: "5" }), {
    popularity: 0, pricing: 3.5, customer_support: null, features: 5,
  });
  assert.deepEqual(payload({ popularity: null, pricing: null, customer_support: null, features: null }), {
    popularity: null, pricing: null, customer_support: null, features: null,
  });
});

test("original validation rejects out-of-range values and comma strings", () => {
  for (const invalid of ["-0.1", "5.1", "abc", "3,5"]) {
    assert.throws(() => payload({ popularity: invalid, pricing: 3, customer_support: 4, features: 5 }));
  }
});

function find(node, predicate) {
  if (!node || typeof node !== "object") return null;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const result = find(child, predicate);
    if (result) return result;
  }
  return null;
}

function setupDialog() {
  let cursor = 0;
  const slots = [];
  const { default: Component } = loadModule(new URL("./BrokerRatingsFormDialog.tsx", import.meta.url), {
    react: {
      ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
      },
    },
    "@/components/XForm": { default: "XForm" },
    "@/components/ui/button": { Button: "Button" },
    "@/components/ui/dialog": {
      Dialog: "Dialog", DialogContent: "DialogContent", DialogHeader: "DialogHeader",
      DialogTitle: "DialogTitle", DialogTrigger: "DialogTrigger",
    },
    "@/components/ui/tooltip": {
      Tooltip: "Tooltip", TooltipContent: "TooltipContent",
      TooltipProvider: "TooltipProvider", TooltipTrigger: "TooltipTrigger",
    },
  });
  return {
    render() {
      cursor = 0;
      return Component({ brokerId: "12" });
    },
  };
}

test("dialog delegates config loading, item loading and saving to XForm", () => {
  const state = setupDialog();
  assert.equal(find(state.render(), (node) => node.type === "XForm"), null);
  state.render().props.onOpenChange(true);
  const form = find(state.render(), (node) => node.type === "XForm");
  assert.equal(form.props.formConfigApiUrl, "/ratings/form-config");
  assert.equal(form.props.getItemUrl, "/ratings/12");
  assert.equal(form.props.resourceApiUrl, "/ratings/12");
  assert.equal(form.props.mode, "edit");
  assert.equal(form.props.resourceName, "Ratings");
  assert.equal(form.props.formConfig, undefined);
  assert.equal(form.props.resourceId, undefined);
});

test("dialog allows decimal steps locally", () => {
  const state = setupDialog();
  state.render().props.onOpenChange(true);
  const wrapper = find(state.render(), (node) => typeof node.props?.onFocusCapture === "function");
  const inputs = [{ step: "" }, { step: "1" }];
  wrapper.props.onFocusCapture({ currentTarget: { querySelectorAll(selector) {
    assert.equal(selector, 'input[type="number"]');
    return inputs;
  } } });
  assert.ok(inputs.every((input) => input.step === "any"));
});

test("successful submission closes the dialog and unmounts XForm", () => {
  const state = setupDialog();
  state.render().props.onOpenChange(true);
  find(state.render(), (node) => node.type === "XForm").props.onSubmitted();
  assert.equal(state.render().props.open, false);
  assert.equal(find(state.render(), (node) => node.type === "XForm"), null);
});
