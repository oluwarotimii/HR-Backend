CREATE TABLE IF NOT EXISTS payslip_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payslip_id INT NOT NULL,
  earning_item VARCHAR(255) NOT NULL,
  earning_amount DECIMAL(10,2) NOT NULL,
  deduction_item VARCHAR(255) NOT NULL,
  deduction_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payslip_id) REFERENCES payslips(id)
);