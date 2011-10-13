require 'spec_helper'

describe SessionsController do
  before do
    OmniAuth.config.mock_auth[:twitter]
  end

  it "should be able to authenticate using Twitter" do
    get_via_redirect "/auth/twitter"
    path.should eql "/"
    assigns(:board).should_not be_nil
    assigns(:current_user).should_not be_nil
  end

  it "should be able to logout regardless of session" do
    get "/signout"
    session[:user_id].should be_nil
    response.should redirect_to(root_path)
  end

  it "should receive a failure message when credentials are invalid" do
    get "/auth/failure"
    response.response_code.should equal 400
    response.body.should eql "Something went wrong. Why don't you try again?"
  end
end