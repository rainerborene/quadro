require 'spec_helper'

describe "Stickies feature", js: true do
  before { visit "/auth/twitter" }

  describe "Create a new sticky note" do
    it "when clicked on new note button" do
      click_on "New Note"
      expect(page).to have_css(".stickies .sticky")
    end

    it "when double clicked on body element" do
      page.execute_script "$(document.body).dblclick();"
      expect(page).to have_css(".stickies .sticky")
    end
  end
end
