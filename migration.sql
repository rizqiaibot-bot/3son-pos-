-- ============================================================
-- 3SON POS - Supabase Migration
-- Copy & jalankan di SQL Editor Supabase Dashboard
-- ============================================================

-- 1. TABLE: pos_produk
CREATE TABLE IF NOT EXISTS pos_produk (
  id        TEXT PRIMARY KEY,
  nama      TEXT NOT NULL,
  harga     INTEGER NOT NULL DEFAULT 0,
  stok      INTEGER NOT NULL DEFAULT 0,
  kategori  TEXT NOT NULL DEFAULT 'lainnya',
  favorit   BOOLEAN NOT NULL DEFAULT false,
  gambar    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLE: pos_customer
CREATE TABLE IF NOT EXISTS pos_customer (
  id         BIGSERIAL PRIMARY KEY,
  nama       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLE: pos_transaksi
CREATE TABLE IF NOT EXISTS pos_transaksi (
  id         BIGSERIAL PRIMARY KEY,
  invoice    TEXT NOT NULL,
  customer   TEXT NOT NULL DEFAULT 'Umum',
  items      JSONB NOT NULL DEFAULT '[]',
  subtotal   INTEGER NOT NULL DEFAULT 0,
  diskon     INTEGER NOT NULL DEFAULT 0,
  ongkir     INTEGER NOT NULL DEFAULT 0,
  total      INTEGER NOT NULL DEFAULT 0,
  tunai      INTEGER NOT NULL DEFAULT 0,
  transfer   INTEGER NOT NULL DEFAULT 0,
  method     TEXT NOT NULL DEFAULT 'tunai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLE: pos_invoice_counter
CREATE TABLE IF NOT EXISTS pos_invoice_counter (
  id      INTEGER PRIMARY KEY DEFAULT 1,
  counter INTEGER NOT NULL DEFAULT 0
);
INSERT INTO pos_invoice_counter (id, counter) VALUES (1, 0)
  ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS: Enable + Allow All (POS internal, pakai anon key)
-- ============================================================
ALTER TABLE pos_produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_invoice_counter ENABLE ROW LEVEL SECURITY;

-- All-access policies for anon role
CREATE POLICY "anon_all_pos_produk" ON pos_produk FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_pos_customer" ON pos_customer FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_pos_transaksi" ON pos_transaksi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_pos_invoice_counter" ON pos_invoice_counter FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- STORAGE: Bucket untuk product images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anon_all_product_images"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- ============================================================
-- SEED DATA: Produk default
-- ============================================================
INSERT INTO pos_produk (id, nama, harga, stok, kategori, favorit, gambar)
VALUES
  ('p001', 'Bakso Ikan',        50000, 10, 'bakso', true,  'assets/img/default-product.svg'),
  ('p002', 'Bakso Super',       55000, 8,  'bakso', false, 'assets/img/default-product.svg'),
  ('p003', 'Otak-Otak',         48000, 12, 'bakso', false, 'assets/img/default-product.svg'),
  ('p004', 'Siomay Ikan',       45000, 15, 'bakso', false, 'assets/img/default-product.svg'),
  ('p005', 'Kaki Naga',         52000, 7,  'bakso', false, 'assets/img/default-product.svg'),
  ('p006', 'Fish Roll',         47000, 9,  'bakso', true,  'assets/img/default-product.svg'),
  ('p007', 'Kekian',            43000, 11, 'bakso', false, 'assets/img/default-product.svg'),
  ('p008', 'Nugget Ikan',       40000, 20, 'bakso', false, 'assets/img/default-product.svg')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- AUTH: Auto-confirm email (biar gak perlu verifikasi)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
