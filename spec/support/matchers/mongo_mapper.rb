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
    model.respond_to?(attribute) && model.class.keys[attribute.to_s] == MongoMapper::Plugins::Keys::Key.new(attribute, type)
  end

  description { "should have #{attribute} attribute with #{type} type." }
end

RSpec::Matchers.define :belongs_to do |collection|
  match do |model|
    reflection = model.class.associations[collection]
    belongs_association?(reflection.class) && reflection.name.eql?(collection)
  end

  def belongs_association?(klass)
    klass.eql? MongoMapper::Plugins::Associations::BelongsToAssociation
  end
end

RSpec::Matchers.define :has_many do |collection, options|
  match do |model|
    options ||= {}
    reflection = model.class.associations[collection]
    valid = !reflection.nil?
    
    if valid and options.has_key? :in
      valid = reflection.proxy_class == MongoMapper::Plugins::Associations::InArrayProxy
      valid = valid && reflection.options[:in] == options[:in]
    end

    valid
  end

  description { "should have many #{collection}" }
end
