module ApplicationHelper
  def current_user_session
    output = { 
      :authenticated => signed_in?,
      :stickies => Sticky.count,
      :boards => Board.count
    }
    output.merge!(current_user.serializable_hash) if signed_in?
    output.to_json.html_safe
  end

  def app_data
    data = {}
    if signed_in? or @readonly
      data["data-readonly"] = (@readonly || false).to_s
      data["data-board-id"] = @board.id
    end
    data
  end
end
