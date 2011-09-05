paypal_config = YAML.load_file("#{Rails.root}/config/paypal.yml")[Rails.env].symbolize_keys

PayPal::Recurring.configure do |config|
  config.sandbox = paypal_config[:sandbox]
  config.username = paypal_config[:username]
  config.password = paypal_config[:password]
  config.signature = paypal_config[:signature]
end
