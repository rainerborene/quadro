require 'spec_helper'

describe "Sessions", type: :feature, js: true do
  describe "GET /signout" do
    it "should logout regardless of session state" do
      visit signout_path
      expect(page).to have_content("Sign in with Twitter")
    end
  end

  describe "Sign in with Twitter" do
    it "should sign in when clicked on link" do
      visit root_path
      click_on "Sign in with Twitter"
      expect(page).to have_css("a.profile img")
      expect(page).to have_content("Jen Hawkins")
    end
  end
end
