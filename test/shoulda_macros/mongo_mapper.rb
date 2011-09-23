class Test::Unit::TestCase
  class << self
    def should_validate_presence_of(attr)
      should "require #{attr} to be set" do
        subject.send("#{attr}=", nil)
        assert subject.invalid?
      end
    end

    def should_guarantee_value_of(attr, value)
      should "set #{attr} to #{value} by default" do
        assert_equal subject.send(attr), value
        assert subject.valid?
      end
    end

    def should_has_many(attr, options={})
      through = options[:in]
      description = "has many #{attr}"
      description << " through #{through}" unless through.nil?
      should(description) do
        assert_kind_of Array, subject.send(through || attr)
        assert_not_nil subject.send(attr)
      end
    end
  end
end
