require 'spec_helper'

describe "Sharing settings popover", :js => true do
  before { visit "/auth/twitter" }

  it "should open popover when clicked on share" do
    click_on "Share"
    page.should have_css(".popover", :visible => true)
  end

  it "should hide popover when clicked on body" do
    click_on "Share"
    page.should have_css(".popover", :visible => true)
    page.find("body").click
    page.should have_css(".popover", :visible => false)
  end

  it "should be able to mark as public" do
    click_on "Share"
    page.should have_css("#share-public")
    check("share-public")
  end

  describe "Collaboration" do
    let(:another_user) { Factory :user }
    let(:current_user) { User.first }
    let(:board) { current_user.boards.first }
    
    it "should be able to invite a user" do
      # simulate enter key
      javascript = %Q{
        e = jQuery.Event("keypress");
        e.which = 13; 
        e.keyCode = 13;
        e.currentTarget = $("#username").get(0);
        $("#username").trigger(e);
      }

      click_on "Share"
      page.should have_css("#username")
      find("#username").set(another_user.nickname)
      page.execute_script(javascript)
      page.should have_css(".user-item")
    end

    it "should be able to remove a user" do
      board.collaborators << another_user
      board.save

      visit root_path
      click_on "Share"
      find(".delete-collaboration").click
      page.should have_no_css(".user-item")
    end
  end
end
