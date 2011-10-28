require 'spec_helper'

describe "Stickies feature", :js => true do
  before { visit "/auth/twitter" }

  describe "Create a new sticky note" do
    it "when clicked on new note button" do
      click_on "New Note"
      page.should have_css(".stickies .sticky")
    end

    it "when double clicked on body element" do
      body = page.find("body")
      page.driver.browser.mouse.double_click(body.native)
      page.should have_css(".stickies .sticky")
    end
  end

  it "should drag note to the center of screen" do
  end

  it "should change color of note to blue" do
  end
end
