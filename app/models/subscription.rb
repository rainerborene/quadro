class Subscription
  include MongoMapper::Document

  key :amount, Float, :required => true
  key :token, String, :required => true
  key :payer_id, String, :required => true
  key :profile_id, String, :required => true

  many :invoices

  belongs_to :user
end
