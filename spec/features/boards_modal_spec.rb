require 'spec_helper'

describe "Boards modal", js: true do
  before { visit "/auth/twitter" }

  let(:current_user) { User.first }

  it "should open modal when clicked on boards" do
    expect(page).to have_css("#boards-modal", visible: false)
    click_on "Boards"
    expect(page).to have_css("#boards-modal", visible: true)
    current_user.boards.each do |item|
      expect(page).to have_content(item.title)
    end
  end

  it "should hide modal when clicked on overlay mask" do
    click_on "Boards"
    find(".modal-backdrop").click
    expect(page).to have_css("#boards-modal", visible: false)
  end

  it "should hide modal when clicked on close icon" do
    click_on "Boards"
    find(".close").click
    expect(page).to have_css("#boards-modal", visible: false)
  end

  # it "should replace text with input tag on double click" do
  #   # open modal and edit title
  #   click_on "Boards"

  #   page.execute_script "$('span.item-title').first().trigger('dblclick');"

  #   # workaround to trigger onblur event
  #   find("input").set("Modified title")
  #   page.execute_script "$('li.selected input').trigger('blur')"
  #   expect(page).to have_content("Modified title")
  # end

  # it "should create an entry when clicked on new button" do
  #   click_on "Boards"
  #   find(".new-board").click
  #   find("li.selected input").set("Kangaroo Jack")
  #   javascript = %Q{$('li.selected input').trigger("blur")}
  #   page.execute_script(javascript)
  #   expect(find("li.selected expect(span.item-title")).to have_content("Kangaroo Jack")
  # end

  # it "should load stickies and close modal when clicked on open" do
  #   click_on "Boards"

  #   expect(page).to have_css(".open-board[disabled]")
  #   expect(page).to have_css(".remove-board[disabled]")
  #   find(".board-list li:first-child").click
  #   expect(page).to have_no_css(".open-board[disabled]")
  #   expect(page).to have_no_css(".remove-board[disabled]")

  #   click_button "Open"
  #   expect(page).to have_css("#boards-modal", :visible => false)
  # end
end
