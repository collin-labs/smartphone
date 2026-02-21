-- ============================================================
-- SEED_BATCH4.sql — Contacts, Bank, FleecaBank, PayPal, Uber, Waze, Marketplace, YellowPages
-- ============================================================

-- Contacts (usa tabela existente smartphone_contacts)
INSERT INTO smartphone_contacts (owner, contact_name, contact_phone) VALUES
('CHAR1', 'Ana Belle', '21987650000'),
('CHAR1', 'Bruno Costa', '11912345678'),
('CHAR1', 'Carlos Silva', '11987654321'),
('CHAR1', 'Diana Souza', '21998876655'),
('CHAR1', 'Eduardo Lima', '31999998888'),
('CHAR1', 'Fernanda Costa', '11977776666');

-- Bank transactions
CREATE TABLE IF NOT EXISTS smartphone_bank_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner VARCHAR(64) NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(20) DEFAULT 'debit',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner (owner)
);

INSERT INTO smartphone_bank_transactions (owner, description, amount, type) VALUES
('CHAR1', 'Salario - Empresa LS', 8500.00, 'credit'),
('CHAR1', 'Supermercado Central', -234.56, 'debit'),
('CHAR1', 'PIX - Maria Santos', -500.00, 'debit'),
('CHAR1', 'Mecanica Santos', -1250.00, 'debit'),
('CHAR1', 'PIX - Joao Grau', 350.00, 'credit'),
('CHAR1', 'Posto de Gasolina', -180.00, 'debit'),
('CHAR1', 'Aluguel - Apartamento', -2800.00, 'debit');

-- PayPal transactions
CREATE TABLE IF NOT EXISTS smartphone_paypal_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner VARCHAR(64) NOT NULL,
  name VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(20) DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner (owner)
);

INSERT INTO smartphone_paypal_transactions (owner, name, amount, type) VALUES
('CHAR1', 'Maria Santos', 350.00, 'received'),
('CHAR1', 'Uber *Viagem', -42.90, 'sent'),
('CHAR1', 'Pedro Lima', -200.00, 'sent'),
('CHAR1', 'iFood', -67.80, 'sent'),
('CHAR1', 'Joao Costa', 1500.00, 'received');

-- Uber rides history
CREATE TABLE IF NOT EXISTS smartphone_uber_rides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner VARCHAR(64) NOT NULL,
  ride_type VARCHAR(20) DEFAULT 'uberx',
  destination VARCHAR(255),
  price DECIMAL(8,2),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner (owner)
);

INSERT INTO smartphone_uber_rides (owner, ride_type, destination, price, status) VALUES
('CHAR1', 'uberx', 'Mecanica Santos', 18.90, 'completed'),
('CHAR1', 'comfort', 'Aeroporto LS', 42.50, 'completed'),
('CHAR1', 'moto', 'Burger King LS', 9.90, 'completed');

-- Marketplace listings
CREATE TABLE IF NOT EXISTS smartphone_marketplace (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  price VARCHAR(50),
  category VARCHAR(50),
  location VARCHAR(100),
  description TEXT,
  seller_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_owner (owner),
  INDEX idx_status (status)
);

INSERT INTO smartphone_marketplace (owner, title, price, category, location, seller_name) VALUES
('CHAR1', 'Fiat Uno 2019 Completo', 'R$ 38.000', 'Veiculos', 'Los Santos', 'Carlos'),
('CHAR2', 'iPhone 15 Pro Max 256GB', 'R$ 6.500', 'Eletronicos', 'Vinewood', 'Rafael'),
('CHAR3', 'Apartamento 2 quartos', 'R$ 1.200/mes', 'Imoveis', 'Sandy Shores', 'Imobiliaria LS'),
('CHAR2', 'Notebook Gamer RTX 4060', 'R$ 5.200', 'Eletronicos', 'Paleto Bay', 'Marcos'),
('CHAR4', 'Sofa 3 Lugares Cinza', 'R$ 1.800', 'Moveis', 'Del Perro', 'Ana'),
('CHAR5', 'Honda Civic 2022', 'R$ 128.000', 'Veiculos', 'Rockford Hills', 'Pedro');

-- Yellow Pages businesses
CREATE TABLE IF NOT EXISTS smartphone_yellowpages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  phone VARCHAR(20),
  address VARCHAR(255),
  hours VARCHAR(50),
  description TEXT,
  rating DECIMAL(2,1) DEFAULT 4.0,
  reviews INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

INSERT INTO smartphone_yellowpages (name, category, phone, address, hours, description, rating, reviews) VALUES
('Los Santos Customs', 'Mecanica', '(11) 3456-7890', 'Popular St, La Mesa', '08:00 - 22:00', 'Customizacao e reparo de veiculos', 4.7, 234),
('Pillbox Hill Medical', 'Saude', '(11) 9999-0000', 'Pillbox Hill, Alta St', '24 horas', 'Hospital geral com pronto-socorro', 4.2, 567),
('Bahama Mamas West', 'Bar/Club', '(11) 3333-4444', 'Del Perro, LS', '21:00 - 05:00', 'Balada premium com DJs internacionais', 4.5, 891),
('Bean Machine Coffee', 'Cafeteria', '(11) 2222-3333', 'Vespucci Canals', '06:00 - 20:00', 'Cafe artesanal e brunch', 4.8, 423),
('Fleeca Bank - Centro', 'Banco', '(11) 4000-1000', 'Downtown LS, Legion Sq', '09:00 - 16:00', 'Agencia bancaria completa', 3.9, 156),
('Up-n-Atom Burger', 'Fast Food', '(11) 5555-6666', 'Vinewood, Mirror Park', '10:00 - 23:00', 'Hamburguer artesanal e shakes', 4.1, 678);
