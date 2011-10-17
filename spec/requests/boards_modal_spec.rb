require 'spec_helper'

describe "Boards modal", :js => true do
  before { visit "/auth/twitter" }

  let(:current_user) { User.first }

  it "should open modal when clicked on Boards button" do
    page.should have_css("#boards-modal", :visible => false)
    click_on "Boards"
    page.should have_css("#boards-modal", :visible => true)
    current_user.boards.each do |item|
      page.should have_content(item.title)
    end
  end

  it "should replace text with input tag on double click" do
    # open modal and edit title
    click_on "Boards"
    element = page.find(:xpath, "//span[@class='item-title']")
    page.driver.browser.mouse.double_click(element.native)

    # workaround to trigger onblur event
    find("li.selected input").set("Modified title")
    javascript = %Q{$('li.selected input').trigger("blur")}
    page.execute_script(javascript)
    page.should have_content("Modified title")
  end
end
