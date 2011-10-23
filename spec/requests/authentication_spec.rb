require 'spec_helper'

describe "Sessions" do
  before { OmniAuth.config.mock_auth[:twitter] }

  describe "GET /auth/twitter" do
    it "should authenticate through Twitter" do
      get_via_redirect "/auth/twitter"
      path.should eql root_path
      assigns(:board).should_not be_nil
      assigns(:current_user).should_not be_nil
    end
  end

  describe "GET /signout" do
    it "should logout regardless of session state" do
      get signout_path
      session[:user_id].should be_nil
      response.should redirect_to(root_path)
    end
  end

  describe "GET /auth/failure" do
    it "should return a failure message" do
      get auth_failure_path
      response.status.should be(400)
      response.body.should eql "Something went wrong. Why don't you try again?"
    end
  end

  describe "Sign in with Twitter", :js => true do
    it "should sign in when clicked on link" do
      visit root_path
      click_on "Sign in with Twitter"
      page.should have_css("a.profile img")
      page.should have_content("Jen Hawkins")
      page.should have_content("Sign out")
    end
  end
end
