require 'test_helper'

class AuthenticationTest < ActionDispatch::IntegrationTest
  setup do
    OmniAuth.config.mock_auth[:twitter]
  end

  test "user should be able to authenticate through Twitter" do
    open_session do
      get_via_redirect "/auth/twitter"
      assert_equal "/", path
      assert_not_nil assigns(:board), "User must have at least one board created"
      assert_not_nil assigns(:current_user), "User must be logged in"
    end
  end
end
