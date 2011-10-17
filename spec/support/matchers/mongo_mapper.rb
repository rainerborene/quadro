RSpec::Matchers.define :validate_presence_of do |attribute|
  match do |model|
    model.send("#{attribute}=", nil)
    model.valid?
    model.errors.include?(attribute)
  end

  description { "should validates presence of #{attribute}" }
end

RSpec::Matchers.define :have_attribute_protected do |attribute|
  match do |model|
    model.protected_attributes.include?(attribute)
  end

  description { "should have #{attribute} attribute protected" }
end

RSpec::Matchers.define :have_key do |attribute, type|
  match do |model|
    model.respond_to?(attribute) && model.class.keys[attribute.to_s] == ::MongoMapper::Plugins::Keys::Key.new(attribute, type)
  end

  description { "should have #{attribute} attribute with #{type} type." }
end

RSpec::Matchers.define :belongs_to do |attribute|
  match do |model|
    model.send(attribute).instance_of? attribute.to_s.classify.constantize
  end
end
