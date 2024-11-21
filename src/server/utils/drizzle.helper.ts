import { Column, SelectedFields, sql, SQL, Table } from "drizzle-orm";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";

export function jsonBuildObject<
  TColumn extends Column,
  TTable extends Table,
  T extends SelectedFields<TColumn, TTable>,
>(shape: T) {
  const chunks: SQL[] = [];

  for (const [key, value] of Object.entries(shape)) {
    if (chunks.length > 0) {
      chunks.push(sql.raw(","));
    }
    chunks.push(sql.raw(`'${key}',`));
    chunks.push(sql`${value}`);
  }

  return sql<SelectResultFields<T>>`coalesce(json_build_object(${sql.join(
    chunks,
  )}), '{}')`;
}

export function jsonAggBuildObject<
  TColumn extends Column,
  TTable extends Table,
  T extends SelectedFields<TColumn, TTable>,
>(shape: T) {
  return sql<SelectResultFields<T>[]>`coalesce(jsonb_agg(${jsonBuildObject(
    shape,
  )}), '${sql`[]`}')`;
}
