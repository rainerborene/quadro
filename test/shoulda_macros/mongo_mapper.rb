class Test::Unit::TestCase
  class << self
    def should_be_valid(type)
      should "be valid when new" do
        assert_kind_of type, subject
        assert subject.valid?
      end
    end

    def should_validate_presence_of(attr)
      should "require #{attr} to be set" do
        subject.send("#{attr}=", nil)
        assert subject.invalid?
      end
    end

    def should_have_default_value(attr, value)
      klass = self.name.gsub(/Test/, '').constantize
      should "have default value of '#{value}' for #{attr}" do
        assert_equal klass.new.send(attr), value, "#{klass} does not have a default value of '#{value}' for '#{attr}'"
      end
    end

    def should_have_attr_protected(attr)
      klass = self.name.gsub(/Test/, '').constantize
      should "have #{attr} attribute protected" do
        assert klass.protected_attributes.include? attr
      end
    end

    def should_have_key(attr, type)
      should "have #{attr} attribute of type #{type.name}" do
        assert subject.respond_to? attr
        assert_equal subject.class.keys[attr.to_s], MongoMapper::Plugins::Keys::Key.new(attr, type)
      end
    end
  end
end
