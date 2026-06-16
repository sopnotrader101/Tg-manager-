import { pgTable, serial, text, bigint, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const telegramAccountsTable = pgTable("telegram_accounts", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  userId: bigint("user_id", { mode: "bigint" }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  username: text("username"),
  sessionData: text("session_data").notNull(),
  has2fa: boolean("has_2fa").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTelegramAccountSchema = createInsertSchema(telegramAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTelegramAccount = z.infer<typeof insertTelegramAccountSchema>;
export type TelegramAccountRow = typeof telegramAccountsTable.$inferSelect;

export const pendingSessionsTable = pgTable("pending_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  phone: text("phone").notNull(),
  phoneCodeHash: text("phone_code_hash").notNull(),
  sessionData: text("session_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
