import { ZodTypeAny ,ZodObject} from "zod";
export function inspectZodObject(schema: ZodTypeAny): any {
  const type = schema._def.typeName;

  if (schema instanceof ZodObject) {
    const shape = schema._def.shape();
    return {
      type,
      shape: Object.fromEntries(
        Object.entries(shape).map(([k, v]) => [k, inspectZodObject(v)])
      )
    };
  }

  if (schema._def.innerType?._def) {
    return {
      type,
      inner: inspectZodObject(schema._def.innerType)
    };
  }

  if (schema._def.type?._def) {
    return {
      type,
      typeDef: inspectZodObject(schema._def.type)
    };
  }

  return { type };
}