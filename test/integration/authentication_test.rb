require 'test_helper'

class AuthenticationTest < ActionDispatch::IntegrationTest

  context "A logged user" do
    setup do
      OmniAuth.config.mock_auth[:twitter]
    end

    should "be able to authenticate using Twitter" do
      as_logged do
        assert_equal "/", path
        assert_not_nil assigns(:board), "User must have at least one board created"
        assert_not_nil assigns(:current_user), "User must be logged in"
      end
    end

    should "be able to logout regardless of session" do
      get "/signout"
      assert_nil session[:user_id]
      assert_response :redirect
    end
  end

  test "should get failure message when credentials are invalid" do
    get "/auth/failure"
    assert_response :bad_request
    assert_equal @response.body, "Something went wrong. Why don't you try again?"
  end

end
