class Invoice
  include MongoMapper::EmbeddedDocument

  key :invoice_date, Date
  key :invoice_due, Date
  key :status, String

  embedded_in :subscription
end
