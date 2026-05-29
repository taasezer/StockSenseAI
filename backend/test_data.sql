-- 1. Warehouses (Depolar)
INSERT INTO "Warehouses" ("Name", "Code", "Address", "City", "Country", "ContactPhone", "ManagerName", "IsActive", "IsPrimary", "CreatedAt")
VALUES 
('Merkez Depo', 'WH-MAIN', 'Organize Sanayi Bölgesi', 'İstanbul', 'Türkiye', '+905551234567', 'Ahmet Yılmaz', true, true, NOW()),
('Anadolu Yakası Dağıtım', 'WH-ANATOLIA', 'Kavacık Mah.', 'İstanbul', 'Türkiye', '+905559876543', 'Mehmet Demir', true, false, NOW());

-- 2. Users (Kullanıcılar)
-- Şifre 'Admin123!' olarak bcrypt ile şifrelenmiştir.
INSERT INTO "Users" ("Username", "PasswordHash", "Role")
VALUES 
('admin', '$2a$11$N/QO1R39xYd8u5XgP0h.i.qR0R/m8T/3oG1g4I2Xm3oA/O8O9bV1i', 'Admin');

-- 3. Suppliers (Tedarikçiler)
INSERT INTO "Suppliers" ("Name", "ContactEmail", "ContactPhone", "Address", "AverageLeadTimeDays", "IsActive", "CreatedAt")
VALUES 
('TeknoTedarik A.Ş.', 'contact@teknotedarik.com', '02125550011', 'Şişli, İstanbul', 5, true, NOW()),
('Global Lojistik', 'info@globallog.com', '02124440022', 'Kadıköy, İstanbul', 3, true, NOW());

-- 4. Products (Ürünler) (İlk eklenen SupplierId 1 olduğu varsayılmıştır)
INSERT INTO "Products" ("Name", "Sku", "Price", "Category", "StockCount", "ReorderLevel", "LeadTimeDays", "Description", "CreatedAt", "SupplierId")
VALUES 
('iPhone 15 Pro', 'IP15P-128', 55000, 'Elektronik', 15, 10, 5, 'Apple Akıllı Telefon', NOW(), (SELECT "Id" FROM "Suppliers" LIMIT 1 OFFSET 0)),
('MacBook Air M2', 'MBA-M2-256', 38000, 'Elektronik', 5, 8, 7, 'Apple Laptop', NOW(), (SELECT "Id" FROM "Suppliers" LIMIT 1 OFFSET 0)),
('Sony WH-1000XM5', 'SONY-WHXM5', 12000, 'Aksesuar', 40, 15, 3, 'Kablosuz Kulaklık', NOW(), (SELECT "Id" FROM "Suppliers" LIMIT 1 OFFSET 1));

-- 5. Warehouse Stocks (Depo Stokları) (İlk eklenen WarehouseId 1 olduğu varsayılmıştır)
INSERT INTO "WarehouseStocks" ("WarehouseId", "ProductId", "Quantity", "ReorderLevel", "Location", "LastUpdated")
SELECT 
  (SELECT "Id" FROM "Warehouses" WHERE "Code" = 'WH-MAIN'),
  "Id", 
  "StockCount", 
  "ReorderLevel", 
  'A-1', 
  NOW()
FROM "Products";
