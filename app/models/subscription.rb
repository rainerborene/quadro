class Subscription
  include MongoMapper::EmbeddedDocument

  key :amount, Float, :required => true
  key :token, String, :required => true
  key :payer_id, String, :required => true
end
