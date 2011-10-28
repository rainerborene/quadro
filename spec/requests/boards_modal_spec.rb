require 'spec_helper'

describe "Boards modal", :js => true do
  before { visit "/auth/twitter" }

  let(:current_user) { User.first }

  it "should open modal when clicked on boards" do
    page.should have_css("#boards-modal", :visible => false)
    click_on "Boards"
    page.should have_css("#boards-modal", :visible => true)
    current_user.boards.each do |item|
      page.should have_content(item.title)
    end
  end
  
  it "should hide modal when clicked on overlay mask" do
    click_on "Boards"
    find(".modal-backdrop").click
    page.should have_css("#boards-modal", :visible => false)
  end

  it "should hide modal when clicked on close icon" do
    click_on "Boards"
    find(".close").click
    page.should have_css("#boards-modal", :visible => false)
  end

  it "should replace text with input tag on double click" do
    # open modal and edit title
    click_on "Boards"
    element = page.find("span.item-title")
    page.driver.browser.mouse.double_click(element.native)

    # workaround to trigger onblur event
    find("li.selected input").set("Modified title")
    javascript = %Q{$('li.selected input').trigger("blur")}
    page.execute_script(javascript)
    find("li.selected span.item-title").should have_content("Modified title")
  end

  it "should create an entry when clicked on new button" do
    click_on "Boards"
    click_on "New"
    find("li.selected input").set("Kangaroo Jack")
    javascript = %Q{$('li.selected input').trigger("blur")}
    page.execute_script(javascript)
    find("li.selected span.item-title").should have_content("Kangaroo Jack")
  end

  it "should load stickies and close modal when clicked on open" do
    click_on "Boards"

    page.should have_css(".open-board[disabled]")
    page.should have_css(".remove-board[disabled]")
    find(".board-list li:first-child").click
    page.should have_no_css(".open-board[disabled]")
    page.should have_no_css(".remove-board[disabled]")

    click_button "Open"
    page.should have_css("#boards-modal", :visible => false)
  end
end
