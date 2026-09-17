-- MAP NODES
CREATE TABLE public.map_nodes (
  id TEXT PRIMARY KEY,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  node_type TEXT NOT NULL DEFAULT 'corridor',
  label TEXT
);
GRANT SELECT ON public.map_nodes TO anon, authenticated;
GRANT ALL ON public.map_nodes TO service_role;
ALTER TABLE public.map_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "map_nodes readable" ON public.map_nodes FOR SELECT USING (true);

CREATE TABLE public.map_edges (
  id BIGSERIAL PRIMARY KEY,
  from_node TEXT NOT NULL REFERENCES public.map_nodes(id) ON DELETE CASCADE,
  to_node TEXT NOT NULL REFERENCES public.map_nodes(id) ON DELETE CASCADE,
  distance NUMERIC NOT NULL,
  UNIQUE (from_node, to_node)
);
GRANT SELECT ON public.map_edges TO anon, authenticated;
GRANT ALL ON public.map_edges TO service_role;
ALTER TABLE public.map_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "map_edges readable" ON public.map_edges FOR SELECT USING (true);

CREATE TABLE public.aisles (
  id SERIAL PRIMARY KEY,
  aisle_number INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  map_node_id TEXT REFERENCES public.map_nodes(id)
);
GRANT SELECT ON public.aisles TO anon, authenticated;
GRANT ALL ON public.aisles TO service_role;
ALTER TABLE public.aisles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aisles readable" ON public.aisles FOR SELECT USING (true);

CREATE TABLE public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  barcode TEXT UNIQUE,
  aisle INT NOT NULL,
  shelf INT NOT NULL,
  availability TEXT NOT NULL DEFAULT 'In Stock',
  map_node_id TEXT REFERENCES public.map_nodes(id),
  image_url TEXT
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products readable" ON public.products FOR SELECT USING (true);

CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  current_node_id TEXT REFERENCES public.map_nodes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts TO anon, authenticated;
GRANT ALL ON public.carts TO service_role;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carts open access" ON public.carts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.cart_items (
  id BIGSERIAL PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES public.products(id),
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO anon, authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_items open access" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_lists TO anon, authenticated;
GRANT ALL ON public.shopping_lists TO service_role;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shopping_lists open access" ON public.shopping_lists FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.shopping_list_items (
  id BIGSERIAL PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES public.products(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shopping_list_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_list_items TO anon, authenticated;
GRANT ALL ON public.shopping_list_items TO service_role;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shopping_list_items open access" ON public.shopping_list_items FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  total NUMERIC(10,2) NOT NULL,
  item_count INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.checkouts TO anon, authenticated;
GRANT ALL ON public.checkouts TO service_role;
ALTER TABLE public.checkouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkouts open access" ON public.checkouts FOR ALL USING (true) WITH CHECK (true);
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- SEED MAP GRAPH: 8 columns x 3 corridors, 16 aisle nodes
INSERT INTO public.map_nodes (id, x, y, node_type, label)
SELECT 'c' || c || '_top', c * 100, 100, 'corridor', 'North corridor ' || c FROM generate_series(1, 8) c
UNION ALL
SELECT 'c' || c || '_mid', c * 100, 350, 'corridor', 'Central corridor ' || c FROM generate_series(1, 8) c
UNION ALL
SELECT 'c' || c || '_bottom', c * 100, 600, 'corridor', 'South corridor ' || c FROM generate_series(1, 8) c
UNION ALL
SELECT 'aisle_' || a,
       (CASE WHEN a <= 8 THEN a ELSE a - 8 END) * 100,
       (CASE WHEN a <= 8 THEN 225 ELSE 475 END),
       'aisle', 'Aisle ' || a
FROM generate_series(1, 16) a
UNION ALL
SELECT * FROM (VALUES
  ('entrance', 30::numeric, 100::numeric, 'entrance', 'Entrance'),
  ('checkout', 870::numeric, 100::numeric, 'checkout', 'Checkout')
) v;

INSERT INTO public.map_edges (from_node, to_node, distance)
WITH pairs AS (
  SELECT 'c' || c || '_top' AS a, 'c' || (c + 1) || '_top' AS b FROM generate_series(1, 7) c
  UNION ALL SELECT 'c' || c || '_mid', 'c' || (c + 1) || '_mid' FROM generate_series(1, 7) c
  UNION ALL SELECT 'c' || c || '_bottom', 'c' || (c + 1) || '_bottom' FROM generate_series(1, 7) c
  UNION ALL SELECT 'c' || c || '_top', 'aisle_' || c FROM generate_series(1, 8) c
  UNION ALL SELECT 'aisle_' || c, 'c' || c || '_mid' FROM generate_series(1, 8) c
  UNION ALL SELECT 'c' || c || '_mid', 'aisle_' || (c + 8) FROM generate_series(1, 8) c
  UNION ALL SELECT 'aisle_' || (c + 8), 'c' || c || '_bottom' FROM generate_series(1, 8) c
  UNION ALL SELECT 'entrance', 'c1_top'
  UNION ALL SELECT 'checkout', 'c8_top'
), both_ways AS (
  SELECT a, b FROM pairs UNION ALL SELECT b, a FROM pairs
)
SELECT bw.a, bw.b,
       round(sqrt(power(n2.x - n1.x, 2) + power(n2.y - n1.y, 2)) / 10.0, 2)
FROM both_ways bw
JOIN public.map_nodes n1 ON n1.id = bw.a
JOIN public.map_nodes n2 ON n2.id = bw.b;

INSERT INTO public.aisles (aisle_number, name, category, map_node_id) VALUES
  (1,'Dairy','Dairy','aisle_1'),
  (2,'Bakery','Bakery','aisle_2'),
  (3,'Beverages','Beverages','aisle_3'),
  (4,'Snacks','Snacks','aisle_4'),
  (5,'Staples & Grains','Staples','aisle_5'),
  (6,'Cooking Oil & Ghee','Cooking Oil','aisle_6'),
  (7,'Spices & Masala','Spices','aisle_7'),
  (8,'Instant & Noodles','Instant Food','aisle_8'),
  (9,'Biscuits & Chocolates','Biscuits','aisle_9'),
  (10,'Tea & Coffee','Tea & Coffee','aisle_10'),
  (11,'Frozen & Ice Cream','Frozen','aisle_11'),
  (12,'Personal Care','Personal Care','aisle_12'),
  (13,'Hair & Skin Care','Hair & Skin Care','aisle_13'),
  (14,'Household Cleaning','Household','aisle_14'),
  (15,'Detergents & Laundry','Detergents','aisle_15'),
  (16,'Baby & Health','Baby & Health','aisle_16');

INSERT INTO public.products (name, brand, category, description, price, barcode, aisle, shelf, availability)
VALUES
  ('Amul Taaza Toned Milk 500ml','Amul','Dairy','Homogenised toned milk, pack of 500ml.',28,'8901010000011',1,1,'In Stock'),
  ('Amul Butter 500g','Amul','Dairy','Pasteurised salted table butter.',285,'8901010000028',1,2,'In Stock'),
  ('Amul Masti Dahi 400g','Amul','Dairy','Fresh set curd cup.',45,'8901010000035',1,3,'In Stock'),
  ('Nestle a+ Slim Milk 1L','Nestle','Dairy','Skimmed milk tetra pack.',82,'8901010000042',1,4,'In Stock'),
  ('Britannia Brown Bread 400g','Britannia','Bakery','Soft whole wheat brown bread loaf.',45,'8901010000059',2,1,'In Stock'),
  ('Britannia Whole Wheat Pav 6pc','Britannia','Bakery','Bakery-fresh wheat pav buns.',35,'8901010000066',2,2,'In Stock'),
  ('Modern Milk Bread 400g','Modern','Bakery','Classic soft milk bread.',42,'8901010000073',2,3,'Low Stock'),
  ('Coca-Cola 750ml','Coca-Cola','Beverages','Chilled aerated soft drink.',40,'8901010000080',3,1,'In Stock'),
  ('Thums Up 750ml','Thums Up','Beverages','Strong cola soft drink.',40,'8901010000097',3,2,'In Stock'),
  ('Real Mixed Fruit Juice 1L','Dabur','Beverages','No added preservatives fruit juice.',120,'8901010000103',3,3,'In Stock'),
  ('Bisleri Mineral Water 2L','Bisleri','Beverages','Packaged drinking water.',30,'8901010000110',3,4,'In Stock'),
  ('Lays Magic Masala 52g','Lays','Snacks','Potato chips, Indian masala flavour.',20,'8901010000127',4,1,'In Stock'),
  ('Kurkure Masala Munch 90g','Kurkure','Snacks','Crunchy corn puffs.',40,'8901010000134',4,2,'In Stock'),
  ('Haldirams Aloo Bhujia 200g','Haldirams','Snacks','Traditional potato bhujia namkeen.',60,'8901010000141',4,3,'In Stock'),
  ('India Gate Basmati Rice 5kg','India Gate','Staples','Classic aged basmati rice.',620,'8901010000158',5,1,'In Stock'),
  ('Aashirvaad Whole Wheat Atta 5kg','Aashirvaad','Staples','100% atta with no maida.',275,'8901010000165',5,2,'In Stock'),
  ('Tata Sampann Toor Dal 1kg','Tata Sampann','Staples','Unpolished toor dal.',165,'8901010000172',5,3,'In Stock'),
  ('Fortune Sunlite Sunflower Oil 1L','Fortune','Cooking Oil','Refined sunflower cooking oil.',145,'8901010000189',6,1,'In Stock'),
  ('Saffola Gold Oil 1L','Saffola','Cooking Oil','Blended cooking oil for the heart.',185,'8901010000196',6,2,'In Stock'),
  ('Amul Pure Ghee 1L','Amul','Cooking Oil','Cow ghee tin, rich aroma.',640,'8901010000202',6,3,'In Stock'),
  ('Everest Garam Masala 100g','Everest','Spices','Blend of 12 aromatic spices.',85,'8901010000219',7,1,'In Stock'),
  ('MDH Kitchen King Masala 100g','MDH','Spices','All-purpose curry masala.',90,'8901010000226',7,2,'In Stock'),
  ('Tata Salt 1kg','Tata','Spices','Vacuum evaporated iodised salt.',28,'8901010000233',7,3,'In Stock'),
  ('Maggi 2-Minute Noodles 12 Pack','Maggi','Instant Food','Masala instant noodles family pack.',168,'8901010000240',8,1,'In Stock'),
  ('Knorr Sweet Corn Soup 44g','Knorr','Instant Food','Instant sweet corn veg soup.',65,'8901010000257',8,2,'In Stock'),
  ('Parle-G Gold Biscuits 1kg','Parle','Biscuits','Glucose biscuits value pack.',130,'8901010000264',9,1,'In Stock'),
  ('Cadbury Dairy Milk Silk 150g','Cadbury','Chocolates','Smooth milk chocolate bar.',190,'8901010000271',9,2,'In Stock'),
  ('Britannia Good Day Cashew 200g','Britannia','Biscuits','Buttery cashew cookies.',45,'8901010000288',9,3,'In Stock'),
  ('Bru Instant Coffee 200g','Bru','Tea & Coffee','Instant coffee granules jar.',190,'8901010000295',10,1,'In Stock'),
  ('Tata Tea Premium 1kg','Tata Tea','Tea & Coffee','Strong Assam blend tea.',520,'8901010000301',10,2,'In Stock'),
  ('Amul Vanilla Ice Cream 1L','Amul','Frozen','Real milk vanilla ice cream tub.',310,'8901010000318',11,1,'In Stock'),
  ('McCain French Fries 750g','McCain','Frozen','Frozen classic cut fries.',165,'8901010000325',11,2,'In Stock'),
  ('Head & Shoulders Anti-Dandruff Shampoo 340ml','Head & Shoulders','Personal Care','Anti-dandruff shampoo, up to 100% dandruff free hair with regular use.',280,'8901234567890',12,3,'In Stock'),
  ('Colgate Strong Teeth 200g','Colgate','Personal Care','Cavity protection toothpaste.',110,'8901010000349',12,1,'In Stock'),
  ('Dettol Original Soap 4x125g','Dettol','Personal Care','Germ protection bathing soap pack.',180,'8901010000356',12,2,'In Stock'),
  ('Dove Intense Repair Shampoo 340ml','Dove','Hair & Skin Care','Repairs damaged hair with keratin actives.',320,'8901010000363',13,1,'In Stock'),
  ('Nivea Soft Light Moisturiser 200ml','Nivea','Hair & Skin Care','Jojoba oil and vitamin E cream.',265,'8901010000370',13,2,'In Stock'),
  ('Parachute Coconut Oil 500ml','Parachute','Hair & Skin Care','100% pure coconut hair oil.',190,'8901010000387',13,3,'In Stock'),
  ('Vim Dishwash Gel 750ml','Vim','Household','Lemon dishwash liquid refill.',195,'8901010000394',14,1,'In Stock'),
  ('Harpic Power Plus Toilet Cleaner 1L','Harpic','Household','Thick toilet cleaning liquid.',199,'8901010000400',14,2,'In Stock'),
  ('Colin Glass Cleaner 500ml','Colin','Household','Streak-free glass cleaning spray.',99,'8901010000417',14,3,'Low Stock'),
  ('Surf Excel Easy Wash 4kg','Surf Excel','Detergents','Detergent powder for tough stains.',480,'8901010000424',15,1,'In Stock'),
  ('Ariel Matic Liquid 2L','Ariel','Detergents','Front load matic liquid detergent.',560,'8901010000431',15,2,'In Stock'),
  ('Comfort After Wash 860ml','Comfort','Detergents','Fabric conditioner, morning fresh.',190,'8901010000448',15,3,'In Stock'),
  ('Pampers Baby-Dry Pants Medium 56','Pampers','Baby & Health','Up to 12 hours dryness diaper pants.',899,'8901010000455',16,1,'In Stock'),
  ('Nestle Cerelac Wheat Apple 300g','Nestle','Baby & Health','Infant cereal with milk, stage 2.',285,'8901010000462',16,2,'In Stock'),
  ('Dabur Honey 500g','Dabur','Baby & Health','World no.1 honey, 100% pure.',265,'8901010000479',16,3,'In Stock');

UPDATE public.products SET map_node_id = 'aisle_' || aisle;
ALTER TABLE public.products ALTER COLUMN map_node_id SET NOT NULL;