CREATE TABLE suppliers (
  supplier_id   INT AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(120) NOT NULL UNIQUE,
  contact_person VARCHAR(120) NOT NULL,
  phone         VARCHAR(20)  NOT NULL UNIQUE,
  province      ENUM('Gauteng','Free State','KwaZulu-Natal','Western Cape','Eastern Cape','Limpopo','Mpumalanga','North West') NOT NULL,
  address       VARCHAR(255) NOT NULL
);
CREATE TABLE fruits (
  fruit_id    INT AUTO_INCREMENT PRIMARY KEY,
  fruit_name  VARCHAR(60) NOT NULL UNIQUE,
  description VARCHAR(255),
  status      ENUM('available','discontinued') NOT NULL DEFAULT 'available'
);
CREATE TABLE vendors (
  vendor_id      INT AUTO_INCREMENT PRIMARY KEY,
  vendor_name    VARCHAR(120) NOT NULL,
  phone_number   VARCHAR(20)  NOT NULL UNIQUE,
  location       VARCHAR(120) NOT NULL,
  registration_date DATE NOT NULL
);
CREATE TABLE purchases (
  purchase_id   INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id   INT NOT NULL,
  purchase_date DATE NOT NULL,
  total_amount  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_purchase_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT
);
CREATE TABLE purchase_details (
  purchase_detail_id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id  INT NOT NULL,
  fruit_id     INT NOT NULL,
  quantity     INT NOT NULL CHECK (quantity > 0),
  unit_cost    DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
  packaging_size ENUM('small','medium','large') NOT NULL,
  CONSTRAINT fk_pd_purchase FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
  CONSTRAINT fk_pd_fruit FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id) ON DELETE RESTRICT
);
CREATE TABLE sales (
  sale_id      INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id    INT NOT NULL,
  sale_date    DATE NOT NULL,
  payment_status ENUM('PAID','PARTIALLY_PAID','UNPAID') NOT NULL DEFAULT 'UNPAID',
  payment_method ENUM('cash','mobile_money','credit') NOT NULL DEFAULT 'cash',
  amount_paid  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_sale_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id) ON DELETE RESTRICT
);
CREATE TABLE sales_details (
  sales_detail_id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id      INT NOT NULL,
  fruit_id     INT NOT NULL,
  packaging_size ENUM('small','medium','large') NOT NULL,
  quantity     INT NOT NULL CHECK (quantity > 0),
  unit_price   DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  CONSTRAINT fk_sd_sale FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
  CONSTRAINT fk_sd_fruit FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id) ON DELETE RESTRICT
);
CREATE TABLE stock (
  stock_id   INT AUTO_INCREMENT PRIMARY KEY,
  fruit_id   INT NOT NULL,
  packaging_size ENUM('small','medium','large') NOT NULL,
  available_quantity INT NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
  UNIQUE KEY uq_stock (fruit_id, packaging_size),
  CONSTRAINT fk_stock_fruit FOREIGN KEY (fruit_id) REFERENCES fruits(fruit_id) ON DELETE CASCADE
);