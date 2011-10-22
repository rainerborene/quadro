require 'spec_helper'

describe "Sessions" do
  before do
    OmniAuth.config.mock_auth[:twitter]
  end

  it "should be able to authenticate using Twitter" do
    get_via_redirect "/auth/twitter"
    path.should eql root_path
    assigns(:board).should_not be_nil
    assigns(:current_user).should_not be_nil
  end

  it "should be able to logout regardless of session" do
    get signout_path
    session[:user_id].should be_nil
    response.should redirect_to(root_path)
  end

  context "when credentials are invalid" do 
    it "should receive a failure message " do
      get auth_failure_path
      response.status.should be(400)
      response.body.should eql "Something went wrong. Why don't you try again?"
    end
  end

  describe "Sign in with Twitter", :js => true do
    it "should sign in when clicked" do
      visit root_path
      click_on "Sign in with Twitter"
      page.should have_css("a.profile img")
      page.should have_content("Jen Hawkins")
      page.should have_content("Sign out")
    end
  end
end
