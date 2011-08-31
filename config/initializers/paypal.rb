PAYPAL_CONFIG = YAML.load_file("#{Rails.root}/config/paypal.yml")[Rails.env].symbolize_keys

PayPal::Recurring.configure do |config|
  config.sandbox = PAYPAL_CONFIG[:sandbox]
  config.username = PAYPAL_CONFIG[:username]
  config.password = PAYPAL_CONFIG[:password]
  config.signature = PAYPAL_CONFIG[:signature]
end
