INSERT INTO suppliers (business_name, contact_person, phone, province, address) VALUES
('FreshFruit SA','Thabo Mokoena','0821110001','Gauteng','12 Market Rd, Johannesburg'),
('Cape Orchards','Lindiwe Nkosi','0821110002','Western Cape','45 Vine St, Cape Town'),
('Durban Produce','Sipho Dlamini','0821110003','KwaZulu-Natal','8 Harbour Ave, Durban'),
('FreeState Harvest','Naledi Mokoena','0821110004','Free State','22 Grain Rd, Bloemfontein');

INSERT INTO fruits (fruit_name, description, status) VALUES
('Apple','Crisp red apples','available'), ('Banana','Yellow ripe bananas','available'),
('Orange','Juicy oranges','available'), ('Mango','Sweet mangoes','available'), ('Grapes','Seedless grapes','available');

INSERT INTO vendors (vendor_name, phone_number, location, registration_date) VALUES
('Maseru Street Fruits','58110001','Maseru','2026-01-10'), ('Thamae Vendors','58110002','Thamae','2026-02-15'),
('Ha Thetsane Market','58110003','Ha Thetsane','2026-03-20'), ('Roma Road Vendors','58110004','Roma Road','2026-04-05');

INSERT INTO stock (fruit_id, packaging_size, available_quantity) VALUES
(1,'small',50),(1,'medium',30),(1,'large',20), (2,'small',80),(2,'medium',40),(2,'large',25),
(3,'small',60),(3,'medium',35),(3,'large',15), (4,'small',40),(4,'medium',20),(4,'large',10),
(5,'small',30),(5,'medium',25),(5,'large',12);