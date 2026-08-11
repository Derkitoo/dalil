import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const reputationRateLimits = sqliteTable("reputation_rate_limits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scope: text("scope").notNull(),
  bucket: text("bucket").notNull(),
  count: integer("count").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_reputation_rate_scope_bucket").on(table.scope, table.bucket),
]);

export const reputationCache = sqliteTable("reputation_cache", {
  urlHash: text("url_hash").primaryKey(),
  payload: text("payload").notNull(),
  expiresAt: integer("expires_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
