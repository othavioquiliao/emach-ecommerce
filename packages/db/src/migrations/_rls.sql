-- RLS rollout. Aplicado remoto via mcp__supabase__apply_migration.
-- Estratégia:
--   - Catálogo público: SELECT anon/authenticated permitido (GRANT + policy USING true)
--   - Demais tabelas: RLS enabled, zero policies = deny-all
--   - Service role (Better Auth via DATABASE_URL = role postgres) bypassa por BYPASSRLS
-- Reaplicar idempotente: ALTER TABLE ... ENABLE RLS é noop; DROP POLICY IF EXISTS antes do CREATE.

-- 1. Public read (catálogo + reviews aprovadas)
ALTER TABLE "tool" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_variant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_image" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attribute_definition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_attribute_assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tool_attribute_value" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "branch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_level" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "promotion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "promotion_tool" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "review" ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON
  "tool", "tool_variant", "tool_image", "category", "tool_category",
  "attribute_definition", "tool_attribute_assignment", "tool_attribute_value",
  "branch", "stock_level", "promotion", "promotion_tool", "review"
TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_tool" ON "tool";
DROP POLICY IF EXISTS "public_read_tool_variant" ON "tool_variant";
DROP POLICY IF EXISTS "public_read_tool_image" ON "tool_image";
DROP POLICY IF EXISTS "public_read_category" ON "category";
DROP POLICY IF EXISTS "public_read_tool_category" ON "tool_category";
DROP POLICY IF EXISTS "public_read_attribute_definition" ON "attribute_definition";
DROP POLICY IF EXISTS "public_read_tool_attribute_assignment" ON "tool_attribute_assignment";
DROP POLICY IF EXISTS "public_read_tool_attribute_value" ON "tool_attribute_value";
DROP POLICY IF EXISTS "public_read_branch" ON "branch";
DROP POLICY IF EXISTS "public_read_stock_level" ON "stock_level";
DROP POLICY IF EXISTS "public_read_promotion" ON "promotion";
DROP POLICY IF EXISTS "public_read_promotion_tool" ON "promotion_tool";
DROP POLICY IF EXISTS "public_read_review_approved" ON "review";

CREATE POLICY "public_read_tool" ON "tool" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_tool_variant" ON "tool_variant" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_tool_image" ON "tool_image" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_category" ON "category" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_tool_category" ON "tool_category" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_attribute_definition" ON "attribute_definition" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_tool_attribute_assignment" ON "tool_attribute_assignment" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_tool_attribute_value" ON "tool_attribute_value" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_branch" ON "branch" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_stock_level" ON "stock_level" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_promotion" ON "promotion" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_promotion_tool" ON "promotion_tool" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_review_approved" ON "review" FOR SELECT TO anon, authenticated USING (status = 'approved');

-- 2. Deny-all (server-side only via Better Auth + service role)
ALTER TABLE "supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_key" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_movement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_item" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consent_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
